import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type UserRole = 'admin' | 'editor' | 'viewer';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  googleLinked?: boolean;
};

type AuthContextValue = {
  /** True after /api/health returns OK (SQLite API is running) */
  apiOnline: boolean;
  /** Google OAuth client id/secret/public origin configured on server */
  googleOAuth: boolean;
  user: AuthUser | null;
  role: UserRole | null;
  profileLoading: boolean;
  canEditSite: boolean;
  /** Site admins can manage team accounts (roles, passwords, invites). */
  canManageUsers: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Re-fetch `/api/auth/me` (e.g. after admin changes their own role). */
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseRole(value: unknown): UserRole {
  if (value === 'admin' || value === 'editor' || value === 'viewer') return value;
  return 'viewer';
}

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) return null;
  const data = (await res.json()) as { user: AuthUser | null };
  if (!data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email,
    role: parseRole(data.user.role),
    googleLinked: Boolean(data.user.googleLinked),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [apiOnline, setApiOnline] = useState(false);
  const [googleOAuth, setGoogleOAuth] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const healthRes = await fetch('/api/health');
        const health = (await healthRes.json()) as { ok?: boolean; google?: boolean };
        if (!cancelled && health.ok) {
          setApiOnline(true);
          setGoogleOAuth(Boolean(health.google));
        } else if (!cancelled) {
          setApiOnline(false);
          setGoogleOAuth(false);
        }
      } catch {
        if (!cancelled) {
          setApiOnline(false);
          setGoogleOAuth(false);
        }
      }
      if (cancelled) return;
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const j = JSON.parse(text) as { error?: string };
        return { error: j.error ?? text };
      } catch {
        return { error: text || 'Sign-in failed' };
      }
    }
    const me = await fetchMe();
    if (me && me.role === 'viewer') {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      return { error: 'This account does not have access to the admin panel.' };
    }
    setUser(me);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const role = user?.role ?? null;
  const canEditSite = Boolean(
    user && !profileLoading && (role === 'admin' || role === 'editor')
  );
  const canManageUsers = Boolean(user && !profileLoading && role === 'admin');

  const value = useMemo(
    () => ({
      apiOnline,
      googleOAuth,
      user,
      role,
      profileLoading,
      canEditSite,
      canManageUsers,
      signIn,
      signOut,
      refreshProfile,
    }),
    [
      apiOnline,
      googleOAuth,
      user,
      role,
      profileLoading,
      canEditSite,
      canManageUsers,
      signIn,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
