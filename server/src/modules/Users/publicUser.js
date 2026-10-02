// never send the password hash to the client
export const publicUser = ({ id, email, name, timezone, createdAt }) => ({ id, email, name, timezone, createdAt })
