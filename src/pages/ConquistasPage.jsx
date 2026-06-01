import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../hooks/useData'
import { badgesApi } from '../services/api'
import { PoussinMascot } from '../components/ui/PoussinMascot'
import './ConquistasPage.css'

const SIDEBAR = [
  { label: 'Início',        path: '/dashboard',   emoji: '🏠' },
  { label: 'Trilhas',       path: '/trilhas',     emoji: '📚' },
  { label: 'Projetos',      path: '/projetos',    emoji: '💻' },
  { label: 'Comunidade',    path: '/comunidade',  emoji: '👥' },
  { label: 'Conquistas',    path: '/conquistas',  emoji: '🏅' },
  { label: 'Configurações', path: '/perfil',      emoji: '⚙️' },
]

const CONDITION_LABEL = {
  STREAK:          (v) => `Mantenha streak por ${v} dias`,
  XP:              (v) => `Acumule ${v} XP`,
  TRAIL_COMPLETED: (v) => `Conclua ${v} trilha${v > 1 ? 's' : ''}`,
}

function getProgress(badge, user) {
  if (!user) return { current: 0, pct: 0 }
  let current = 0
  if (badge.condition_type === 'STREAK')   current = user.streak_count
  if (badge.condition_type === 'XP')       current = user.xp_total
  if (badge.condition_type === 'TRAIL_COMPLETED') return null
  const pct = Math.min(100, Math.round((current / badge.condition_value) * 100))
  return { current, pct }
}

export default function ConquistasPage() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { data: allBadges, loading } = useData(() => badgesApi.getAll())

  const earnedIds = new Set((user?.badges || []).map(ub => ub.badge_id))
  const earnedMap = Object.fromEntries((user?.badges || []).map(ub => [ub.badge_id, ub]))

  const earnedCount = allBadges ? allBadges.filter(b => earnedIds.has(b.id)).length : 0
  const totalCount  = allBadges?.length ?? 0

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <PoussinMascot size={36} />
          <span>Poussin<br /><strong>Learning</strong></span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR.map(item => (
            <Link key={item.path} to={item.path} className={`sidebar-link ${pathname === item.path ? 'sidebar-link-active' : ''}`}>
              <span className="sidebar-icon">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="conq-header">
          <div>
            <h1 className="conq-title">🏅 Conquistas</h1>
            <p className="conq-subtitle">Complete desafios e colecione conquistas!</p>
          </div>
          {allBadges && (
            <div className="conq-counter">
              <span className="conq-counter-num">{earnedCount}</span>
              <span className="conq-counter-sep">/</span>
              <span className="conq-counter-total">{totalCount}</span>
              <span className="conq-counter-label">conquistadas</span>
            </div>
          )}
        </div>

        {/* Barra de progresso geral */}
        {allBadges && (
          <div className="card conq-overall">
            <div className="conq-overall-info">
              <span>Progresso geral</span>
              <strong>{earnedCount === totalCount ? '🎉 Todas desbloqueadas!' : `${earnedCount} de ${totalCount}`}</strong>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div
                className="progress-fill yellow"
                style={{ width: `${totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-container"><div className="spinner spinner-lg" /><span>Carregando conquistas...</span></div>
        ) : (
          <>
            {/* Conquistas ganhas */}
            {earnedCount > 0 && (
              <section>
                <h2 className="conq-section-title">✅ Desbloqueadas</h2>
                <div className="conq-grid">
                  {allBadges.filter(b => earnedIds.has(b.id)).map(badge => {
                    const ub = earnedMap[badge.id]
                    const earnedDate = ub ? new Date(ub.earned_at).toLocaleDateString('pt-BR') : ''
                    return (
                      <div className="conq-card conq-card-earned" key={badge.id}>
                        <div className="conq-icon-wrap conq-icon-earned">
                          <span className="conq-icon">{badge.icon}</span>
                        </div>
                        <div className="conq-info">
                          <div className="conq-name">{badge.name}</div>
                          <div className="conq-desc">{badge.description}</div>
                          {earnedDate && <div className="conq-date">🗓 Conquistado em {earnedDate}</div>}
                        </div>
                        <div className="conq-earned-tag">✓ Conquistado</div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Conquistas bloqueadas */}
            <section>
              <h2 className="conq-section-title">🔒 Ainda por conquistar</h2>
              {allBadges.filter(b => !earnedIds.has(b.id)).length === 0 ? (
                <div className="conq-all-done">
                  <PoussinMascot size={80} animate />
                  <h3>Incrível! Você desbloqueou tudo! 🎉</h3>
                  <p>Você é um mestre do Poussin Learning.</p>
                </div>
              ) : (
                <div className="conq-grid">
                  {allBadges.filter(b => !earnedIds.has(b.id)).map(badge => {
                    const progress = getProgress(badge, user)
                    const condLabel = CONDITION_LABEL[badge.condition_type]?.(badge.condition_value) ?? ''
                    return (
                      <div className="conq-card conq-card-locked" key={badge.id}>
                        <div className="conq-icon-wrap conq-icon-locked">
                          <span className="conq-icon conq-icon-gray">{badge.icon}</span>
                          <span className="conq-lock-overlay">🔒</span>
                        </div>
                        <div className="conq-info">
                          <div className="conq-name conq-name-locked">{badge.name}</div>
                          <div className="conq-desc">{badge.description}</div>
                          <div className="conq-condition">{condLabel}</div>
                          {progress && (
                            <div className="conq-progress-wrap">
                              <div className="progress-bar" style={{ height: 6 }}>
                                <div className="progress-fill yellow" style={{ width: `${progress.pct}%` }} />
                              </div>
                              <span className="conq-progress-label">
                                {progress.current.toLocaleString()} / {badge.condition_value.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
