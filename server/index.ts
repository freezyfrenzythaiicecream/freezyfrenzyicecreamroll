import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, normalize, resolve as pathResolve } from 'path';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import {
  openDb,
  getSiteConfig,
  saveSiteConfig,
  createSession,
  deleteSession,
  verifyLogin,
  getSessionUser,
  getUserGoogleSub,
  listUsers,
  createUserWithPassword,
  updateUserAsAdmin,
  deleteUserAsAdmin,
  type AuthedUser,
} from './db';
import { mergeSiteConfig, type SiteConfig } from './siteDefaults';
import {
  handleGoogleCallback,
  handleGoogleConfig,
  handleGoogleLinkStart,
  handleGoogleStart,
  isGoogleOAuthConfigured,
} from './googleAuth';

const COOKIE = 'ff_session';
const distDir = normalize(join(process.cwd(), 'dist'));
/** API-only process: `npm run dev` starts this alongside Vite — do not serve SPA here. */
const devApiOnly = process.env.DEV_ONLY_API === '1';

const SITE_ASSET_MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function siteAssetsRoot(): string {
  const raw = process.env.SITE_ASSETS_PATH?.trim();
  if (raw) return normalize(pathResolve(raw));
  return normalize(join(process.cwd(), 'data', 'site-assets'));
}

function safeResolvedPath(root: string, relative: string): string | null {
  const candidate = normalize(join(root, relative));
  if (!candidate.startsWith(root)) return null;
  return candidate;
}

function safeSiteAssetPath(name: string): string | null {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  const root = siteAssetsRoot();
  const candidate = normalize(join(root, name));
  if (!candidate.startsWith(root)) return null;
  return candidate;
}

