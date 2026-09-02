const BASE_URL = 'http://localhost:5000/api'

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

// One place that talks to the backend. Every request gets the JWT attached
// when we have one, and every error is turned into a readable message.
export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const body = await res.json().catch(() => ({}))

  if (res.status === 401) {
    clearToken()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }

  if (!res.ok) {
    const message = body.error?.message || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.details = body.error?.details
    throw error
  }

  return body
}
