# Apelsini server (draft)

Not deployed and not used by the frontend yet. Fastify + Prisma (PostgreSQL), same FEOD layout as the frontend:
`app` (start, config, integrations) → `modules` (one per domain, public API in `index.js`) → `common` (small helpers, no index files).

```
src/
  app/            entry.js, server.js, config.js, integrations/ (prisma, jwt auth)
  modules/
    Auth/         POST /api/auth/register, POST /api/auth/login → { token, user }
    Users/        GET /api/users/me, PATCH /api/users/me
    Timer/        GET /api/timer, PUT /api/timer (last write wins, 409 + newer state on conflict)
    Stats/        POST /api/sessions, GET /api/stats/summary?from=&to=
  common/utilities/  httpErrors, password, days
prisma/schema.prisma  User, TimerState, Session
```

## Run locally

```sh
cd server
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npm install
npm run db:migrate            # creates the tables
npm run dev                   # http://localhost:3000/health
```

Then in the frontend `.env.local`: `VITE_BACKEND=on` and `VITE_API_URL=http://localhost:3000/api`,
and call `connectBackend()` from `src/app/integrations/backend.js` in `src/app/entry.js`.

## Design notes

- **Auth**: bcrypt password hashes, JWT (30 days) in the `Authorization` header, 10 req/min rate limit on register/login.
  Later: refresh tokens in an httpOnly cookie, email confirmation, password reset.
- **Timer sync**: the client sends its whole `snapshot()` with `updatedAt` (client ms). A save older than the stored one
  gets `409 { state }` and the client applies the newer state.
- **Stats**: every finished or skipped phase is a `Session` with a client-generated `clientId` (retries are safe).
  `day` is the user's local date from the client, so per-day stats need no timezone math on the server.
  An orange = a completed focus session.
