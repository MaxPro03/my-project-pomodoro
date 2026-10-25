import { z } from 'zod'
import { DAY_PATTERN } from '../../common/utilities/days.js'

const day = z.string().regex(DAY_PATTERN)

export const recordSessionSchema = z.strictObject({
  clientId: z.string().min(8).max(64),
  phase: z.enum(['focus', 'short', 'long']),
  endedAt: z.iso.datetime(),
  seconds: z.int().min(0).max(3 * 60 * 60),
  completed: z.boolean(),
  day,
})

export const summaryQuerySchema = z.object({ from: day, to: day })
