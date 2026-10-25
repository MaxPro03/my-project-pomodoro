import { defineEventHandler, readValidatedBody, setResponseStatus } from 'h3'
import { hashPassword, setUserSession, verifyPassword } from '#imports'
import { createAuthService, registerSchema } from '../../domains/Auth/index.js'
import { publicUser } from '../../domains/Users/index.js'
import { prisma } from '../../app/integrations/prisma.js'
import { validate } from '../../common/utilities/validate.js'

const auth = createAuthService({ prisma, hashPassword, verifyPassword })

export default defineEventHandler(async (event) => {
  const user = publicUser(await auth.register(await readValidatedBody(event, validate(registerSchema))))
  await setUserSession(event, { user })
  setResponseStatus(event, 201)
  return user
})
