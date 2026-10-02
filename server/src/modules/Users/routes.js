import { notFound } from '../../common/utilities/httpErrors.js'
import { publicUser } from './publicUser.js'

const updateMeSchema = {
  body: {
    type: 'object',
    minProperties: 1,
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 40 },
      timezone: { type: 'string', maxLength: 64 },
    },
  },
}

export async function usersRoutes(app) {
  app.addHook('onRequest', app.authenticate)

  app.get('/me', async (request) => {
    const user = await app.prisma.user.findUnique({ where: { id: request.user.sub } })
    if (!user) throw notFound('User not found')
    return publicUser(user)
  })

  app.patch('/me', { schema: updateMeSchema }, async (request) => {
    const user = await app.prisma.user.update({ where: { id: request.user.sub }, data: request.body })
    return publicUser(user)
  })
}