function contentType(file: string): string {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  if (file.endsWith('.webp')) return 'image/webp';
  if (file.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function secureCookie(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE_COOKIE === '1';
}

const db = openDb();

const api = new Hono();

api.get('/health', (c) => c.json({ ok: true, google: isGoogleOAuthConfigured() }));

api.get('/auth/google/config', handleGoogleConfig);
api.get('/auth/google', (c) => handleGoogleStart(db, c));
api.get('/auth/google/link', (c) => handleGoogleLinkStart(db, c, getSessionUser));
api.get('/auth/google/callback', async (c) => handleGoogleCallback(db, c, createSession));

api.get('/site-config', (c) => {
  return c.json(getSiteConfig(db));
});

api.put('/site-config', async (c) => {
  const sid = getCookie(c, COOKIE);
  const user = getSessionUser(db, sid);
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  let body: Record<string, unknown>;
  try {
    body = (await c.req.json()) as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
  const current = getSiteConfig(db);
  const merged = mergeSiteConfig({ ...current, ...(body as Partial<SiteConfig>) });
  saveSiteConfig(db, merged);
  return c.json(merged);
});

api.get('/site-assets/:name', (c) => {
  const name = c.req.param('name');
  const target = safeSiteAssetPath(name);
  if (!target || !existsSync(target) || !statSync(target).isFile()) {
    return c.body('Not found', 404);
  }
  const buf = readFileSync(target);
  return c.body(buf, 200, { 'Content-Type': contentType(target) });
});

api.post('/site-assets', async (c) => {
  const sid = getCookie(c, COOKIE);
  const user = getSessionUser(db, sid);
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  let body: Record<string, string | File>;
  try {
    body = (await c.req.parseBody()) as Record<string, string | File>;
  } catch {
    return c.json({ error: 'Invalid multipart body' }, 400);
  }
  const file = body['file'];
  if (!(file instanceof File)) {
    return c.json({ error: 'Expected file field named file' }, 400);
  }
  if (file.size > SITE_ASSET_MAX_BYTES) {
    return c.json({ error: 'File too large (max 5MB)' }, 413);
  }
  const ext = UPLOAD_MIME_TO_EXT[file.type];
  if (!ext) {
    return c.json({ error: 'Use JPEG, PNG, WebP, or GIF' }, 400);
  }
  const root = siteAssetsRoot();
  mkdirSync(root, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  writeFileSync(join(root, filename), Buffer.from(await file.arrayBuffer()));
  return c.json({ url: `/api/site-assets/${filename}` });
});

function parseRole(value: unknown): AuthedUser['role'] | null {
  if (value === 'admin' || value === 'editor' || value === 'viewer') return value;
  return null;
}

api.get('/users', (c) => {
  const sid = getCookie(c, COOKIE);
  const authed = getSessionUser(db, sid);
  if (!authed || authed.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  return c.json({ users: listUsers(db) });
});

api.post('/users', async (c) => {
  const sid = getCookie(c, COOKIE);
  const authed = getSessionUser(db, sid);
  if (!authed || authed.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  let body: { email?: string; password?: string; role?: string };
  try {
    body = (await c.req.json()) as { email?: string; password?: string; role?: string };
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
  const email = body.email?.trim();
  const password = body.password;
  const role = parseRole(body.role);
  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);
  if (!role) return c.json({ error: 'Role must be admin, editor, or viewer' }, 400);
  const result = createUserWithPassword(db, email, password, role);
  if (!result.ok) return c.json({ error: result.error }, 400);
  return c.json({
    user: { ...result.user, googleLinked: Boolean(getUserGoogleSub(db, result.user.id)) },
  });
});

api.patch('/users/:id', async (c) => {
  const sid = getCookie(c, COOKIE);
  const authed = getSessionUser(db, sid);
  if (!authed || authed.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const id = c.req.param('id');
  let body: { role?: string; password?: string };
  try {
    body = (await c.req.json()) as { role?: string; password?: string };
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
  const patch: { role?: AuthedUser['role']; password?: string } = {};
  if (body.role !== undefined) {
    const role = parseRole(body.role);
    if (!role) return c.json({ error: 'Role must be admin, editor, or viewer' }, 400);
    patch.role = role;
  }
  if (body.password !== undefined) patch.password = body.password;
  if (patch.role === undefined && patch.password === undefined) {
    return c.json({ error: 'Provide role and/or password' }, 400);
  }
  const result = updateUserAsAdmin(db, id, patch);
  if (!result.ok) {
    const status = result.error === 'User not found' ? 404 : 400;
    return c.json({ error: result.error }, status);
  }
  return c.json({ ok: true });
});

api.delete('/users/:id', (c) => {
  const sid = getCookie(c, COOKIE);
  const authed = getSessionUser(db, sid);
  if (!authed || authed.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const id = c.req.param('id');
  const result = deleteUserAsAdmin(db, id, authed.id);
  if (!result.ok) {
    const status = result.error === 'User not found' ? 404 : 400;
    return c.json({ error: result.error }, status);
  }
  return c.json({ ok: true });
});

api.get('/auth/me', (c) => {
  const sid = getCookie(c, COOKIE);
  const user = getSessionUser(db, sid);
  if (!user) return c.json({ user: null }, 200);
  const googleLinked = Boolean(getUserGoogleSub(db, user.id));
  return c.json({ user: { ...user, googleLinked } });
});

api.post('/auth/login', async (c) => {
  let body: { email?: string; password?: string };
  try {
    body = (await c.req.json()) as { email?: string; password?: string };
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);
  const user = verifyLogin(db, email, password);
  if (!user) return c.json({ error: 'Invalid email or password' }, 401);
  const sessionId = createSession(db, user.id);
  setCookie(c, COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    secure: secureCookie(),
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 14,
  });
  return c.json({ user });
});

api.post('/auth/logout', (c) => {
  const sid = getCookie(c, COOKIE);
  if (sid) deleteSession(db, sid);
  deleteCookie(c, COOKIE, { path: '/' });
  return c.json({ ok: true });
});

const app = new Hono();

app.route('/api', api);

app.use('*', async (c, next) => {
  if (!devApiOnly) return next();
  if (c.req.path.startsWith('/api')) return next();
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') return next();
  return c.html(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API only (dev)</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; }
    a { color: #0b57d0; }
  </style>
</head>
<body>
  <h1>This port is the API only</h1>
  <p>In development, open the Vite app instead:</p>
  <p><strong><a href="http://localhost:5173/">http://localhost:5173/</a></strong></p>
  <p>The browser must load that URL so scripts and styles are compiled. This server only handles
  requests under <code>/api</code> (proxied from Vite).</p>
</body>
</html>`
  );
});

app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api')) return next();
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') return next();
  const pathname = c.req.path;
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const target = safeResolvedPath(distDir, rel);
  if (target && existsSync(target) && statSync(target).isFile()) {
    const buf = readFileSync(target);
    return c.body(buf, 200, { 'Content-Type': contentType(target) });
  }
  return next();
});

const indexHtml = (() => {
  try {
    return readFileSync(join(distDir, 'index.html'), 'utf-8');
  } catch {
    return '<!doctype html><html><body>Run vite build first.</body></html>';
  }
})();

app.notFound((c) => {
  if (c.req.path.startsWith('/api')) {
    return c.json({ error: 'Not found' }, 404);
  }
  // Avoid sending index.html for missing scripts/styles/fonts (browser shows a blank page)
  if (/\.\w+$/i.test(c.req.path) && !c.req.path.toLowerCase().endsWith('.html')) {
    return c.body('Not found', 404);
  }
  return c.html(indexHtml);
});

const port = Number(process.env.PORT) || 8080;
console.error(`Server listening on ${port}`);
serve({ fetch: app.fetch, port });
