import { putTimerSchema } from './schemas.js'
import { createTimerService } from './service.js'

export async function timerRoutes(app) {
  const timer = createTimerService({ prisma: app.prisma })
  app.addHook('onRequest', app.authenticate)

  // null until the first save from a client
  app.get('/', (request) => timer.get(request.user.sub))

  app.put('/', { schema: putTimerSchema }, (request) => timer.save(request.user.sub, request.body))
}
