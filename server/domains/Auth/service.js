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
    // same answer for unknown email, wrong password and Google-only accounts
    if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, password))) {
      throw createError({ statusCode: 401, message: 'Wrong email or password' })
    }
    return user
  }

  // Google profile (userinfo) -> our user: by Google id, else link the account with the same verified email, else create
  async function loginWithGoogle({ sub, email, email_verified: emailVerified, name }) {
    const linked = await prisma.user.findUnique({ where: { googleId: sub } })
    if (linked) return linked
    if (!email || !emailVerified) throw createError({ statusCode: 403, message: 'Google account has no verified email' })

    const normalized = email.toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: normalized } })
    if (existing) return prisma.user.update({ where: { id: existing.id }, data: { googleId: sub } })
    const displayName = (name || normalized.split('@')[0]).slice(0, 40)
    return prisma.user.create({ data: { email: normalized, name: displayName, googleId: sub } })
  }

  return { register, login, loginWithGoogle }
}
