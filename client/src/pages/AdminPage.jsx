import { useState } from 'react'
import { adminApi, trailsApi } from '../services/api'
import { useData } from '../hooks/useData'
import { Navbar } from '../components/layout/Navbar'
import './AdminPage.css'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="admin-stat-card" style={{ borderTopColor: color }}>
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  )
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name,
    role: user.role,
    is_premium: user.is_premium,
    streak_freezes: user.streak_freezes || 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await adminApi.updateUser(user.id, form)
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar usuário</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="label">Nome</label>
            <input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="label">Função</label>
            <select className="input" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="premium" checked={form.is_premium} onChange={e=>setForm(f=>({...f,is_premium:e.target.checked}))} />
            <label htmlFor="premium" className="label" style={{ margin: 0 }}>Conta Premium</label>
          </div>
          <div className="form-group">
            <label className="label">Streak Freezes</label>
            <input className="input" type="number" min="0" value={form.streak_freezes} onChange={e=>setForm(f=>({...f,streak_freezes:parseInt(e.target.value)||0}))} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState('overview')
  const [editingUser, setEditingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionMsg, setActionMsg] = useState('')

  const { data: usersData, loading: usersLoading, refetch: refetchUsers } =
    useData(() => adminApi.listUsers(page, 20), [page])

  const { data: trails, loading: trailsLoading } = useData(() => trailsApi.list())

  const handleDelete = async (userId) => {
    try {
      await adminApi.deleteUser(userId)
      setActionMsg('Usuário removido com sucesso.')
      setDeleteConfirm(null)
      refetchUsers()
    } catch (err) {
      setActionMsg(`Erro: ${err.message}`)
    }
  }

  const handleSaved = () => {
    setActionMsg('Usuário atualizado com sucesso.')
    refetchUsers()
  }

  return (
    <>
      <Navbar />
      <div className="admin-page" style={{ paddingTop: 64 }}>

        <div className="admin-header">
          <div className="container">
            <h1>🛡️ Painel Admin</h1>
            <p>Gerencie usuários, trilhas e conteúdos da plataforma.</p>
          </div>
        </div>

        <div className="container admin-layout">

          {/* Tabs */}
          <div className="admin-tabs">
            {[
              { key: 'overview',  label: '📊 Visão Geral' },
              { key: 'users',     label: '👥 Usuários' },
              { key: 'trails',    label: '📚 Trilhas' },
            ].map(t => (
              <button
                key={t.key}
                className={`admin-tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {actionMsg && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              {actionMsg}
              <button onClick={() => setActionMsg('')} style={{ marginLeft: 12, fontWeight: 700 }}>✕</button>
            </div>
          )}

          {/* VISÃO GERAL */}
          {tab === 'overview' && (
            <div className="admin-overview">
              <div className="admin-stats-row">
                <StatCard icon="👥" label="Usuários"     value={usersData?.total ?? '–'} color="var(--blue)" />
                <StatCard icon="📚" label="Trilhas"      value={trails?.length ?? '–'}   color="var(--yellow)" />
                <StatCard icon="💻" label="Projetos"     value="–" color="var(--green)" />
                <StatCard icon="⚡" label="Atividades"   value="–" color="var(--orange)" />
              </div>
              {/* ⚠️ Contadores de projetos e atividades totais não têm endpoint específico no admin atual.
                       Seriam necessárias rotas GET /api/admin/stats para estes valores. */}
              <div className="alert alert-warning" style={{ marginTop: 16 }}>
                ⚠️ <strong>Endpoint pendente:</strong> contadores de projetos e atividades totais requerem <code>GET /api/admin/stats</code> no backend.
              </div>
            </div>
          )}

          {/* USUÁRIOS */}
          {tab === 'users' && (
            <div className="admin-users-section">
              {usersLoading ? (
                <div className="loading-container"><div className="spinner spinner-lg" /></div>
              ) : (
                <>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Usuário</th>
                          <th>E-mail</th>
                          <th>Função</th>
                          <th>XP</th>
                          <th>Streak</th>
                          <th>Premium</th>
                          <th>Atividades</th>
                          <th>Projetos</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData?.users?.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="admin-user-cell">
                                <div className="admin-user-avatar">{u.name?.[0]?.toUpperCase()}</div>
                                <span>{u.name}</span>
                              </div>
                            </td>
                            <td><span className="admin-email">{u.email}</span></td>
                            <td>
                              <span className={`pill ${u.role === 'ADMIN' ? 'pill-orange' : 'pill-blue'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td><strong>{u.xp_total.toLocaleString()}</strong></td>
                            <td>🔥 {u.streak_count}</td>
                            <td>{u.is_premium ? '✅' : '—'}</td>
                            <td>{u._count?.progress ?? 0}</td>
                            <td>{u._count?.projects ?? 0}</td>
                            <td>
                              <div className="admin-actions">
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setEditingUser(u)}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn btn-sm admin-delete-btn"
                                  onClick={() => setDeleteConfirm(u)}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginação */}
                  {usersData && usersData.pages > 1 && (
                    <div className="admin-pagination">
                      {[...Array(usersData.pages)].map((_, i) => (
                        <button
                          key={i}
                          className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TRILHAS */}
          {tab === 'trails' && (
            <div className="admin-trails-section">
              <div className="admin-trails-header">
                <h2>Trilhas cadastradas</h2>
                {/* ⚠️ Formulário de criação de trilha não implementado na UI.
                       Backend tem POST /api/trails — pode ser adicionado como modal. */}
                <span className="alert alert-warning" style={{ display: 'inline-block' }}>
                  ⚠️ Interface de criação pendente — use POST /api/trails via API
                </span>
              </div>
              {trailsLoading ? (
                <div className="loading-container"><div className="spinner"/></div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Trilha</th>
                        <th>Dificuldade</th>
                        <th>Atividades</th>
                        <th>Ordem</th>
                        <th>Premium</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(trails || []).map(t => (
                        <tr key={t.id}>
                          <td><strong>{t.title}</strong></td>
                          <td>
                            <span className={`pill diff-${t.difficulty}`}>
                              {t.difficulty === 'BEGINNER' ? 'Iniciante' : t.difficulty === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}
                            </span>
                          </td>
                          <td>{t._count?.activities ?? 0}</td>
                          <td>{t.order}</td>
                          <td>{t.is_premium ? '👑 Sim' : '—'}</td>
                          <td>
                            <span className="pill pill-green">Ativa</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2 style={{ marginBottom: 12 }}>Confirmar exclusão</h2>
            <p>Tem certeza que deseja remover <strong>{deleteConfirm.name}</strong>? Esta ação é irreversível.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--red)' }} onClick={() => handleDelete(deleteConfirm.id)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
