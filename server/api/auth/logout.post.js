import { defineEventHandler, setResponseStatus } from 'h3'
import { clearUserSession } from '#imports'

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  setResponseStatus(event, 204)
  return null
})
