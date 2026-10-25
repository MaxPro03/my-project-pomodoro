import { defineEventHandler } from 'h3'
import { createUsersService } from '../../domains/Users/index.js'
import { requireUserId } from '../../app/integrations/auth.js'
import { prisma } from '../../app/integrations/prisma.js'

const users = createUsersService({ prisma })

export default defineEventHandler(async (event) => users.get(await requireUserId(event)))
