const required = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env variable ${name}`)
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') ?? true,
}
