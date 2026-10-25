import { http } from '@/common/utilities/http'

/** @typedef {{ id: string, email: string, name: string, timezone: string, createdAt: string }} User */

// register and login set the session cookie and answer with the user

/** @returns {Promise<User>} */
export const register = ({ email, password, name }) =>
  http('/auth/register', { method: 'POST', body: { email, password, name } })

/** @returns {Promise<User>} */
export const login = ({ email, password }) => http('/auth/login', { method: 'POST', body: { email, password } })

/** opened as a page, not fetched: it redirects to Google and back to `/` (or `/?login=failed`) */
export const GOOGLE_LOGIN_URL = '/api/auth/google'

export const logout = () => http('/auth/logout', { method: 'POST' })

/** the current session from nuxt-auth-utils, `{}` when logged out (no 401 noise on every app start) */
export const fetchSession = () => http('/_auth/session')

/** @returns {Promise<User>} */
export const fetchMe = () => http('/users/me')

/** @returns {Promise<User>} */
export const updateMe = (changes) => http('/users/me', { method: 'PATCH', body: changes })
