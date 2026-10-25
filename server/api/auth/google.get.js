import { sendRedirect } from 'h3'
import { defineOAuthGoogleEventHandler, hashPassword, setUserSession, verifyPassword } from '#imports'
import { createAuthService } from '../../domains/Auth/index.js'
import { publicUser } from '../../domains/Users/index.js'
import { prisma } from '../../app/integrations/prisma.js'

const auth = createAuthService({ prisma, hashPassword, verifyPassword })

// GET /api/auth/google sends the browser to Google; Google redirects back here with ?code, then we
// set the same session cookie as the email login and return to the app.
// Credentials: NUXT_OAUTH_GOOGLE_CLIENT_ID / NUXT_OAUTH_GOOGLE_CLIENT_SECRET.
// the app shows a message when it opens with ?login=failed
const fail = (event, error) => {
  console.error('Google login failed', error)
  return sendRedirect(event, '/?login=failed')
}

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: profile }) {
    try {
      const user = publicUser(await auth.loginWithGoogle(profile))
      await setUserSession(event, { user })
      return sendRedirect(event, '/')
    } catch (error) {
      return fail(event, error)
    }
  },
  onError: fail,
})
