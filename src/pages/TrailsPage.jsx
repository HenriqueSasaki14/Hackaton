import { Link } from 'react-router-dom'
import { trailsApi } from '../services/api'
import { useData } from '../hooks/useData'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { getTrailIcon } from '../components/ui/Icons'
import './TrailsPage.css'

const DIFF_LABELS = { BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediário', ADVANCED: 'Avançado' }
const DIFF_CLASS  = { BEGINNER: 'green',      INTERMEDIATE: 'yellow',        ADVANCED: 'red'    }

export default function TrailsPage() {
  const { user } = useAuth()
  const { data: trails, loading, error } = useData(() => trailsApi.list())

  return (
    <>
      <Navbar />
      <main className="trails-page" style={{ paddingTop: 64 }}>

        <div className="trails-hero">
          <div className="container">
            <h1>Trilhas de Aprendizado</h1>
            <p>Escolha sua trilha e comece a aprender com atividades interativas, XP e projetos reais.</p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
          {loading && (
            <div className="loading-container">
              <div className="spinner spinner-lg" />
              <span>Carregando trilhas...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              Erro ao carregar trilhas: {error}
            </div>
          )}

          {trails && trails.length === 0 && (
            <div className="empty-state">
              <div className="icon">🐣</div>
              <h3>Trilhas em breve!</h3>
              <p>Nenhuma trilha cadastrada ainda. Volte em breve!</p>
            </div>
          )}

          {trails && trails.length > 0 && (
            <div className="trails-full-grid">
              {trails.map((trail, index) => {
                const { Icon, color, bg } = getTrailIcon(trail.title)
                const isLocked = trail.is_locked
                const progress = trail.progress_percent || 0

                return (
                  <div
                    className={`trail-full-card card ${isLocked ? 'trail-locked' : ''}`}
                    key={trail.id}
                    style={{ '--card-color': color }}
                  >
                    {/* Barra de ordem */}
                    <div className="trail-order-bar" style={{ background: isLocked ? 'var(--gray-border)' : color }} />

                    <div className="trail-full-body">
                      {/* Ícone e header */}
                      <div className="trail-full-header">
                        <div className="trail-full-icon" style={{ background: bg }}>
                          <span style={{ fontSize: '2.4rem', color }}><Icon /></span>
                        </div>
                        <div className="trail-full-title-block">
                          <div className="trail-full-meta">
                            <span className={`pill pill-${DIFF_CLASS[trail.difficulty]}`}>
                              {DIFF_LABELS[trail.difficulty]}
                            </span>
                            {trail.is_premium && <span className="pill pill-yellow">👑 Premium</span>}
                            {isLocked && <span className="pill pill-red">🔒 Bloqueada</span>}
                          </div>
                          <h2 className="trail-full-title">{trail.title}</h2>
                          <p className="trail-full-desc">{trail.description}</p>
                        </div>
                      </div>

                      {/* Stats da trilha */}
                      <div className="trail-full-stats">
                        <div className="trail-stat-item">
                          <span className="trail-stat-num">{trail._count?.activities ?? 0}</span>
                          <span className="trail-stat-lbl">atividades</span>
                        </div>
                        <div className="trail-stat-sep" />
                        <div className="trail-stat-item">
                          <span className="trail-stat-num">{DIFF_LABELS[trail.difficulty]}</span>
                          <span className="trail-stat-lbl">nível</span>
                        </div>
                        {user && (
                          <>
                            <div className="trail-stat-sep" />
                            <div className="trail-stat-item">
                              <span className="trail-stat-num">{progress}%</span>
                              <span className="trail-stat-lbl">concluído</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Barra de progresso (apenas para usuários logados) */}
                      {user && (
                        <div className="trail-progress-wrap">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${progress}%`,
                                background: isLocked ? 'var(--gray-border)' : 'var(--green)',
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      {isLocked ? (
                        <div className="trail-locked-msg">
                          🔒 Conclua a trilha anterior para desbloquear
                        </div>
                      ) : (
                        <Link
                          to={`/trilhas/${trail.id}`}
                          className="btn btn-primary"
                          style={{ alignSelf: 'flex-start' }}
                        >
                          {progress > 0 && progress < 100 ? 'Continuar' : progress === 100 ? 'Revisar' : 'Iniciar'}
                          {progress === 100 && ' ✅'}
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!user && (
            <div className="trails-login-banner">
              <span>🐣 Faça login para ver seu progresso nas trilhas!</span>
              <Link to="/auth" className="btn btn-primary btn-sm">Entrar</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
