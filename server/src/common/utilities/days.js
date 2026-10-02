// days are plain local YYYY-MM-DD strings computed on the client, so no timezone math here

export const DAY_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$'

const toDate = (day) => new Date(`${day}T00:00:00Z`)
const toDay = (date) => date.toISOString().slice(0, 10)

export const addDays = (day, n) => toDay(new Date(toDate(day).getTime() + n * 86400000))

export function eachDay(from, to) {
  const days = []
  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day)
  return days
}
