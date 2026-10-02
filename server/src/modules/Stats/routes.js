import { recordSessionSchema, summarySchema } from './schemas.js'
import { createStatsService } from './service.js'

export async function statsRoutes(app) {
  const stats = createStatsService({ prisma: app.prisma })
  app.addHook('onRequest', app.authenticate)

  app.post('/sessions', { schema: recordSessionSchema }, async (request, reply) => {
    await stats.recordSession(request.user.sub, request.body)
    return reply.status(204).send()
  })

  app.get('/stats/summary', { schema: summarySchema }, (request) => stats.summary(request.user.sub, request.query))
}
