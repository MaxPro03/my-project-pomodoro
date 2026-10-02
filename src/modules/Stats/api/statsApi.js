import { http } from '@/common/utilities/http'

/**
 * @typedef {{ clientId: string, phase: 'focus'|'short'|'long', endedAt: string, seconds: number, completed: boolean, day: string }} SessionInput
 * @typedef {{ day: string, oranges: number, focusMinutes: number, sessions: number }} DayStats
 * @typedef {{ from: string, to: string, oranges: number, focusMinutes: number, sessions: number, currentStreak: number, bestStreak: number, days: DayStats[] }} Summary
 */

/** idempotent: the same clientId is stored once even if the request is retried */
export const recordSession = (session) => http('/sessions', { method: 'POST', body: session })

/** @returns {Promise<Summary>} */
export const fetchSummary = ({ from, to }) => http('/stats/summary', { query: { from, to } })
