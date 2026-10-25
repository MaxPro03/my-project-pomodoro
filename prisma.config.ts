import { defineConfig } from 'prisma/config'

// the Prisma CLI doesn't read .env on its own; on Vercel the variables are already in process.env
try {
  process.loadEnvFile()
} catch {}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // migrations need a direct connection, the app itself can use Neon's pooled DATABASE_URL
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
})
