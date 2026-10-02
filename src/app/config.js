// app-wide settings, read from Vite env (.env.local)
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  // the backend is a draft for now: keep it off until server/ is deployed
  backendEnabled: import.meta.env.VITE_BACKEND === 'on',
}
