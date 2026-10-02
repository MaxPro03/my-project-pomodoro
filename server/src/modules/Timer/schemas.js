import { DAY_PATTERN } from '../../common/utilities/days.js'

export const timerStateSchema = {
  type: 'object',
  required: ['phase', 'remaining', 'endAt', 'round', 'oranges', 'day', 'settings', 'updatedAt'],
  additionalProperties: false,
  properties: {
    phase: { enum: ['focus', 'short', 'long'] },
    remaining: { type: 'integer', minimum: 0 },
    endAt: { type: ['integer', 'null'] }, // ms timestamp
    round: { type: 'integer', minimum: 1 },
    oranges: { type: 'integer', minimum: 0 },
    day: { type: 'string', pattern: DAY_PATTERN },
    settings: {
      type: 'object',
      properties: {
        focus: { type: 'integer', minimum: 1, maximum: 180 },
        short: { type: 'integer', minimum: 1, maximum: 180 },
        long: { type: 'integer', minimum: 1, maximum: 180 },
        longInterval: { type: 'integer', minimum: 1, maximum: 12 },
        autoBreaks: { type: 'boolean' },
        autoFocus: { type: 'boolean' },
      },
    },
    updatedAt: { type: 'integer' }, // ms timestamp of the last change on the client
  },
}

export const putTimerSchema = { body: timerStateSchema }
