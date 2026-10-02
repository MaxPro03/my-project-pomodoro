import { badRequest } from '../../common/utilities/httpErrors.js'
import { addDays, eachDay } from '../../common/utilities/days.js'

const MAX_RANGE_DAYS = 366

// an orange is a fully finished focus session
const isOrange = (session) => session.phase === 'focus' && session.completed

export function createStatsService({ prisma }) {
  // idempotent on clientId, so the client can safely retry
  function recordSession(userId, input) {
    const data = { ...input, userId, endedAt: new Date(input.endedAt) }
    return prisma.session.upsert({ where: { clientId: input.clientId }, create: data, update: {} })
  }

  async function streaks(userId, today) {
    const rows = await prisma.session.findMany({
      where: { userId, phase: 'focus', completed: true },
      distinct: ['day'],
      select: { day: true },
      orderBy: { day: 'asc' },
    })
    const days = new Set(rows.map((r) => r.day))

    let best = 0
    let run = 0
    let previous = null
    for (const { day } of rows) {
      run = previous && addDays(previous, 1) === day ? run + 1 : 1
      best = Math.max(best, run)
      previous = day
    }

    // today without an orange yet doesn't break the streak
    let current = 0
    for (let day = days.has(today) ? today : addDays(today, -1); days.has(day); day = addDays(day, -1)) current++

    return { currentStreak: current, bestStreak: best }
  }

  async function summary(userId, { from, to }) {
    const range = eachDay(from, to)
    if (!range.length || range.length > MAX_RANGE_DAYS) throw badRequest('Invalid date range')

    const sessions = await prisma.session.findMany({ where: { userId, day: { gte: from, lte: to } } })
    const byDay = new Map(range.map((day) => [day, { day, oranges: 0, focusMinutes: 0, sessions: 0 }]))
    for (const session of sessions) {
      const stats = byDay.get(session.day)
      stats.sessions++
      if (isOrange(session)) stats.oranges++
      if (session.phase === 'focus') stats.focusMinutes += session.seconds / 60
    }

    const days = [...byDay.values()].map((d) => ({ ...d, focusMinutes: Math.round(d.focusMinutes) }))
    const total = (key) => days.reduce((sum, d) => sum + d[key], 0)
    return {
      from,
      to,
      oranges: total('oranges'),
      focusMinutes: total('focusMinutes'),
      sessions: total('sessions'),
      ...(await streaks(userId, to)),
      days,
    }
  }

  return { recordSession, summary }
}
