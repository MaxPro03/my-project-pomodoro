import jwt from '@fastify/jwt'
import fp from 'fastify-plugin'
import { config } from '../config.js'

// JWT in the Authorization header; routes opt in with { onRequest: [app.authenticate] }
// and read the user id from request.user.sub
export const authPlugin = fp(async (app) => {
  await app.register(jwt, { secret: config.jwtSecret, sign: { expiresIn: config.jwtExpiresIn } })

  app.decorate('authenticate', async (request) => {
    await request.jwtVerify()
  })
})
