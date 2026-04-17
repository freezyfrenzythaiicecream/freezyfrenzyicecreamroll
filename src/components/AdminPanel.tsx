import React, { useCallback, useEffect, useState } from 'react';
import { LogOut, Settings2, UserCog, X } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth, type UserRole } from '../context/AuthContext';
import type { SiteConfig } from '../siteConfig';

type ListedTeamUser = {
  id: string;
  email: string;
  role: UserRole;
  googleLinked: boolean;
  createdAt: string;
};

type SectionToggleKey = Exclude<keyof SiteConfig, 'announcement' | 'imageOverrides'>;

const sectionFields: { key: SectionToggleKey; label: string }[] = [
  { key: 'showHero', label: 'Hero (home)' },
  { key: 'showMenu', label: 'Menu' },
  { key: 'showAbout', label: 'About' },
  { key: 'showWishingWall', label: 'Wishing wall' },
  { key: 'showGallery', label: 'Gallery' },
  { key: 'showContact', label: 'Contact' },
  { key: 'showHotBeveragePopup', label: 'Hot beverage popup' },
];

/**
 * Site admin UI: open with URL hash `#admin`.
 * Only `admin` and `editor` roles may use the panel; `viewer` accounts are turned away.
 */
const AdminPanel: React.FC = () => {
  const { config, updateConfig, resetConfig, remoteReady, saveError, clearSaveError } =
    useSiteConfig();
  const {
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
  } = useAuth();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [teamUsers, setTeamUsers] = useState<ListedTeamUser[] | null>(null);
  const [teamUsersError, setTeamUsersError] = useState<string | null>(null);
  const [teamUsersLoading, setTeamUsersLoading] = useState(false);
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamPassword, setNewTeamPassword] = useState('');
  const [newTeamRole, setNewTeamRole] = useState<UserRole>('editor');
  const [creatingTeamUser, setCreatingTeamUser] = useState(false);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});

  const syncOpenFromHash = useCallback(() => {
    setOpen(window.location.hash === '#admin');
  }, []);

  useEffect(() => {
    syncOpenFromHash();
    window.addEventListener('hashchange', syncOpenFromHash);
    return () => window.removeEventListener('hashchange', syncOpenFromHash);
  }, [syncOpenFromHash]);

  useEffect(() => {
    if (!open) clearSaveError();
  }, [open, clearSaveError]);

  useEffect(() => {
    if (!open) return;
    const stored = sessionStorage.getItem('admin_oauth_err');
    if (stored) {
      setLoginError(stored);
      sessionStorage.removeItem('admin_oauth_err');
    }
  }, [open]);

  useEffect(() => {
    if (!user || profileLoading || role !== 'viewer') return;
    if (window.location.hash !== '#admin') return;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setOpen(false);
  }, [user, profileLoading, role]);

  const loadTeamUsers = useCallback(async () => {
    if (!canManageUsers || !apiOnline) return;
    setTeamUsersLoading(true);
    setTeamUsersError(null);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      const data = (await res.json()) as { users?: ListedTeamUser[]; error?: string };
      if (!res.ok) {
        setTeamUsersError(data.error ?? 'Could not load team accounts');
        setTeamUsers(null);
        return;
      }
      setTeamUsers(data.users ?? []);
    } catch {
      setTeamUsersError('Could not load team accounts');
      setTeamUsers(null);
    } finally {
      setTeamUsersLoading(false);
    }
  }, [canManageUsers, apiOnline]);

  useEffect(() => {
    if (open && canManageUsers && apiOnline) void loadTeamUsers();
  }, [open, canManageUsers, apiOnline, loadTeamUsers]);

  const closePanel = () => {
    setOpen(false);
    setLoginError(null);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!apiOnline) {
      setLoginError('Start the API server (npm run dev includes it) or deploy the full app.');
      return;
    }
    setSigningIn(true);
    const { error } = await signIn(email.trim(), password);
    setSigningIn(false);
    setPassword('');
    if (error) setLoginError(error);
  };

  const handleLogout = async () => {
    await signOut();
    closePanel();
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all toggles and the announcement to defaults? This updates the live site for all visitors.'
      )
    ) {
      resetConfig();
    }
  };

  const handleTeamRoleChange = async (userId: string, nextRole: UserRole) => {
    setTeamUsersError(null);
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: nextRole }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setTeamUsersError(data.error ?? 'Could not update role');
      void loadTeamUsers();
      return;
    }
    if (userId === user?.id) await refreshProfile();
    void loadTeamUsers();
  };

  const handleSetTeamPassword = async (userId: string) => {
    const pw = passwordDrafts[userId] ?? '';
    if (pw.length < 8) {
      setTeamUsersError('New password must be at least 8 characters');
      return;
    }
    setTeamUsersError(null);
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setTeamUsersError(data.error ?? 'Could not update password');
      return;
    }
    setPasswordDrafts((d) => ({ ...d, [userId]: '' }));
    if (userId === user?.id) {
      await signOut();
      closePanel();
      return;
    }
    void loadTeamUsers();
  };

  const handleCreateTeamUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamUsersError(null);
    setCreatingTeamUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newTeamEmail.trim(),
          password: newTeamPassword,
          role: newTeamRole,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setTeamUsersError(data.error ?? 'Could not create user');
        return;
      }
      setNewTeamEmail('');
      setNewTeamPassword('');
      setNewTeamRole('editor');
      void loadTeamUsers();
    } finally {
      setCreatingTeamUser(false);
    }
  };

  const handleDeleteTeamUser = async (row: ListedTeamUser) => {
    if (row.id === user?.id) return;
    if (
      !window.confirm(
        `Remove ${row.email} from team accounts? They will no longer be able to sign in.`
      )
    ) {
      return;
    }
    setTeamUsersError(null);
    const res = await fetch(`/api/users/${encodeURIComponent(row.id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setTeamUsersError(data.error ?? 'Could not remove user');
      return;
    }
    void loadTeamUsers();
  };

  const settingsLocked = Boolean(
    apiOnline && (!remoteReady || !!(user && profileLoading))
  );

  if (!open) return null;

  if (user && !profileLoading && role === 'viewer') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onClick={closePanel}
      />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200"
        role="dialog"
        aria-labelledby="admin-panel-title"
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center gap-2 text-gray-900">
            <Settings2 className="w-5 h-5 text-yellow-600" aria-hidden />
            <h2 id="admin-panel-title" className="text-lg font-semibold">
              Site admin
            </h2>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className="rounded-full p-2 text-gray-600 hover:bg-white/80 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-sm text-gray-600">
                Sign in with a team account. Only users with the <strong>editor</strong> or{' '}
                <strong>admin</strong> role can change the public site. Data is stored in SQLite on
                the server.
              </p>
              {!apiOnline && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No API detected at <code className="text-xs bg-white/80 px-1 rounded">/api</code>.
                  Run <code className="text-xs bg-white/80 px-1 rounded">npm run dev</code> (Vite +
                  API) or open the deployed app.
                </p>
              )}
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                  disabled={!apiOnline || signingIn}
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                  disabled={!apiOnline || signingIn}
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600" role="alert">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2.5 transition-colors disabled:opacity-50"
                disabled={!apiOnline || signingIn}
              >
                {signingIn ? 'Signing in…' : 'Sign in'}
              </button>
              {googleOAuth ? (
                <a
                  href={`/api/auth/google?next=${encodeURIComponent('/#admin')}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </a>
              ) : null}
            </form>
          ) : (
            <div className="space-y-6">
              {profileLoading ? (
                <p className="text-sm text-gray-600">Loading your permissions…</p>
              ) : null}

              {settingsLocked ? (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Loading site settings from the server… controls will enable in a moment.
                </p>
              ) : null}

              {saveError ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  Could not save: {saveError}
                </p>
              ) : null}

              <p className="text-xs text-gray-500">
                {user?.email} · role <span className="font-mono">{role}</span>
                {user?.googleLinked ? (
                  <span className="ml-2 text-green-700">· Google linked</span>
                ) : null}
              </p>

              {googleOAuth && canEditSite && !user?.googleLinked ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
                  <p className="mb-2">
                    Link the same Google account as your email{' '}
                    <span className="font-medium text-gray-900">{user?.email}</span> to sign in with
                    Google next time. Google&apos;s email must match.
                  </p>
                  <a
                    href={`/api/auth/google/link?next=${encodeURIComponent('/#admin')}`}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 font-medium text-gray-800 hover:bg-gray-100"
                  >
                    Link Google account
                  </a>
                </div>
              ) : null}

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-800">Visible sections</p>
                <ul className={`space-y-2 ${settingsLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                  {sectionFields.map(({ key, label }) => (
                    <li key={key}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={config[key]}
                          onChange={(e) => updateConfig({ [key]: e.target.checked })}
                          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-4 h-4"
                          disabled={settingsLocked}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={settingsLocked ? 'opacity-50 pointer-events-none' : ''}>
                <label
                  htmlFor="admin-announcement"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Announcement (optional)
                </label>
                <textarea
                  id="admin-announcement"
                  rows={3}
                  value={config.announcement}
                  onChange={(e) => updateConfig({ announcement: e.target.value })}
                  placeholder="e.g. Holiday hours: closed Dec 25."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-y min-h-[80px]"
                  disabled={settingsLocked}
                />
              </div>

              {canManageUsers && apiOnline ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-4 space-y-4">
                  <div className="flex items-center gap-2 text-gray-900">
                    <UserCog className="w-5 h-5 shrink-0 text-amber-700" aria-hidden />
                    <p className="text-sm font-semibold">Team accounts</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Invite users with email and password, set roles (admin can manage accounts;
                    editors change the public site; viewers cannot use this panel), reset passwords,
                    or remove accounts. The last admin cannot be removed or demoted.
                  </p>
                  {teamUsersError ? (
                    <p className="text-sm text-red-600" role="alert">
                      {teamUsersError}
                    </p>
                  ) : null}
                  {teamUsersLoading && !teamUsers?.length ? (
                    <p className="text-sm text-gray-600">Loading accounts…</p>
                  ) : null}
                  {teamUsers ? (
                    <div className="overflow-x-auto rounded-lg border border-amber-100/80 bg-white">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-3 py-2 font-medium normal-case">Email</th>
                            <th className="px-3 py-2 font-medium normal-case">Role</th>
                            <th className="px-3 py-2 font-medium normal-case">Password</th>
                            <th className="px-3 py-2 font-medium normal-case w-20" />
                          </tr>
                        </thead>
                        <tbody>
                          {teamUsers.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 align-top">
                              <td className="px-3 py-2">
                                <div className="text-gray-900 break-all">{row.email}</div>
                                {row.googleLinked ? (
                                  <span className="text-xs text-green-700">Google linked</span>
                                ) : null}
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={row.role}
                                  onChange={(e) =>
                                    void handleTeamRoleChange(row.id, e.target.value as UserRole)
                                  }
                                  className="max-w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white"
                                  aria-label={`Role for ${row.email}`}
                                >
                                  <option value="admin">admin</option>
                                  <option value="editor">editor</option>
                                  <option value="viewer">viewer</option>
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-col gap-1 min-w-[10rem]">
                                  <input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="New password (8+)"
                                    value={passwordDrafts[row.id] ?? ''}
                                    onChange={(e) =>
                                      setPasswordDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                                    }
                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void handleSetTeamPassword(row.id)}
                                    className="text-left text-xs font-medium text-amber-900 hover:underline"
                                  >
                                    Set password
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {row.id !== user?.id ? (
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteTeamUser(row)}
                                    className="text-xs text-red-700 hover:underline"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">You</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  <form
                    onSubmit={handleCreateTeamUser}
                    className="space-y-2 rounded-lg border border-dashed border-amber-300/80 bg-white/90 px-3 py-3"
                  >
                    <p className="text-xs font-medium text-gray-800">Add account</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={newTeamEmail}
                        onChange={(e) => setNewTeamEmail(e.target.value)}
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
                      />
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Password (min 8 characters)"
                        value={newTeamPassword}
                        onChange={(e) => setNewTeamPassword(e.target.value)}
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={newTeamRole}
                        onChange={(e) => setNewTeamRole(e.target.value as UserRole)}
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 bg-white"
                        aria-label="Role for new account"
                      >
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                        <option value="viewer">viewer</option>
                      </select>
                      <button
                        type="submit"
                        disabled={creatingTeamUser}
                        className="rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-3 py-1.5 transition-colors disabled:opacity-50"
                      >
                        {creatingTeamUser ? 'Creating…' : 'Create account'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={settingsLocked}
                  className="flex-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
                >
                  Reset to defaults
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-sm font-medium py-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Changes are saved to SQLite on the server. Bookmark{' '}
                <code className="bg-gray-100 px-1 rounded">#admin</code> to reopen this panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
