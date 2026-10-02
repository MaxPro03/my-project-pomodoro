import { conflict } from '../../common/utilities/httpErrors.js'

// db row <-> the client's snapshot shape (timestamps as ms numbers)
const toClient = (row) =>
  row && {
    phase: row.phase,
    remaining: row.remaining,
    endAt: row.endAt?.getTime() ?? null,
    round: row.round,
    oranges: row.oranges,
    day: row.day,
    settings: row.settings,
    updatedAt: row.updatedAt.getTime(),
  }

const toRow = (state) => ({
  ...state,
  endAt: state.endAt === null ? null : new Date(state.endAt),
  updatedAt: new Date(state.updatedAt),
})

export function createTimerService({ prisma }) {
  async function get(userId) {
    return toClient(await prisma.timerState.findUnique({ where: { userId } }))
  }

  // last write wins by client time; an older write gets 409 with the newer state to apply
  async function save(userId, state) {
    const current = await prisma.timerState.findUnique({ where: { userId } })
    if (current && current.updatedAt.getTime() > state.updatedAt) {
      throw conflict('Timer was changed on another device', { state: toClient(current) })
    }
    const data = toRow(state)
    const row = await prisma.timerState.upsert({ where: { userId }, create: { userId, ...data }, update: data })
    return toClient(row)
  }

  return { get, save }
}
