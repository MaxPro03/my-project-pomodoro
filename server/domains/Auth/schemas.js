import { z } from 'zod'

const credentials = {
  email: z.email().max(254),
  password: z.string().min(8).max(128),
}

export const registerSchema = z.strictObject({ ...credentials, name: z.string().min(1).max(40) })
export const loginSchema = z.strictObject(credentials)
