// $fetch (ofetch) preset for our API: same origin, the session cookie goes along on its own.
// Errors are FetchError with `status` and the parsed body in `data` ({ message, ... }).
// The 401 handler is configured from app, so modules don't depend on the Auth module.
import { $fetch } from 'ofetch'

let onUnauthorized = () => {}

export function configureHttp(options) {
  onUnauthorized = options.onUnauthorized ?? onUnauthorized
}

export const http = $fetch.create({
  baseURL: '/api',
  onResponseError({ response }) {
    if (response.status === 401) onUnauthorized()
  },
})
