# Apelsini API

Nitro server routes inside the Nuxt app, Prisma 7 (PostgreSQL via `@prisma/adapter-pg`), session cookie from
`nuxt-auth-utils`. Same FEOD layout as the frontend: `common → domains → app`.

```
api/                 routes (app layer: wires domains with prisma and the session)
  health.get           GET /api/health
  auth/                POST /api/auth/register, /login → user (sets the session cookie), POST /api/auth/logout,
                       GET /api/auth/google (OAuth: to Google and back, then redirect to / or /?login=failed)
  users/               GET /api/users/me, PATCH /api/users/me
  timer/               GET /api/timer, PUT /api/timer (last write wins, 409 + newer state on conflict)
  sessions.post        POST /api/sessions
  stats/summary.get    GET /api/stats/summary?from=&to=
app/integrations/    prisma (client singleton), auth (requireUserId)
domains/             one per domain, public API in index.js: Auth, Users, Timer, Stats (service + zod schemas)
common/utilities/    days, validate
```

`nuxt-auth-utils` also serves `GET|DELETE /api/_auth/session`; the client restores the user from `GET` on start.

Domains live in `domains/`, not `modules/`: Nitro loads everything in `server/modules/` as its own build modules.

## Design notes

- **Google login**: a Google account is matched by its `sub` (`User.googleId`); on the first login it is linked to
  the existing user with the same verified email, otherwise a user without a password is created.
  Credentials: `NUXT_OAUTH_GOOGLE_CLIENT_ID` / `NUXT_OAUTH_GOOGLE_CLIENT_SECRET`.
- **Auth**: scrypt password hashes, the user is kept in a sealed httpOnly cookie (30 days, `NUXT_SESSION_PASSWORD`),
  so the client never handles a token. Later: rate limiting on register/login (on Vercel an in-memory limiter is
  per instance, so it needs Vercel Firewall or a shared store), email confirmation, password reset.
- **Validation**: zod schemas per domain; a bad body or query answers 400 with a readable `message`.
- **Timer sync**: the client sends its whole `snapshot()` with `updatedAt` (client ms). A save older than the stored one
  gets `409 { message, state }` and the client applies the newer state.
- **Stats**: every finished or skipped phase is a `Session` with a client-generated `clientId` (retries are safe).
  `day` is the user's local date from the client, so per-day stats need no timezone math on the server.
  An orange = a completed focus session.
