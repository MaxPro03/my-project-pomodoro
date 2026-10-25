import { defineEventHandler, readValidatedBody } from 'h3'
import { replaceUserSession } from '#imports'
import { createUsersService, updateMeSchema } from '../../domains/Users/index.js'
import { requireUserId } from '../../app/integrations/auth.js'
import { prisma } from '../../app/integrations/prisma.js'
import { validate } from '../../common/utilities/validate.js'

const users = createUsersService({ prisma })

export default defineEventHandler(async (event) => {
  const user = await users.update(await requireUserId(event), await readValidatedBody(event, validate(updateMeSchema)))
  // the session cookie carries the profile too, keep it fresh
  await replaceUserSession(event, { user })
  return user
})
