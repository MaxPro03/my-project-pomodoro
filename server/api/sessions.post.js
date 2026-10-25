import { defineEventHandler, readValidatedBody, setResponseStatus } from 'h3'
import { createStatsService, recordSessionSchema } from '../domains/Stats/index.js'
import { requireUserId } from '../app/integrations/auth.js'
import { prisma } from '../app/integrations/prisma.js'
import { validate } from '../common/utilities/validate.js'

const stats = createStatsService({ prisma })

// idempotent on clientId, so the client can safely retry
export default defineEventHandler(async (event) => {
  await stats.recordSession(await requireUserId(event), await readValidatedBody(event, validate(recordSessionSchema)))
  setResponseStatus(event, 204)
  return null
})
