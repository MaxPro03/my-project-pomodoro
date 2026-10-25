import { z } from 'zod'
import { DAY_PATTERN } from '../../common/utilities/days.js'

const minutes = z.int().min(1).max(180)

// same shape as the client's useTimerStore().snapshot()
export const timerStateSchema = z.strictObject({
  phase: z.enum(['focus', 'short', 'long']),
  remaining: z.int().min(0),
  endAt: z.int().nullable(), // ms timestamp
  round: z.int().min(1),
  oranges: z.int().min(0),
  day: z.string().regex(DAY_PATTERN),
  settings: z.looseObject({
    focus: minutes.optional(),
    short: minutes.optional(),
    long: minutes.optional(),
    longInterval: z.int().min(1).max(12).optional(),
    autoBreaks: z.boolean().optional(),
    autoFocus: z.boolean().optional(),
  }),
  updatedAt: z.int(), // ms timestamp of the last change on the client
})
