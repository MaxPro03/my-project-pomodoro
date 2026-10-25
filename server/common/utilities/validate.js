import { z } from 'zod'

// validator for h3's readValidatedBody / getValidatedQuery: the 400 carries a readable message
// ("Invalid email address → at email") instead of the raw list of zod issues
export const validate = (schema) => (data) => {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  throw new Error(z.prettifyError(result.error))
}
