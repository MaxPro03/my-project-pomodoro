const credentials = {
  email: { type: 'string', format: 'email', maxLength: 254 },
  password: { type: 'string', minLength: 8, maxLength: 128 },
}

export const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'name'],
    additionalProperties: false,
    properties: { ...credentials, name: { type: 'string', minLength: 1, maxLength: 40 } },
  },
}

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: credentials,
  },
}
