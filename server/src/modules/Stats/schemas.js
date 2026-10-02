import { DAY_PATTERN } from '../../common/utilities/days.js'

export const recordSessionSchema = {
  body: {
    type: 'object',
    required: ['clientId', 'phase', 'endedAt', 'seconds', 'completed', 'day'],
    additionalProperties: false,
    properties: {
      clientId: { type: 'string', minLength: 8, maxLength: 64 },
      phase: { enum: ['focus', 'short', 'long'] },
      endedAt: { type: 'string', format: 'date-time' },
      seconds: { type: 'integer', minimum: 0, maximum: 3 * 60 * 60 },
      completed: { type: 'boolean' },
      day: { type: 'string', pattern: DAY_PATTERN },
    },
  },
}

export const summarySchema = {
  querystring: {
    type: 'object',
    required: ['from', 'to'],
    properties: {
      from: { type: 'string', pattern: DAY_PATTERN },
      to: { type: 'string', pattern: DAY_PATTERN },
    },
  },
}
