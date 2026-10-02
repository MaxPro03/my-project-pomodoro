import { http } from '@/common/utilities/http'

/** @typedef {{ id: string, email: string, name: string, timezone: string, createdAt: string }} User */
/** @typedef {{ token: string, user: User }} AuthResponse */

/** @returns {Promise<AuthResponse>} */
export const register = ({ email, password, name }) =>
  http('/auth/register', { method: 'POST', body: { email, password, name } })

/** @returns {Promise<AuthResponse>} */
export const login = ({ email, password }) => http('/auth/login', { method: 'POST', body: { email, password } })

/** @returns {Promise<User>} */
export const fetchMe = () => http('/users/me')

/** @returns {Promise<User>} */
export const updateMe = (changes) => http('/users/me', { method: 'PATCH', body: changes })
