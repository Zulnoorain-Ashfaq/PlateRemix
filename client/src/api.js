const base = import.meta.env.VITE_API_URL || ''
export async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
  return data
}
export const api = {
  login: data => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: data => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  ingredients: () => request('/api/ingredients'),
  recipes: (token, search = '') => request(`/api/recipes?search=${encodeURIComponent(search)}`, { token }),
  save: (token, data, id) => request(`/api/recipes${id ? `/${encodeURIComponent(id)}` : ''}`, { token, method: id ? 'PUT' : 'POST', body: JSON.stringify(data) }),
  remove: (token, id) => request(`/api/recipes/${encodeURIComponent(id)}`, { token, method: 'DELETE' }),
}
