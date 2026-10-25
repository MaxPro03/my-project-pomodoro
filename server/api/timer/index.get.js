import { defineEventHandler } from 'h3'
import { createTimerService } from '../../domains/Timer/index.js'
import { requireUserId } from '../../app/integrations/auth.js'
import { prisma } from '../../app/integrations/prisma.js'

const timer = createTimerService({ prisma })

// null until the first save from a client
export default defineEventHandler(async (event) => timer.get(await requireUserId(event)))
