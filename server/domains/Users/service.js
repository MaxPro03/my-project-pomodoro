import { createError } from 'h3'
import { publicUser } from './publicUser.js'

export function createUsersService({ prisma }) {
  async function get(id) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw createError({ statusCode: 404, message: 'User not found' })
    return publicUser(user)
  }

  async function update(id, changes) {
    return publicUser(await prisma.user.update({ where: { id }, data: changes }))
  }

  return { get, update }
}
