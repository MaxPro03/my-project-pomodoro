import { z } from 'zod'

export const updateMeSchema = z
  .strictObject({
    name: z.string().min(1).max(40),
    timezone: z.string().max(64),
  })
  .partial()
  .refine((changes) => Object.keys(changes).length > 0, 'Nothing to update')
