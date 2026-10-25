import { defineEventHandler, getValidatedQuery } from 'h3'
import { createStatsService, summaryQuerySchema } from '../../domains/Stats/index.js'
import { requireUserId } from '../../app/integrations/auth.js'
import { prisma } from '../../app/integrations/prisma.js'
import { validate } from '../../common/utilities/validate.js'

const stats = createStatsService({ prisma })

export default defineEventHandler(async (event) =>
  stats.summary(await requireUserId(event), await getValidatedQuery(event, validate(summaryQuerySchema)))
)
