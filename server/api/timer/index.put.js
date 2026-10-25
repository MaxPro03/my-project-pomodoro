import { defineEventHandler, readValidatedBody, setResponseStatus } from 'h3'
import { createTimerService, timerStateSchema } from '../../domains/Timer/index.js'
import { requireUserId } from '../../app/integrations/auth.js'
import { prisma } from '../../app/integrations/prisma.js'
import { validate } from '../../common/utilities/validate.js'

const timer = createTimerService({ prisma })

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { conflict, state } = await timer.save(userId, await readValidatedBody(event, validate(timerStateSchema)))
  if (!conflict) return state
  // the client applies the newer state from the body
  setResponseStatus(event, 409)
  return { message: 'Timer was changed on another device', state }
})
