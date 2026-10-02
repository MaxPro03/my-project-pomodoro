import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import Fastify from 'fastify'
import { errorHandler } from '../common/utilities/httpErrors.js'
import { authRoutes } from '../modules/Auth/index.js'
import { statsRoutes } from '../modules/Stats/index.js'
import { timerRoutes } from '../modules/Timer/index.js'
import { usersRoutes } from '../modules/Users/index.js'
import { config } from './config.js'
import { authPlugin } from './integrations/auth.js'
import { prismaPlugin } from './integrations/prisma.js'

export async function buildServer() {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: config.corsOrigin })
  await app.register(rateLimit, { global: false })
  await app.register(prismaPlugin)
  await app.register(authPlugin)
  app.setErrorHandler(errorHandler)

  app.get('/health', async () => ({ ok: true }))

  await app.register(
    async (api) => {
      await api.register(authRoutes, { prefix: '/auth' })
      await api.register(usersRoutes, { prefix: '/users' })
      await api.register(timerRoutes, { prefix: '/timer' })
      await api.register(statsRoutes)
    },
    { prefix: '/api' }
  )

  return app
}
