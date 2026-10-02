import { conflict, unauthorized } from '../../common/utilities/httpErrors.js'
import { hashPassword, verifyPassword } from '../../common/utilities/password.js'
import { publicUser } from '../Users/index.js'

export function createAuthService({ prisma, signToken }) {
  const session = (user) => ({ token: signToken({ sub: user.id }), user: publicUser(user) })

  async function register({ email, password, name }) {
    const normalized = email.toLowerCase()
    if (await prisma.user.findUnique({ where: { email: normalized } })) {
      throw conflict('This email is already registered')
    }
    const user = await prisma.user.create({
      data: { email: normalized, name, passwordHash: await hashPassword(password) },
    })
    return session(user)
  }

  async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    // same answer for unknown email and wrong password
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw unauthorized('Wrong email or password')
    }
    return session(user)
  }

  return { register, login }
}
