import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../services/api'
import { PoussinMascot } from '../components/ui/PoussinMascot'
import './PerfilPage.css'

const SIDEBAR = [
  { label: 'Início',        path: '/dashboard',   emoji: '🏠' },
  { label: 'Trilhas',       path: '/trilhas',     emoji: '📚' },
  { label: 'Projetos',      path: '/projetos',    emoji: '💻' },
  { label: 'Comunidade',    path: '/comunidade',  emoji: '👥' },
  { label: 'Conquistas',    path: '/conquistas',  emoji: '🏅' },
  { label: 'Configurações', path: '/perfil',      emoji: '⚙️' },
]

function xpToLevel(xp) { return Math.floor(Math.sqrt(xp / 100)) + 1 }

function AvatarPreview({ src, name, size = 80 }) {
  return src
    ? <img src={src} alt={name} className="avatar-img" style={{ width: size, height: size }} />
    : <span className="avatar-letter" style={{ width: size, height: size, fontSize: size * 0.4 }}>{name?.[0]?.toUpperCase()}</span>
}

export default function PerfilPage() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const fileRef = useRef(null)

  // ── perfil ──────────────────────────────────────────────────────────────────
  const [name, setName]           = useState(user?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState(null) // preview local
  const [saving, setSaving]       = useState(false)
  const [saveMsg, setSaveMsg]     = useState('')
  const [saveErr, setSaveErr]     = useState('')

  // ── premium ──────────────────────────────────────────────────────────────────
  const [upgrading, setUpgrading] = useState(false)
  const [upgMsg, setUpgMsg]       = useState('')

  // ── dark mode ────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => document.body.classList.contains('dark-mode'))

  // ── exclusão ─────────────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput]         = useState('')
  const [deleting, setDeleting]               = useState(false)
  const [deleteErr, setDeleteErr]             = useState('')

  if (!user) return null

  const level       = xpToLevel(user.xp_total)
  const memberSince = new Date(user.created_at || Date.now()).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
  const displayAvatar = avatarFile || avatarUrl || user.avatar_url || ''

  // ── handlers ─────────────────────────────────────────────────────────────────

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSaveErr('Selecione um arquivo de imagem (JPG, PNG, GIF, WebP).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveErr('A imagem deve ter no máximo 2 MB.')
      return
    }

    setSaveErr('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarFile(ev.target.result) // base64 data URL
      setAvatarUrl(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  function handleDropZone(e) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } }
      handleFileChange(fakeEvent)
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    if (!name.trim()) { setSaveErr('O nome não pode ficar vazio.'); return }
    setSaving(true); setSaveMsg(''); setSaveErr('')
    try {
      await usersApi.updateMe({
        name: name.trim(),
        // null limpa o avatar no banco; undefined não toca no campo
        avatar_url: avatarUrl.trim() === '' ? null : avatarUrl,
      })
      await refreshUser()
      setAvatarFile(null)
      setSaveMsg('Perfil atualizado com sucesso!')
    } catch (err) {
      setSaveErr(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true); setUpgMsg('')
    try {
      await usersApi.upgradePremium()
      await refreshUser()
      setUpgMsg('🎉 Premium ativado!')
    } catch (err) {
      setUpgMsg(err.message)
    } finally {
      setUpgrading(false)
    }
  }

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    document.body.classList.toggle('dark-mode', next)
    localStorage.setItem('poussin_dark', next ? '1' : '0')
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'EXCLUIR') {
      setDeleteErr('Digite EXCLUIR para confirmar.')
      return
    }
    setDeleting(true); setDeleteErr('')
    try {
      await usersApi.deleteMe()
      logout()
      navigate('/')
    } catch (err) {
      setDeleteErr(err.message || 'Erro ao excluir conta.')
      setDeleting(false)
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <PoussinMascot size={36} />
          <span>Poussin<br /><strong>Learning</strong></span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR.map(item => (
            <Link key={item.path} to={item.path}
              className={`sidebar-link ${pathname === item.path ? 'sidebar-link-active' : ''}`}>
              <span className="sidebar-icon">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="dashboard-main">
        <h1 className="perf-title">⚙️ Configurações</h1>

        <div className="perf-grid">

          {/* ── Coluna esquerda ── */}
          <div className="perf-col">

            {/* Card de perfil atual */}
            <div className="card perf-card">
              <div className="perf-avatar-row">
                <div className="perf-avatar-circle">
                  <AvatarPreview src={displayAvatar} name={user.name} size={64} />
                </div>
                <div>
                  <div className="perf-name">{user.name}</div>
                  <div className="perf-email">{user.email}</div>
                  <div className="perf-badges-row">
                    <span className="pill pill-yellow">Nível {level}</span>
                    {user.is_premium && <span className="pill pill-yellow">👑 Premium</span>}
                    {user.role === 'ADMIN' && <span className="pill pill-blue">🛡 Admin</span>}
                  </div>
                </div>
              </div>

              <div className="perf-stats-row">
                {[
                  { val: user.xp_total.toLocaleString(), lbl: 'XP Total' },
                  { val: user.streak_count,              lbl: 'Streak'   },
                  { val: user.streak_freezes ?? 0,       lbl: 'Freezes'  },
                  { val: user.badges?.length ?? 0,       lbl: 'Conquistas'},
                ].map(s => (
                  <div className="perf-stat" key={s.lbl}>
                    <span className="perf-stat-val">{s.val}</span>
                    <span className="perf-stat-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>
              <div className="perf-since">Membro desde {memberSince}</div>
            </div>

            {/* Editar perfil */}
            <div className="card perf-card">
              <h2 className="perf-section-title">✏️ Editar perfil</h2>
              <form onSubmit={handleSaveProfile} className="perf-form">

                {/* Upload de foto */}
                <div className="form-group">
                  <label className="label">Foto de perfil</label>
                  <div
                    className="upload-zone"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('upload-zone-drag') }}
                    onDragLeave={e => e.currentTarget.classList.remove('upload-zone-drag')}
                    onDrop={e => { e.currentTarget.classList.remove('upload-zone-drag'); handleDropZone(e) }}
                  >
                    {displayAvatar ? (
                      <>
                        <img src={displayAvatar} alt="preview" className="upload-preview"
                          onError={e => { e.target.style.display = 'none' }} />
                        <span className="upload-change-label">Clique ou arraste para trocar</span>
                      </>
                    ) : (
                      <>
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">Clique ou arraste uma imagem</span>
                        <span className="upload-hint">JPG, PNG, GIF ou WebP — máx. 2 MB</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  {displayAvatar && (
                    <button type="button" className="btn btn-secondary btn-sm upload-remove-btn"
                      onClick={() => { setAvatarFile(null); setAvatarUrl('') }}>
                      Remover foto
                    </button>
                  )}
                </div>

                {/* Nome */}
                <div className="form-group">
                  <label className="label">Nome</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Seu nome" maxLength={60} />
                </div>

                {saveMsg && <div className="alert alert-success">{saveMsg}</div>}
                {saveErr && <div className="alert alert-error">{saveErr}</div>}

                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <><div className="spinner" /> Salvando...</> : 'Salvar alterações'}
                </button>
              </form>
            </div>

          </div>

          {/* ── Coluna direita ── */}
          <div className="perf-col">

            {/* Aparência */}
            <div className="card perf-card">
              <h2 className="perf-section-title">🎨 Aparência</h2>
              <div className="perf-toggle-row">
                <div>
                  <div className="perf-toggle-label">Modo escuro</div>
                  <div className="perf-toggle-sub">Altera o visual da plataforma</div>
                </div>
                <button className={`perf-toggle ${darkMode ? 'perf-toggle-on' : ''}`}
                  onClick={toggleDarkMode} aria-label="Toggle dark mode">
                  <span className="perf-toggle-thumb" />
                </button>
              </div>
            </div>

            {/* Premium */}
            {!user.is_premium ? (
              <div className="card perf-card perf-card-premium">
                <div className="perf-premium-icon">👑</div>
                <h2 className="perf-section-title">Seja Premium</h2>
                <p className="perf-premium-desc">
                  Desbloqueie TypeScript, React Avançado, APIs REST e muito mais!
                </p>
                <ul className="perf-premium-list">
                  <li>✅ Acesso a todas as trilhas premium</li>
                  <li>✅ Conteúdo avançado exclusivo</li>
                  <li>✅ Certificados de conclusão</li>
                </ul>
                {upgMsg && <div className="alert alert-success">{upgMsg}</div>}
                <button className="btn btn-primary" onClick={handleUpgrade} disabled={upgrading}>
                  {upgrading ? <><div className="spinner" /> Ativando...</> : '🚀 Ativar Premium'}
                </button>
              </div>
            ) : (
              <div className="card perf-card perf-card-premium-active">
                <div className="perf-premium-icon">👑</div>
                <h2 className="perf-section-title">Você é Premium!</h2>
                <p className="perf-premium-desc">Acesso completo a todos os conteúdos da plataforma.</p>
                <div className="perf-premium-badge">✓ Plano Premium ativo</div>
              </div>
            )}

            {/* Conta */}
            <div className="card perf-card">
              <h2 className="perf-section-title">🔐 Conta</h2>
              {[
                { lbl: 'E-mail',  val: user.email },
                { lbl: 'Função',  val: user.role === 'ADMIN' ? 'Administrador' : 'Usuário' },
                { lbl: 'Status',  val: user.is_premium ? '👑 Premium' : 'Free' },
              ].map(row => (
                <div className="perf-info-row" key={row.lbl}>
                  <span className="perf-info-label">{row.lbl}</span>
                  <span className="perf-info-value">{row.val}</span>
                </div>
              ))}
              <div className="perf-divider" />
              <button className="btn btn-secondary perf-logout-btn" onClick={logout}>
                Sair da conta
              </button>
            </div>

            {/* Zona de perigo */}
            <div className="card perf-card perf-card-danger">
              <h2 className="perf-section-title perf-danger-title">⚠️ Zona de perigo</h2>
              <p className="perf-danger-desc">
                A exclusão da conta é <strong>permanente e irreversível</strong>. Todos os seus dados,
                progresso, projetos e conquistas serão apagados.
              </p>
              <button
                className="btn perf-delete-btn"
                onClick={() => { setShowDeleteModal(true); setDeleteInput(''); setDeleteErr('') }}
              >
                🗑 Excluir minha conta
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-danger-icon">⚠️</div>
            <h2 className="modal-title">Excluir conta permanentemente?</h2>
            <p className="modal-desc">
              Esta ação <strong>não pode ser desfeita</strong>. Serão removidos:
            </p>
            <ul className="modal-list">
              <li>Todo o seu progresso nas trilhas</li>
              <li>Seus projetos publicados</li>
              <li>Suas conquistas e XP</li>
              <li>Seus dados de perfil</li>
            </ul>
            <p className="modal-confirm-label">
              Digite <strong>EXCLUIR</strong> para confirmar:
            </p>
            <input
              className={`input ${deleteErr ? 'error' : ''}`}
              value={deleteInput}
              onChange={e => { setDeleteInput(e.target.value); setDeleteErr('') }}
              placeholder="EXCLUIR"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()}
            />
            {deleteErr && <div className="alert alert-error" style={{ marginTop: 8 }}>{deleteErr}</div>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancelar
              </button>
              <button
                className="btn perf-delete-btn modal-delete-btn"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteInput !== 'EXCLUIR'}
              >
                {deleting ? <><div className="spinner" /> Excluindo...</> : '🗑 Excluir conta'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
