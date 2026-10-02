export class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

export const badRequest = (message) => new HttpError(400, message)
export const unauthorized = (message = 'Unauthorized') => new HttpError(401, message)
export const notFound = (message = 'Not found') => new HttpError(404, message)
export const conflict = (message, details) => new HttpError(409, message, details)

// one error shape for the client: { message, ...details }
export function errorHandler(error, request, reply) {
  if (error.validation) return reply.status(400).send({ message: error.message })
  const status = error.statusCode ?? 500
  if (status >= 500) request.log.error(error)
  return reply.status(status).send({ message: status >= 500 ? 'Internal error' : error.message, ...error.details })
}
