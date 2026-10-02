# Auth (draft, not wired yet)

Registration, login and the current user.

- `useAuthStore()` — `token`, `user`, `isLoggedIn`, `register()`, `login()`, `logout()`, `restore()`, `updateProfile()`
- `AuthForm` — pixel login / sign up form

The JWT lives in `localStorage` (`apelsini:token`) and is handed to the HTTP client from `app/integrations/backend.js`.
Backend endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET|PATCH /api/users/me`.
