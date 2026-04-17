import { randomUUID } from 'node:crypto';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import {
  DEFAULT_SITE_CONFIG,
  SITE_SETTINGS_ID,
  mergeSiteConfig,
  type SiteConfig,
} from './siteDefaults';

const SESSION_DAYS = 14;

function dbPath(): string {
  const raw = process.env.SQLITE_PATH;
  if (raw && raw.trim()) return path.resolve(raw.trim());
  return path.join(process.cwd(), 'data', 'app.db');
}

export function openDb(): Database.Database {
  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  migrate(db);
  seedInitialAdmin(db);
  const empty = db.prepare('select count(*) as c from site_settings').get() as { c: number };
  if (empty.c === 0) {
    db.prepare(
      'insert into site_settings (id, config_json, updated_at) values (?, ?, datetime(\'now\'))'
    ).run(SITE_SETTINGS_ID, JSON.stringify(DEFAULT_SITE_CONFIG));
  }
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    create table if not exists users (
      id text primary key,
      email text not null unique collate nocase,
      password_hash text not null,
      role text not null check (role in ('admin', 'editor', 'viewer')),
      created_at text default (datetime('now'))
    );

    create table if not exists sessions (
      id text primary key,
      user_id text not null references users(id) on delete cascade,
      expires_at integer not null
    );
    create index if not exists sessions_expires_idx on sessions(expires_at);

    create table if not exists site_settings (
      id text primary key,
      config_json text not null,
      updated_at text default (datetime('now'))
    );

    create table if not exists oauth_states (
      state text primary key,
      mode text not null check (mode in ('login', 'link')),
      user_id text references users(id) on delete cascade,
      return_path text not null,
      expires_at integer not null
    );
    create index if not exists oauth_states_expires_idx on oauth_states(expires_at);
  `);

  const cols = db.prepare('pragma table_info(users)').all() as { name: string }[];
  if (!cols.some((c) => c.name === 'google_sub')) {
    db.exec('alter table users add column google_sub text;');
    db.exec(
      'create unique index if not exists users_google_sub_key on users(google_sub) where google_sub is not null'
    );
  }
}

function seedInitialAdmin(db: Database.Database): void {
  const row = db.prepare('select count(*) as c from users').get() as { c: number };
  if (row.c > 0) return;
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      '[sqlite] No users in the database. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in a .env file (project root) so the API can create the first admin, then restart the server.'
    );
    return;
  }
  const id = randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(
    'insert into users (id, email, password_hash, role) values (?, ?, ?, ?)'
  ).run(id, email, passwordHash, 'admin');
  console.error(`[sqlite] Created initial admin user for ${email}`);
}

export function cleanupSessions(db: Database.Database): void {
  const now = Date.now();
  db.prepare('delete from sessions where expires_at < ?').run(now);
}

export function getSiteConfig(db: Database.Database): SiteConfig {
  const row = db
    .prepare('select config_json from site_settings where id = ?')
    .get(SITE_SETTINGS_ID) as { config_json: string } | undefined;
  if (!row?.config_json) return DEFAULT_SITE_CONFIG;
  try {
    return mergeSiteConfig(JSON.parse(row.config_json) as Partial<SiteConfig>);
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function saveSiteConfig(db: Database.Database, config: SiteConfig): void {
  db.prepare(
    "insert into site_settings (id, config_json, updated_at) values (?, ?, datetime('now')) " +
      'on conflict(id) do update set config_json = excluded.config_json, updated_at = excluded.updated_at'
  ).run(SITE_SETTINGS_ID, JSON.stringify(config));
}

export function createSession(db: Database.Database, userId: string): string {
  cleanupSessions(db);
  const id = randomUUID();
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  db.prepare('insert into sessions (id, user_id, expires_at) values (?, ?, ?)').run(
    id,
    userId,
    expiresAt
  );
  return id;
}

export function deleteSession(db: Database.Database, sessionId: string): void {
  db.prepare('delete from sessions where id = ?').run(sessionId);
}

export type AuthedUser = { id: string; email: string; role: 'admin' | 'editor' | 'viewer' };

export function getSessionUser(db: Database.Database, sessionId: string | undefined): AuthedUser | null {
  if (!sessionId) return null;
  cleanupSessions(db);
  const row = db
    .prepare(
      `select u.id as id, u.email as email, u.role as role
       from sessions s
       join users u on u.id = s.user_id
       where s.id = ? and s.expires_at > ?`
    )
    .get(sessionId, Date.now()) as AuthedUser | undefined;
  return row ?? null;
}

export function verifyLogin(
  db: Database.Database,
  email: string,
  password: string
): AuthedUser | null {
  const row = db
    .prepare('select id, email, password_hash, role from users where lower(email) = lower(?)')
    .get(email.trim()) as
    | { id: string; email: string; password_hash: string; role: AuthedUser['role'] }
    | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return { id: row.id, email: row.email, role: row.role };
}

export type UserRow = {
  id: string;
  email: string;
  role: AuthedUser['role'];
  password_hash: string;
  google_sub: string | null;
};

export function findUserByGoogleSub(
  db: Database.Database,
  googleSub: string
): AuthedUser | null {
  const row = db
    .prepare('select id, email, role from users where google_sub = ?')
    .get(googleSub) as AuthedUser | undefined;
  return row ?? null;
}

export function findUserByEmail(db: Database.Database, email: string): UserRow | null {
  const row = db
    .prepare(
      'select id, email, role, password_hash, google_sub from users where lower(email) = lower(?)'
    )
    .get(email.trim()) as UserRow | undefined;
  return row ?? null;
}

export function getUserById(db: Database.Database, id: string): UserRow | null {
  const row = db
    .prepare('select id, email, role, password_hash, google_sub from users where id = ?')
    .get(id) as UserRow | undefined;
  return row ?? null;
}

export type ListedUser = {
  id: string;
  email: string;
  role: AuthedUser['role'];
  googleLinked: boolean;
  createdAt: string;
};

export function listUsers(db: Database.Database): ListedUser[] {
  const rows = db
    .prepare('select id, email, role, google_sub, created_at from users order by email collate nocase')
    .all() as {
      id: string;
      email: string;
      role: AuthedUser['role'];
      google_sub: string | null;
      created_at: string | null;
    }[];
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    googleLinked: Boolean(r.google_sub),
    createdAt: r.created_at ?? '',
  }));
}

export function countUsersWithRole(db: Database.Database, role: AuthedUser['role']): number {
  const row = db.prepare('select count(*) as c from users where role = ?').get(role) as {
    c: number;
  };
  return row.c;
}

export function deleteSessionsForUser(db: Database.Database, userId: string): void {
  db.prepare('delete from sessions where user_id = ?').run(userId);
}

export function createUserWithPassword(
  db: Database.Database,
  email: string,
  password: string,
  role: AuthedUser['role']
): { ok: true; user: AuthedUser } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) return { ok: false, error: 'Valid email required' };
  if (findUserByEmail(db, normalized)) return { ok: false, error: 'Email already in use' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters' };
  const id = randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);
  try {
    db.prepare('insert into users (id, email, password_hash, role) values (?, ?, ?, ?)').run(
      id,
      normalized,
      passwordHash,
      role
    );
  } catch {
    return { ok: false, error: 'Could not create user' };
  }
  return { ok: true, user: { id, email: normalized, role } };
}

type AdminUserMutationResult = { ok: true } | { ok: false; error: string };

export function updateUserAsAdmin(
  db: Database.Database,
  targetId: string,
  opts: { role?: AuthedUser['role']; password?: string }
): AdminUserMutationResult {
  const user = getUserById(db, targetId);
  if (!user) return { ok: false, error: 'User not found' };

  const newRole = opts.role !== undefined ? opts.role : user.role;
  if (user.role === 'admin' && newRole !== 'admin') {
    if (countUsersWithRole(db, 'admin') <= 1) {
      return { ok: false, error: 'Cannot remove the last site admin' };
    }
  }

  if (opts.password !== undefined) {
    if (opts.password.length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters' };
    }
    const passwordHash = bcrypt.hashSync(opts.password, 10);
    if (opts.role !== undefined) {
      db.prepare('update users set password_hash = ?, role = ? where id = ?').run(
        passwordHash,
        opts.role,
        targetId
      );
    } else {
      db.prepare('update users set password_hash = ? where id = ?').run(passwordHash, targetId);
    }
    deleteSessionsForUser(db, targetId);
    return { ok: true };
  }

  if (opts.role !== undefined) {
    db.prepare('update users set role = ? where id = ?').run(opts.role, targetId);
  }
  return { ok: true };
}

export function deleteUserAsAdmin(
  db: Database.Database,
  targetId: string,
  actorId: string
): AdminUserMutationResult {
  if (targetId === actorId) return { ok: false, error: 'Cannot delete your own account' };
  const row = getUserById(db, targetId);
  if (!row) return { ok: false, error: 'User not found' };
  if (row.role === 'admin' && countUsersWithRole(db, 'admin') <= 1) {
    return { ok: false, error: 'Cannot delete the last site admin' };
  }
  db.prepare('delete from users where id = ?').run(targetId);
  return { ok: true };
}

export function getUserGoogleSub(db: Database.Database, userId: string): string | null {
  const row = db
    .prepare('select google_sub from users where id = ?')
    .get(userId) as { google_sub: string | null } | undefined;
  return row?.google_sub ?? null;
}

export function linkGoogleToUser(db: Database.Database, userId: string, googleSub: string): void {
  db.prepare('update users set google_sub = ? where id = ?').run(googleSub, userId);
}

/** Password unknown — Google-only sign-in. */
export function createUserWithGoogle(
  db: Database.Database,
  email: string,
  googleSub: string,
  role: AuthedUser['role']
): void {
  const id = randomUUID();
  const passwordHash = bcrypt.hashSync(`oauth|${randomUUID()}|${googleSub}`, 10);
  db.prepare(
    'insert into users (id, email, password_hash, role, google_sub) values (?, ?, ?, ?, ?)'
  ).run(id, email.toLowerCase(), passwordHash, role, googleSub);
}

export type OAuthStateRow = {
  state: string;
  mode: 'login' | 'link';
  userId: string | null;
  returnPath: string;
  expiresAtMs: number;
};

export function insertOAuthState(db: Database.Database, row: OAuthStateRow): void {
  db.prepare(
    'insert into oauth_states (state, mode, user_id, return_path, expires_at) values (?, ?, ?, ?, ?)'
  ).run(row.state, row.mode, row.userId, row.returnPath, row.expiresAtMs);
}

export function consumeOAuthState(db: Database.Database, state: string): OAuthStateRow | null {
  cleanupOAuthStates(db);
  const raw = db
    .prepare('select state, mode, user_id, return_path, expires_at from oauth_states where state = ?')
    .get(state) as
    | {
        state: string;
        mode: string;
        user_id: string | null;
        return_path: string;
        expires_at: number;
      }
    | undefined;
  if (!raw) return null;
  if (raw.expires_at < Date.now()) {
    db.prepare('delete from oauth_states where state = ?').run(state);
    return null;
  }
  db.prepare('delete from oauth_states where state = ?').run(state);
  return {
    state: raw.state,
    mode: raw.mode as 'login' | 'link',
    userId: raw.user_id,
    returnPath: raw.return_path,
    expiresAtMs: raw.expires_at,
  };
}

export function cleanupOAuthStates(db: Database.Database): void {
  const now = Date.now();
  db.prepare('delete from oauth_states where expires_at < ?').run(now);
}
