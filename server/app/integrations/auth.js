import { requireUserSession } from '#imports'

// the session cookie (sealed by nuxt-auth-utils) holds { user: publicUser }; answers 401 without it
export async function requireUserId(event) {
  const { user } = await requireUserSession(event)
  return user.id
}
