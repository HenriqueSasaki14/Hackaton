import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi, usersApi } from '../services/api'
import { useData } from '../hooks/useData'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import './CommunityPage.css'

function ProjectCard({ project, onLike, currentUserId }) {
  const [liking, setLiking] = useState(false)
  const [likes, setLikes] = useState(project.likes_count)

  const handleLike = async () => {
    if (!currentUserId || liking) return
    setLiking(true)
    try {
      const result = await onLike(project.id)
      setLikes(prev => result.liked ? prev + 1 : prev - 1)
    } catch {}
    finally { setLiking(false) }
  }

  return (
    <div className="community-project-card card">
      <div className="community-project-header">
        <div className="project-author-avatar">
          {project.user?.avatar_url
            ? <img src={project.user.avatar_url} alt={project.user?.name} />
            : <span>{project.user?.name?.[0]?.toUpperCase() || '?'}</span>
          }
        </div>
        <div>
          <p className="project-author-name">{project.user?.name || 'Anônimo'}</p>
          <p className="project-trail-tag">{project.trail?.title || 'Projeto'}</p>
        </div>
        <span className="project-date">
          {new Date(project.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      <div className="community-project-body">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
      </div>

      <div className="community-project-footer">
        <button
          className={`project-like-btn ${liking ? 'liking' : ''}`}
          onClick={handleLike}
          disabled={!currentUserId || liking}
          title={!currentUserId ? 'Faça login para curtir' : 'Curtir'}
        >
          ❤️ {likes}
        </button>
        <a
          href={project.code_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
        >
          Ver projeto →
        </a>
      </div>
    </div>
  )
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('projetos')

  const { data: projects, loading: projLoading, error: projError, refetch } = useData(() => projectsApi.getFeed())
  const { data: ranking, loading: rankLoading } = useData(() => usersApi.getRanking())

  const handleLike = async (id) => {
    return await projectsApi.toggleLike(id)
  }

  return (
    <>
      <Navbar />
      <main className="community-page" style={{ paddingTop: 64 }}>

        <div className="community-hero">
          <div className="container">
            <h1>Comunidade</h1>
            <p>Veja projetos publicados por alunos, inspire-se e curta os melhores!</p>
            {user && (
              <Link to="/projetos/novo" className="btn btn-primary">+ Novo projeto</Link>
            )}
          </div>
        </div>

        <div className="container community-layout">

          {/* Tabs */}
          <div className="community-tabs">
            <button
              className={`community-tab ${tab === 'projetos' ? 'active' : ''}`}
              onClick={() => setTab('projetos')}
            >
              📁 Projetos
            </button>
            <button
              className={`community-tab ${tab === 'ranking' ? 'active' : ''}`}
              onClick={() => setTab('ranking')}
            >
              🏆 Ranking
            </button>
          </div>

          {/* Projetos */}
          {tab === 'projetos' && (
            <div className="community-projects-section">
              {projLoading && (
                <div className="loading-container">
                  <div className="spinner spinner-lg" />
                  <span>Carregando projetos...</span>
                </div>
              )}
              {projError && (
                <div className="alert alert-error">Erro: {projError}</div>
              )}
              {projects && projects.length === 0 && (
                <div className="empty-state">
                  <div className="icon">💻</div>
                  <h3>Nenhum projeto publicado ainda!</h3>
                  <p>Seja o primeiro a publicar um projeto.</p>
                  {user && <Link to="/projetos/novo" className="btn btn-primary">Criar projeto</Link>}
                </div>
              )}
              {projects && projects.length > 0 && (
                <div className="community-projects-grid">
                  {projects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onLike={handleLike}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ranking */}
          {tab === 'ranking' && (
            <div className="community-ranking-section">
              <h2 className="community-section-title">🏆 Top alunos por XP</h2>
              {rankLoading ? (
                <div className="loading-container">
                  <div className="spinner spinner-lg" />
                </div>
              ) : ranking ? (
                <div className="community-ranking-list">
                  {ranking.map((u, i) => (
                    <div
                      key={u.id}
                      className={`community-ranking-item ${u.id === user?.id ? 'ranking-me' : ''}`}
                    >
                      <span className="rank-pos">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <div className="rank-avatar">
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt={u.name} />
                          : <span>{u.name?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className="rank-info">
                        <span className="rank-name">{u.name} {u.id === user?.id && '(você)'}</span>
                        <span className="rank-streak">🔥 {u.streak_count} dias</span>
                      </div>
                      <div className="rank-xp">
                        <span className="stat-chip">⚡ {u.xp_total.toLocaleString()} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
