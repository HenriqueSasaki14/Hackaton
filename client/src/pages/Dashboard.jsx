import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../services/api'
import { useData } from '../hooks/useData'
import { Navbar } from '../components/layout/Navbar'
import { PoussinMascot } from '../components/ui/PoussinMascot'
import { Icons, getTrailIcon } from '../components/ui/Icons'
import './Dashboard.css'

function xpToLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
function xpForNextLevel(level) {
  return level * level * 100
}
function xpForCurrentLevel(level) {
  return (level - 1) * (level - 1) * 100
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: ranking, loading: rankLoading } = useData(() => usersApi.getRanking())

  if (!user) return null

  const level = xpToLevel(user.xp_total)
  const xpCurrent = user.xp_total - xpForCurrentLevel(level)
  const xpNeeded = xpForNextLevel(level) - xpForCurrentLevel(level)
  const levelProgress = Math.min(100, Math.round((xpCurrent / xpNeeded) * 100))

  const userRank = ranking ? ranking.findIndex(u => u.id === user.id) + 1 : null

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">

        {/* ── Sidebar ── */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-logo">
            <PoussinMascot size={36} />
            <span>Poussin<br /><strong>Learning</strong></span>
          </div>
          <nav className="sidebar-nav">
            {[
              { label: 'Início',        path: '/dashboard',   emoji: '🏠' },
              { label: 'Trilhas',       path: '/trilhas',     emoji: '📚' },
              { label: 'Atividades',    path: '/trilhas',     emoji: '⚡' },
              { label: 'Projetos',      path: '/projetos',    emoji: '💻' },
              { label: 'Comunidade',    path: '/comunidade',  emoji: '👥' },
              { label: 'Conquistas',    path: '/conquistas',  emoji: '🏅' },
              { label: 'Configurações', path: '/perfil',      emoji: '⚙️' },
            ].map(item => (
              <Link key={item.path + item.label} to={item.path} className="sidebar-link">
                <span className="sidebar-icon">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* ── Conteúdo principal ── */}
        <main className="dashboard-main">

          {/* Header de boas-vindas */}
          <div className="dash-welcome">
            <div className="dash-welcome-text">
              <h1>Olá, {user.name?.split(' ')[0]}! 👋</h1>
              <p>Continue aprendendo e mantenha seu streak!</p>
            </div>
            <div className="dash-welcome-mascot">
              <PoussinMascot size={80} animate />
            </div>
          </div>

          {/* Stats chips */}
          <div className="dash-stats">
            <div className="dash-stat-card dash-stat-streak">
              <div className="dash-stat-icon">🔥</div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{user.streak_count}</span>
                <span className="dash-stat-label">dias de streak</span>
              </div>
            </div>

            <div className="dash-stat-card dash-stat-level">
              <div className="dash-stat-icon">⭐</div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">Nível {level}</span>
                <span className="dash-stat-label">{user.name?.split(' ')[0]}</span>
              </div>
            </div>

            <div className="dash-stat-card dash-stat-xp">
              <div className="dash-stat-icon">⚡</div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{user.xp_total.toLocaleString()}</span>
                <span className="dash-stat-label">XP total</span>
              </div>
            </div>

            {userRank && (
              <div className="dash-stat-card dash-stat-rank">
                <div className="dash-stat-icon">🏆</div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value">#{userRank}</span>
                  <span className="dash-stat-label">no ranking</span>
                </div>
              </div>
            )}
          </div>

          <div className="dash-grid">
            {/* Progresso de nível */}
            <div className="card dash-progress-card">
              <h3>Seu progresso</h3>
              <div className="level-progress-info">
                <span>Nível {level}</span>
                <span>{xpCurrent} / {xpNeeded} XP</span>
                <span>Nível {level + 1}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill yellow" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="level-progress-hint">
                Faltam <strong>{xpNeeded - xpCurrent} XP</strong> para o próximo nível!
              </p>

              {/* Conquistas/Badges — dados reais de user.badges */}
              <h4 style={{ marginTop: 24, marginBottom: 12 }}>Conquistas recentes</h4>
              {user.badges && user.badges.length > 0 ? (
                <div className="badges-grid">
                  {user.badges.slice(0, 6).map(ub => (
                    <div className="badge-item" key={ub.id} title={ub.badge.description}>
                      <span className="badge-icon">{ub.badge.icon}</span>
                      <span className="badge-name">{ub.badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="badges-empty">
                  <span>🔒 Complete atividades para ganhar conquistas!</span>
                </div>
              )}
            </div>

            {/* Painel direito */}
            <div className="dash-right">

              {/* Continuar aprendendo */}
              <div className="card dash-continue-card">
                <div className="dash-continue-header">
                  <h3>Continuar aprendendo</h3>
                  <Link to="/trilhas" className="btn btn-primary btn-sm">Ver trilhas</Link>
                </div>
                <div className="dash-continue-item">
                  <div className="dash-continue-icon" style={{ background: '#FFFCE0' }}>
                    <Icons.JS />
                  </div>
                  <div>
                    <p className="dash-continue-title">JavaScript</p>
                    <p className="dash-continue-sub">Interatividade na web</p>
                    <div className="progress-bar" style={{ marginTop: 6, height: 6 }}>
                      <div className="progress-fill yellow" style={{ width: '65%' }} />
                    </div>
                    {/* ⚠️ Porcentagem de progresso detalhado por trilha está na rota GET /api/trails 
                           (campo progress_percent), mas requer ID da trilha específica. 
                           Use fallback visual até implementar busca por trilha ativa. */}
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 16 }}
                  onClick={() => window.location.href = '/trilhas'}
                >
                  Continuar aprendendo
                </button>
              </div>

              {/* Atividades de hoje */}
              <div className="card dash-today-card">
                <h3>Atividades de hoje</h3>
                {/* ⚠️ Não existe endpoint GET /api/activities/today no backend atual.
                       Exibindo placeholder. Para implementar, seria necessário criar:
                       GET /api/activities/today — retorna atividades recomendadas do dia */}
                <div className="dash-today-list">
                  <div className="dash-today-item">
                    <div className="dash-today-dot today-todo" />
                    <span>Variáveis e tipos de dados</span>
                    <span className="today-xp">+20 XP</span>
                  </div>
                  <div className="dash-today-item">
                    <div className="dash-today-dot today-todo" />
                    <span>Condições (if/else)</span>
                    <span className="today-xp">+20 XP</span>
                  </div>
                  <div className="dash-today-item">
                    <div className="dash-today-dot today-challenge" />
                    <span>Desafio: Par ou ímpar</span>
                    <span className="today-xp today-xp-bonus">+35 XP</span>
                  </div>
                </div>
                <p className="today-fallback-note">
                  ⚠️ Atividades sugeridas — endpoint <code>/api/activities/today</code> pendente.
                </p>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="card dash-ranking-card">
            <div className="dash-ranking-header">
              <h3>🏆 Ranking de XP</h3>
              <Link to="/comunidade" className="btn btn-secondary btn-sm">Ver todos</Link>
            </div>
            {rankLoading ? (
              <div className="loading-container" style={{ padding: '24px' }}>
                <div className="spinner" />
              </div>
            ) : ranking ? (
              <div className="ranking-list">
                {ranking.slice(0, 5).map((u, i) => (
                  <div className={`ranking-item ${u.id === user.id ? 'ranking-me' : ''}`} key={u.id}>
                    <span className="ranking-pos">{i + 1 === 1 ? '🥇' : i + 1 === 2 ? '🥈' : i + 1 === 3 ? '🥉' : `#${i + 1}`}</span>
                    <div className="ranking-avatar">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt={u.name} />
                        : <span>{u.name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <span className="ranking-name">{u.name} {u.id === user.id && '(você)'}</span>
                    <div className="ranking-right">
                      <span className="stat-chip"><Icons.Bolt />{u.xp_total.toLocaleString()} XP</span>
                      <span className="ranking-streak">🔥 {u.streak_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ padding: '16px', color: 'var(--gray-mid)' }}>Nenhum dado disponível.</p>
            )}
          </div>

        </main>
      </div>
    </>
  )
}
