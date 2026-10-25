import { createError } from 'h3'

// password hashing comes in from app (nuxt-auth-utils), the service only checks credentials
export function createAuthService({ prisma, hashPassword, verifyPassword }) {
  async function register({ email, password, name }) {
    const normalized = email.toLowerCase()
    if (await prisma.user.findUnique({ where: { email: normalized } })) {
      throw createError({ statusCode: 409, message: 'This email is already registered' })
    }
    return prisma.user.create({ data: { email: normalized, name, passwordHash: await hashPassword(password) } })
  }

  async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    // same answer for unknown email and wrong password
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      throw createError({ statusCode: 401, message: 'Wrong email or password' })
    }
    return user
  }

  return { register, login }
}
