/**
 * api.js — Camada de serviço do Poussin Learning
 *
 * Rotas reais mapeadas do backend (server/src/modules/**):
 *
 * AUTH
 *   POST /api/auth/register     { name, email, password }
 *   POST /api/auth/login        { email, password }
 *   GET  /api/auth/me           [requireAuth]
 *
 * USERS
 *   GET  /api/users/ranking
 *   GET  /api/users/:id/profile
 *   PUT  /api/users/me          { name?, avatar_url? }  [requireAuth]
 *   POST /api/users/upgrade-premium                     [requireAuth]
 *
 * TRAILS
 *   GET  /api/trails            [optionalAuth — retorna progress_percent e is_locked se autenticado]
 *   GET  /api/trails/:id        [optionalAuth — retorna activities com user_status]
 *   POST /api/trails            [requireAuth + requireAdmin]
 *   PUT  /api/trails/:id        [requireAuth + requireAdmin]
 *   DELETE /api/trails/:id      [requireAuth + requireAdmin]
 *
 * ACTIVITIES
 *   POST /api/activities/trails/:trailId/activities  [requireAuth + requireAdmin]
 *   PUT  /api/activities/:id                         [requireAuth + requireAdmin]
 *   DELETE /api/activities/:id                       [requireAuth + requireAdmin]
 *   POST /api/activities/:id/complete                [requireAuth]
 *
 * PROJECTS
 *   GET  /api/projects           — feed público (status=PUBLISHED)
 *   GET  /api/projects/my        [requireAuth]
 *   POST /api/projects           { trail_id, title, description, code_url }  [requireAuth]
 *   PUT  /api/projects/:id       { title?, description?, code_url? }         [requireAuth]
 *   POST /api/projects/:id/publish                                            [requireAuth]
 *   POST /api/projects/:id/like                                               [requireAuth]
 *
 * ADMIN
 *   GET  /api/admin/users        ?page=1&limit=20   [requireAuth + requireAdmin]
 *   PUT  /api/admin/users/:id    { name?, role?, is_premium?, streak_freezes? }
 *   DELETE /api/admin/users/:id
 *
 * FORMATO DE RESPOSTA PADRÃO DO BACKEND:
 *   Sucesso: { data: T }
 *   Erro:    { error: string }
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ──────────────────────────────────────────────────────────────
// Utilitários internos
// ──────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('poussin_token')
}

function buildHeaders(requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request(method, path, body = null, auth = false) {
  const options = {
    method,
    headers: buildHeaders(auth),
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || `Erro ${res.status}`)
  }

  return json.data
}

const get  = (path, auth) => request('GET',    path, null, auth)
const post = (path, body, auth) => request('POST',   path, body, auth)
const put  = (path, body, auth) => request('PUT',    path, body, auth)
const del  = (path, auth) => request('DELETE',  path, null, auth)

// ──────────────────────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────────────────────

export const authApi = {
  register: (name, email, password) =>
    post('/api/auth/register', { name, email, password }),

  login: (email, password) =>
    post('/api/auth/login', { email, password }),

  me: () => get('/api/auth/me', true),
}

// ──────────────────────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────────────────────

export const usersApi = {
  getRanking: () => get('/api/users/ranking'),

  getProfile: (id) => get(`/api/users/${id}/profile`),

  updateMe: (data) => put('/api/users/me', data, true),

  deleteMe: () => del('/api/users/me', true),

  upgradePremium: () => post('/api/users/upgrade-premium', {}, true),
}

// ──────────────────────────────────────────────────────────────
// TRAILS
// ──────────────────────────────────────────────────────────────

export const trailsApi = {
  list: () => get('/api/trails', true),

  getDetail: (id) => get(`/api/trails/${id}`, true),

  create: (data) => post('/api/trails', data, true),

  update: (id, data) => put(`/api/trails/${id}`, data, true),

  remove: (id) => del(`/api/trails/${id}`, true),
}

// ──────────────────────────────────────────────────────────────
// ACTIVITIES
// ──────────────────────────────────────────────────────────────

export const activitiesApi = {
  createForTrail: (trailId, data) =>
    post(`/api/activities/trails/${trailId}/activities`, data, true),

  update: (id, data) => put(`/api/activities/${id}`, data, true),

  remove: (id) => del(`/api/activities/${id}`, true),

  complete: (id) => post(`/api/activities/${id}/complete`, {}, true),
}

// ──────────────────────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────────────────────

export const projectsApi = {
  getFeed: () => get('/api/projects'),

  getMy: () => get('/api/projects/my', true),

  create: (data) => post('/api/projects', data, true),

  update: (id, data) => put(`/api/projects/${id}`, data, true),

  publish: (id) => post(`/api/projects/${id}/publish`, {}, true),

  toggleLike: (id) => post(`/api/projects/${id}/like`, {}, true),
}

// ──────────────────────────────────────────────────────────────
// BADGES
// ──────────────────────────────────────────────────────────────

export const badgesApi = {
  getAll: () => get('/api/badges'),
}

// ──────────────────────────────────────────────────────────────
// ADMIN
// ──────────────────────────────────────────────────────────────

export const adminApi = {
  listUsers: (page = 1, limit = 20) =>
    get(`/api/admin/users?page=${page}&limit=${limit}`, true),

  updateUser: (id, data) => put(`/api/admin/users/${id}`, data, true),

  deleteUser: (id) => del(`/api/admin/users/${id}`, true),
}
