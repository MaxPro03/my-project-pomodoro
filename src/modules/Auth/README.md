# Auth

Registration, login and the current user.

- `useAuthStore()` — `user`, `isLoggedIn`, `register()`, `login()`, `logout()`, `forget()` (drop the user locally), `restore()`, `updateProfile()`
- `AuthForm` — pixel login / sign up form

The session is an httpOnly cookie set by the server, so there is no token on the client; `restore()` reads
`GET /api/_auth/session` on start (from `app/integrations/backend.client.js`). Not shown on the page yet.
Backend endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET|PATCH /api/users/me`.
