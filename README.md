# Freezy Frenzy Thai Ice Cream Roll

Public marketing site for **Freezy Frenzy Thai Ice Cream Roll** (Jersey Village, TX). Built with React, TypeScript, Vite, and Tailwind CSS. Section visibility and a header announcement can be managed from an **admin panel** (`#admin`). Data lives in **SQLite** on the server; sessions use HTTP-only cookies.

## Architecture

- **Frontend:** Vite + React SPA in `src/`.
- **Backend:** Node HTTP server in `server/` using [Hono](https://hono.dev/) and [better-sqlite3](https://github.com/WiseLibs/better-sqlite3).
- **Production:** One process serves `/api/*` and static files from `dist/`. **Fly.io** runs this in Docker with a **volume** for the database file.

If the API is unavailable (for example static hosting with only `dist/`), the site still loads and uses **browser `localStorage`** for toggles until an API is present.

## Prerequisites

- Node.js 20+ recommended (matches Docker image).

## Local development

```bash
npm install
npm run dev
```

This starts the API on **http://127.0.0.1:8787** and Vite on **http://localhost:5173**, with `/api` proxied to the API.

**Open http://localhost:5173 in the browser** (not 8787). Port 8787 is API-only in dev and shows an explanatory page if you open it directly.

### First admin user (SQLite)

On first startup, if the database has **no users**, the server creates an **admin** account when both are set:

| Environment variable | Description |
|----------------------|-------------|
| `INITIAL_ADMIN_EMAIL` | Email for the first admin |
| `INITIAL_ADMIN_PASSWORD` | Plain password (stored hashed) |

Example `.env` (local):

```env
INITIAL_ADMIN_EMAIL=you@example.com
INITIAL_ADMIN_PASSWORD=choose-a-strong-password
SQLITE_PATH=./data/app.db
```

The API server loads this file automatically via **`dotenv`** (see the top of `server/index.ts`). Vite also reads `.env` for the frontend, but **only the Node process had been missing those variables before**—if login always failed with “Invalid email or password” and no user existed, ensure `.env` is in the **project root** and restart `npm run dev`.

**If you started the app once without `INITIAL_ADMIN_*` set**, the database may exist with **zero users**. After fixing `.env`, restart the server; the seed runs only when the `users` table is empty.

Without these variables, create users manually (see below) or insert into SQLite.

### Sign in with Google (optional)

The admin panel supports **Google OAuth** and **linking** Google to an existing email/password account (Google’s verified email must match your site email).

1. In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth **Web application** client.
2. **Authorized redirect URIs** must include exactly:
   - Local: `http://localhost:5173/api/auth/google/callback` (browser uses Vite on **5173**, not 8787).
   - Production: `https://your-domain/api/auth/google/callback` (e.g. Fly app URL).
3. Set these environment variables (`.env` locally, or Fly secrets in production):

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `OAUTH_PUBLIC_ORIGIN` | No trailing slash: `http://localhost:5173` or `https://myapp.fly.dev` |

If any are missing, `/api/health` includes `"google": false` and the Google button is hidden.

**Linking:** Sign in with password, open `#admin`, then **Link Google account**. After linking, either sign-in method works for that user.

New users who only use Google get role `viewer` until promoted in SQLite.

### Roles

Stored in `users.role`:

| Role | Admin panel (`#admin`) |
|------|-------------------------|
| `viewer` | Cannot use the panel (session cleared if they hit `#admin`) |
| `editor` | Can edit site toggles and announcement |
| `admin` | Same as editor for now |

To add or promote users, use the SQLite CLI or any DB tool against `SQLITE_PATH` (passwords must be **bcrypt** hashes; easiest path is temporary `INITIAL_ADMIN_*` then add UI later).

## API (same origin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | `{ ok: true, google: boolean }` |
| GET | `/api/auth/google` | No | Redirect to Google (sign-in) |
| GET | `/api/auth/google/link` | Cookie (editor/admin) | Redirect to Google (link account) |
| GET | `/api/auth/google/callback` | No | OAuth redirect target |
| GET | `/api/auth/google/config` | No | `{ google: boolean }` |
| GET | `/api/site-config` | No | Current public site JSON |
| PUT | `/api/site-config` | Cookie: admin/editor | Replace merged config |
| POST | `/api/auth/login` | No | Body: `{ email, password }` |
| POST | `/api/auth/logout` | Cookie | Clears session |
| GET | `/api/auth/me` | Cookie | `{ user: { id, email, role, googleLinked } }` or `{ user: null }` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API (8787) + Vite (5173) with proxy |
| `npm run build` | Production frontend (`dist/`) — uses `cp` for `CNAME` (Unix/Git Bash on Windows) |
| `npm run build:server` | Compile `server/` → `dist-server/` |
| `npm start` | Run `node dist-server/index.js` (needs `dist/` + `SQLITE_PATH` etc.) |
| `npm run lint` | ESLint |
| `npm run deploy` | Static deploy to GitHub Pages (`gh-pages`) — **no API**; admin uses local storage only |

## Deploy (Fly.io)

1. Install [`flyctl`](https://fly.io/docs/hands-on/install-flyctl/) and log in.
2. Create **one volume per machine** in the app’s region (see `fly.toml` `primary_region`), e.g.  
   `fly volumes create sqlite_data --region iad --size 1 -n 2`
3. Set secrets (example):

   ```bash
   fly secrets set INITIAL_ADMIN_EMAIL="you@example.com" INITIAL_ADMIN_PASSWORD="…"
   ```

   `SQLITE_PATH=/data/app.db` is set in [`fly.toml`](fly.toml) via `[env]`; adjust if needed.

4. Deploy:

   ```bash
   fly deploy
   ```

The [`Dockerfile`](Dockerfile) runs `npm run build && npm run build:server` and starts Node on `PORT` (8080 internally). No Supabase or nginx required.

## Deploy (GitHub Pages)

`npm run deploy` publishes **static files only**. There is no SQLite API on Pages: the admin panel falls back to **per-browser `localStorage`** for settings.

## Security notes

- Use strong passwords; hashes use **bcrypt**.
- Sessions are **HTTP-only** cookies; in production, `NODE_ENV=production` enables `Secure` cookies.
- `PUT /api/site-config` is allowed only for **admin** and **editor** (enforced in `server/index.ts`).

## License

Private project unless otherwise noted.
