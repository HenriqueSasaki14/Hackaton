import { useParams, Link, useNavigate } from 'react-router-dom'
import { trailsApi } from '../services/api'
import { useData } from '../hooks/useData'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/layout/Navbar'
import { getTrailIcon } from '../components/ui/Icons'
import './TrailDetailPage.css'

const TYPE_LABELS = {
  MULTIPLE_CHOICE: 'Múltipla Escolha',
  FILL_BLANK: 'Preencha a Lacuna',
  FIND_ERROR: 'Encontre o Erro',
}
const TYPE_ICONS = {
  MULTIPLE_CHOICE: '📝',
  FILL_BLANK: '✏️',
  FIND_ERROR: '🔍',
}

export default function TrailDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: trail, loading, error } = useData(() => trailsApi.getDetail(id), [id])

  if (loading) return (
    <>
      <Navbar />
      <div className="loading-container" style={{ minHeight: '80vh', paddingTop: 80 }}>
        <div className="spinner spinner-lg" />
        <span>Carregando trilha...</span>
      </div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="alert alert-error">
          {error === 'Conteúdo premium'
            ? '👑 Esta trilha é premium. Faça upgrade para acessar!'
            : error === 'Conclua a trilha anterior primeiro'
            ? '🔒 Conclua a trilha anterior para desbloquear esta.'
            : `Erro: ${error}`}
        </div>
        <Link to="/trilhas" className="btn btn-secondary">← Voltar às trilhas</Link>
      </div>
    </>
  )

  if (!trail) return null

  const { Icon, color, bg } = getTrailIcon(trail.title)
  const totalActivities = trail.activities?.length || 0
  const completedActivities = trail.activities?.filter(a => a.user_status === 'COMPLETED').length || 0
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  return (
    <>
      <Navbar />
      <div className="trail-detail-page" style={{ paddingTop: 64 }}>

        {/* Hero da trilha */}
        <div className="trail-detail-hero" style={{ borderBottom: `3px solid ${color}` }}>
          <div className="container trail-detail-hero-inner">
            <Link to="/trilhas" className="trail-detail-back">← Todas as trilhas</Link>
            <div className="trail-detail-header">
              <div className="trail-detail-icon" style={{ background: bg }}>
                <span style={{ fontSize: '3rem', color }}><Icon /></span>
              </div>
              <div>
                <div className="trail-detail-meta">
                  <span className={`pill pill-${trail.difficulty === 'BEGINNER' ? 'green' : trail.difficulty === 'INTERMEDIATE' ? 'yellow' : 'red'}`}>
                    {trail.difficulty === 'BEGINNER' ? 'Iniciante' : trail.difficulty === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}
                  </span>
                  {trail.is_premium && <span className="pill pill-yellow">👑 Premium</span>}
                </div>
                <h1 className="trail-detail-title">Trilha: {trail.title}</h1>
                <p className="trail-detail-desc">{trail.description}</p>
              </div>
            </div>

            {user && totalActivities > 0 && (
              <div className="trail-detail-progress">
                <div className="trail-detail-progress-info">
                  <span>Seu progresso</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="progress-bar" style={{ height: 10 }}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="trail-detail-progress-count">
                  {completedActivities} de {totalActivities} atividades
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Caminho de aprendizado — estilo Duolingo */}
        <div className="container trail-detail-content">
          <h2 className="trail-detail-path-title">Caminho de aprendizado</h2>

          {totalActivities === 0 ? (
            <div className="empty-state">
              <div className="icon">⚡</div>
              <h3>Atividades em breve!</h3>
              <p>Esta trilha está sendo preparada. Volte em breve.</p>
            </div>
          ) : (
            <div className="trail-path">
              {trail.activities.map((activity, index) => {
                const isDone = activity.user_status === 'COMPLETED'
                const isSkipped = activity.user_status === 'SKIPPED'
                const prevDone = index === 0 || trail.activities[index - 1].user_status === 'COMPLETED'
                const isCurrent = !isDone && prevDone
                const isLocked = !isDone && !isCurrent

                let nodeClass = 'path-node'
                if (isDone) nodeClass += ' node-done'
                else if (isCurrent) nodeClass += ' node-current'
                else if (isLocked) nodeClass += ' node-locked'

                const activityType = activity.type || 'MULTIPLE_CHOICE'

                return (
                  <div className={`path-item ${index % 2 === 0 ? 'path-left' : 'path-right'}`} key={activity.id}>
                    {index > 0 && <div className={`path-connector ${isDone || isCurrent ? 'connector-active' : ''}`} />}
                    <div className="path-item-inner">
                      <button
                        className={nodeClass}
                        onClick={() => {
                          if (!isLocked && user) navigate(`/atividade/${id}/${activity.id}`)
                          else if (!user) navigate('/auth')
                        }}
                        disabled={isLocked}
                        title={isLocked ? 'Complete a atividade anterior' : activity.title}
                      >
                        <span className="node-icon">
                          {isDone ? '✅' : isLocked ? '🔒' : TYPE_ICONS[activityType]}
                        </span>
                      </button>
                      <div className="path-item-info">
                        <div className="path-item-type">
                          {TYPE_LABELS[activityType] || activityType}
                        </div>
                        <div className="path-item-title">{activity.title}</div>
                        <div className="path-item-xp">
                          ⚡ {activity.xp_reward} XP
                          {isDone && <span className="path-done-tag">Concluída</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Legenda */}
          <div className="trail-path-legend">
            <span className="legend-item"><span className="legend-dot done" />Concluída</span>
            <span className="legend-item"><span className="legend-dot current" />Atual</span>
            <span className="legend-item"><span className="legend-dot locked" />Bloqueada</span>
          </div>
        </div>
      </div>
    </>
  )
}
