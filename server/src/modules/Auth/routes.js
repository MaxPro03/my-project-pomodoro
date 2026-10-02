import { loginSchema, registerSchema } from './schemas.js'
import { createAuthService } from './service.js'

// brute force protection for the credential endpoints
const rateLimit = { rateLimit: { max: 10, timeWindow: '1 minute' } }

export async function authRoutes(app) {
  const auth = createAuthService({ prisma: app.prisma, signToken: (payload) => app.jwt.sign(payload) })

  app.post('/register', { schema: registerSchema, config: rateLimit }, async (request, reply) => {
    reply.status(201)
    return auth.register(request.body)
  })

  app.post('/login', { schema: loginSchema, config: rateLimit }, (request) => auth.login(request.body))
}
