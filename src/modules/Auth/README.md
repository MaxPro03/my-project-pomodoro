# Auth

Registration, login and the current user.

- `useAuthStore()` — `user`, `isLoggedIn`, `register()`, `login()`, `logout()`, `forget()` (drop the user locally), `restore()`, `updateProfile()`
- `AccountButton` — header button: opens the login form, or shows the account and log out once logged in;
  opens itself with an error when the app is loaded with `?login=failed` (a failed Google login)
- `AuthForm` — pixel login / sign up form with "Continue with Google"

The session is an httpOnly cookie set by the server, so there is no token on the client; `restore()` reads
`GET /api/_auth/session` on start (from `app/integrations/backend.client.js`).
Google login is a plain link to `GET /api/auth/google` (server redirects to Google and back to `/`).
Backend endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET|PATCH /api/users/me`.
