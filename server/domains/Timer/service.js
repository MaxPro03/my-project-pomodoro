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

  // last write wins by client time; an older write is rejected with the newer state to apply
  async function save(userId, state) {
    const current = await prisma.timerState.findUnique({ where: { userId } })
    if (current && current.updatedAt.getTime() > state.updatedAt) return { conflict: true, state: toClient(current) }
    const data = toRow(state)
    const row = await prisma.timerState.upsert({ where: { userId }, create: { userId, ...data }, update: data })
    return { conflict: false, state: toClient(row) }
  }

  return { get, save }
}
