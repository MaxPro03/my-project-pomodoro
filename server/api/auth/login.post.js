import { defineEventHandler, readValidatedBody } from 'h3'
import { hashPassword, setUserSession, verifyPassword } from '#imports'
import { createAuthService, loginSchema } from '../../domains/Auth/index.js'
import { publicUser } from '../../domains/Users/index.js'
import { prisma } from '../../app/integrations/prisma.js'
import { validate } from '../../common/utilities/validate.js'

const auth = createAuthService({ prisma, hashPassword, verifyPassword })

export default defineEventHandler(async (event) => {
  const user = publicUser(await auth.login(await readValidatedBody(event, validate(loginSchema))))
  await setUserSession(event, { user })
  return user
})
