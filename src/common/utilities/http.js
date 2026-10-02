// Thin fetch wrapper for the API. Configured once from app (base url, token source),
// so modules can talk to the backend without depending on the Auth module.
let options = {
  baseUrl: '/api',
  getToken: () => null,
  onUnauthorized: () => {},
}

export function configureHttp(next) {
  options = { ...options, ...next }
}

export class HttpError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed with ${status}`)
    this.status = status
    this.body = body
  }
}

export async function http(path, { method = 'GET', body, query, signal } = {}) {
  const url = new URL(options.baseUrl + path, window.location.origin)
  Object.entries(query ?? {}).forEach(([key, value]) => value != null && url.searchParams.set(key, value))

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = options.getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })
  if (response.status === 401) options.onUnauthorized()

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new HttpError(response.status, data)
  return data
}
