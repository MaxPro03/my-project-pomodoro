import { http } from '@/common/utilities/http'

/**
 * Timer state as stored on the server, same shape as useTimerStore().snapshot()
 * @typedef {{ phase: string, remaining: number, endAt: number|null, oranges: number, round: number, day: string, settings: object, updatedAt: number }} TimerState
 */

/** @returns {Promise<TimerState|null>} null when the user has no saved state yet */
export const fetchTimerState = () => http('/timer')

/**
 * Last write wins: the server answers 409 with its own state when it has a newer one.
 * @returns {Promise<TimerState>}
 */
export const saveTimerState = (state) => http('/timer', { method: 'PUT', body: state })
