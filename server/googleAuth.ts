import { randomUUID } from 'node:crypto';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type Database from 'better-sqlite3';
import type { AuthedUser } from './db';
import {
  consumeOAuthState,
  findUserByEmail,
  findUserByGoogleSub,
  insertOAuthState,
  linkGoogleToUser,
  createUserWithGoogle,
  getUserGoogleSub,
  cleanupOAuthStates,
} from './db';

const SESSION_COOKIE = 'ff_session';
const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO = 'https://www.googleapis.com/oauth2/v3/userinfo';

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      process.env.OAUTH_PUBLIC_ORIGIN?.trim()
  );
}

/** Public browser origin (e.g. http://localhost:5173 or https://yourapp.fly.dev) — must match Google redirect URI. */
export function oauthPublicOrigin(): string {
  return (process.env.OAUTH_PUBLIC_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
}

function callbackUrl(): string {
  return `${oauthPublicOrigin()}/api/auth/google/callback`;
}

function secureCookie(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIE === '1';
}

function setBrowserSession(c: Context, db: Database.Database, userId: string, createSession: (db: Database.Database, userId: string) => string) {
  const sessionId = createSession(db, userId);
  setCookie(c, SESSION_COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    secure: secureCookie(),
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 14,
  });
}

type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
};

async function exchangeCode(code: string): Promise<{ access_token: string } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = callbackUrl();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) return null;
  return { access_token: data.access_token };
}

async function fetchProfile(accessToken: string): Promise<GoogleProfile | null> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
  };
  if (!data.sub || !data.email) return null;
  return {
    sub: data.sub,
    email: data.email.trim().toLowerCase(),
    email_verified: Boolean(data.email_verified),
  };
}

function redirectWithError(c: Context, message: string) {
  const url = `${oauthPublicOrigin()}/?oauth_error=${encodeURIComponent(message)}`;
  return c.redirect(url);
}

function redirectSuccess(c: Context, returnPath: string) {
  const safe = returnPath.startsWith('/') ? returnPath : '/';
  return c.redirect(`${oauthPublicOrigin()}${safe}`);
}

/** GET /api/auth/google/config */
export function handleGoogleConfig(c: Context) {
  return c.json({ google: isGoogleOAuthConfigured() });
}

/** GET /api/auth/google — sign-in with Google */
export function handleGoogleStart(db: Database.Database, c: Context) {
  if (!isGoogleOAuthConfigured()) {
    return c.json({ error: 'Google sign-in is not configured on the server.' }, 503);
  }

  cleanupOAuthStates(db);
  const state = randomUUID();
  const nextRaw = c.req.query('next') || '/';
  const returnPath = nextRaw.startsWith('/') ? nextRaw : '/';

  insertOAuthState(db, {
    state,
    mode: 'login',
    userId: null,
    returnPath,
    expiresAtMs: Date.now() + 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: callbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });
  return c.redirect(`${GOOGLE_AUTH}?${params.toString()}`);
}

/** GET /api/auth/google/link — attach Google to current password account (email must match) */
export function handleGoogleLinkStart(
  db: Database.Database,
  c: Context,
  getSessionUser: (db: Database.Database, sessionId: string | undefined) => AuthedUser | null
) {
  if (!isGoogleOAuthConfigured()) {
    return c.json({ error: 'Google sign-in is not configured on the server.' }, 503);
  }
  const sid = getCookie(c, SESSION_COOKIE);
  const user = getSessionUser(db, sid);
  if (!user) {
    return c.json({ error: 'Sign in first, then use “Link Google account”.' }, 401);
  }
  if (user.role !== 'admin' && user.role !== 'editor') {
    return c.json({ error: 'Only editors and admins can use this panel.' }, 403);
  }
  if (getUserGoogleSub(db, user.id)) {
    return c.json({ error: 'Google is already linked to this account.' }, 409);
  }

  cleanupOAuthStates(db);
  const state = randomUUID();
  const nextRaw = c.req.query('next') || '/#admin';
  const returnPath = nextRaw.startsWith('/') ? nextRaw : '/#admin';

  insertOAuthState(db, {
    state,
    mode: 'link',
    userId: user.id,
    returnPath,
    expiresAtMs: Date.now() + 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: callbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });
  return c.redirect(`${GOOGLE_AUTH}?${params.toString()}`);
}

/** GET /api/auth/google/callback */
export async function handleGoogleCallback(
  db: Database.Database,
  c: Context,
  createSession: (db: Database.Database, userId: string) => string
) {
  if (!isGoogleOAuthConfigured()) {
    return redirectWithError(c, 'Google OAuth is not configured.');
  }

  const code = c.req.query('code');
  const state = c.req.query('state');
  const err = c.req.query('error');
  if (err) {
    return redirectWithError(c, c.req.query('error_description') || err);
  }
  if (!code || !state) {
    return redirectWithError(c, 'Missing OAuth code or state.');
  }

  const pending = consumeOAuthState(db, state);
  if (!pending) {
    return redirectWithError(c, 'Invalid or expired sign-in session. Try again.');
  }

  const tokens = await exchangeCode(code);
  if (!tokens) {
    return redirectWithError(c, 'Could not verify Google sign-in.');
  }

  const profile = await fetchProfile(tokens.access_token);
  if (!profile || !profile.email_verified) {
    return redirectWithError(c, 'Google did not return a verified email.');
  }

  if (pending.mode === 'link') {
    if (!pending.userId) {
      return redirectWithError(c, 'Invalid link request.');
    }
    const row = findUserByEmail(db, profile.email);
    if (!row || row.id !== pending.userId) {
      return redirectWithError(
        c,
        'The Google account email must match your site account email to link.'
      );
    }
    const other = findUserByGoogleSub(db, profile.sub);
    if (other && other.id !== pending.userId) {
      return redirectWithError(c, 'This Google account is already linked to another user.');
    }
    try {
      linkGoogleToUser(db, pending.userId, profile.sub);
    } catch {
      return redirectWithError(c, 'Could not link Google (this Google account may be in use).');
    }
    return redirectSuccess(c, pending.returnPath);
  }

  // login
  let user = findUserByGoogleSub(db, profile.sub);
  if (!user) {
    const byEmail = findUserByEmail(db, profile.email);
    if (byEmail) {
      if (byEmail.google_sub && byEmail.google_sub !== profile.sub) {
        return redirectWithError(
          c,
          'This email already uses a different Google account. Use password or that Google account.'
        );
      }
      if (!byEmail.google_sub) {
        linkGoogleToUser(db, byEmail.id, profile.sub);
        user = findUserByGoogleSub(db, profile.sub);
      }
    } else {
      createUserWithGoogle(db, profile.email, profile.sub, 'viewer');
      user = findUserByGoogleSub(db, profile.sub);
    }
  }

  if (!user) {
    return redirectWithError(c, 'Could not create or find your account.');
  }

  setBrowserSession(c, db, user.id, createSession);
  return redirectSuccess(c, pending.returnPath);
}
