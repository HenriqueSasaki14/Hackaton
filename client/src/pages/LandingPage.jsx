import { Link } from 'react-router-dom'
import { useData } from '../hooks/useData'
import { trailsApi } from '../services/api'
import { PoussinMascot } from '../components/ui/PoussinMascot'
import { getTrailIcon } from '../components/ui/Icons'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import './LandingPage.css'

// Dados estáticos de fallback visual para a landing (não dependem de auth)
const STEPS = [
  { num: '1', title: 'Aprenda', desc: 'Aulas curtas e atividades interativas', emoji: '🐣' },
  { num: '2', title: 'Pratique', desc: 'Exercícios, quizzes e desafios diários', emoji: '🔥' },
  { num: '3', title: 'Construa', desc: 'Mini projetos para aplicar seu conhecimento', emoji: '🏆' },
  { num: '4', title: 'Evolua', desc: 'Ganhe XP, desbloqueie conquistas e suba de nível', emoji: '⭐' },
]

const GAMIFICATION = [
  { icon: '⚡', title: 'XP & Níveis', desc: 'Ganhe pontos ao completar atividades e suba de nível.' },
  { icon: '🔥', title: 'Streaks', desc: 'Mantenha sua sequência diária e ganhe bônus exclusivos.' },
  { icon: '🏅', title: 'Conquistas', desc: 'Desbloqueie badges especiais ao atingir marcos importantes.' },
  { icon: '🏆', title: 'Ranking', desc: 'Compita com outros alunos e apareça no top da plataforma.' },
]

export default function LandingPage() {
  // Busca trilhas reais do backend (rota pública, optionalAuth)
  const { data: trails, loading } = useData(() => trailsApi.list())

  return (
    <>
      <Navbar />
      <main className="landing">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg-dots" />
          <div className="container hero-inner">
            <div className="hero-text">
              <div className="hero-badge">
                <span>🐣</span> Nova plataforma de programação
              </div>
              <h1 className="hero-title">
                Aprenda código com{' '}
                <span className="hero-highlight">diversão</span> e propósito!
              </h1>
              <p className="hero-subtitle">
                Trilhas interativas, desafios e projetos reais para você evoluir do zero ao avançado.
              </p>
              <div className="hero-cta">
                <Link to="/login?tab=cadastro" className="btn btn-primary btn-lg">
                  Começar agora →
                </Link>
                <Link to="/trilhas" className="btn btn-secondary btn-lg">
                  Ver trilhas
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat"><strong>+2.5k</strong><span>Alunos ativos</span></div>
                <div className="hero-stat-sep" />
                <div className="hero-stat"><strong>6</strong><span>Trilhas</span></div>
                <div className="hero-stat-sep" />
                <div className="hero-stat"><strong>100%</strong><span>Gratuito</span></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card-float hero-card-xp">
                <span>⚡</span> +50 XP
              </div>
              <div className="hero-card-float hero-card-streak">
                <span>🔥</span> 7 dias seguidos!
              </div>
              <PoussinMascot size={220} showSign animate />
              <div className="hero-card-float hero-card-badge">
                <span>🏅</span> Nova conquista!
              </div>
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section className="section como-funciona">
          <div className="container">
            <h2 className="section-title">Como funciona</h2>
            <div className="steps-grid">
              {STEPS.map((s, i) => (
                <div className="step-card" key={i}>
                  <div className="step-icon">{s.emoji}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  {i < STEPS.length - 1 && <div className="step-arrow">›</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRILHAS (dados reais) ── */}
        <section className="section trilhas-landing" style={{ background: 'var(--off-white)' }}>
          <div className="container">
            <h2 className="section-title">Trilhas de aprendizado</h2>
            <p className="section-subtitle">Do básico ao avançado, no seu ritmo.</p>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
              </div>
            ) : trails && trails.length > 0 ? (
              <>
                <div className="trails-grid">
                  {trails.slice(0, 6).map(trail => {
                    const { Icon, color, bg } = getTrailIcon(trail.title)
                    return (
                      <Link to={`/trilhas/${trail.id}`} className="trail-card-mini card" key={trail.id}>
                        <div className="trail-card-icon" style={{ background: bg }}>
                          <span style={{ fontSize: '2rem', color }}><Icon /></span>
                        </div>
                        <div className="trail-card-info">
                          <h3>{trail.title}</h3>
                          <p className="trail-card-desc">{trail.description}</p>
                          <div className="trail-card-meta">
                            <span className={`pill pill-${trail.difficulty === 'BEGINNER' ? 'green' : trail.difficulty === 'INTERMEDIATE' ? 'yellow' : 'red'}`}>
                              {trail.difficulty === 'BEGINNER' ? 'Iniciante' : trail.difficulty === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}
                            </span>
                            <span className="trail-card-count">
                              {trail._count?.activities ?? 0} atividades
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <Link to="/trilhas" className="btn btn-outline-yellow btn-lg">
                    Ver todas as trilhas →
                  </Link>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="icon">🐣</div>
                <h3>Trilhas em breve!</h3>
                <p>O conteúdo está sendo preparado. Cadastre-se para ser notificado.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── GAMIFICAÇÃO / MINI PROJETOS / COMUNIDADE ── */}
        <section className="section features-section">
          <div className="container features-grid">
            <div className="feature-block">
              <div className="feature-header">
                <span className="feature-emoji">🎮</span>
                <h2>Gamificação</h2>
              </div>
              <p>Ganhe XP, mantenha sua streak, desbloqueie níveis e conquistas incríveis.</p>
              <div className="gamif-items">
                {GAMIFICATION.map((g, i) => (
                  <div className="gamif-item" key={i}>
                    <span>{g.icon}</span>
                    <div>
                      <strong>{g.title}</strong>
                      <p>{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-block feature-block-dark">
              <div className="feature-header">
                <span className="feature-emoji">💻</span>
                <h2>Mini projetos</h2>
              </div>
              <p>Construa projetos reais e publique na comunidade para ganhar visibilidade.</p>
              <div className="feature-preview-code">
                <span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" />
                <pre>{`function hello() {
  console.log("Hello, Poussin!");
}`}</pre>
              </div>
              <Link to="/trilhas" className="btn btn-primary">Ver projetos</Link>
            </div>

            <div className="feature-block feature-block-yellow">
              <div className="feature-header">
                <span className="feature-emoji">👥</span>
                <h2>Comunidade</h2>
              </div>
              <p>Compartilhe, inspire-se e aprenda com outros desenvolvedores em formação!</p>
              <div className="community-avatars">
                {['A','B','C','D','E'].map((l, i) => (
                  <div className="community-avatar" key={i} style={{
                    background: ['#FFD43B','#51CF66','#339AF0','#FF922B','#845EF7'][i],
                    marginLeft: i > 0 ? -10 : 0,
                  }}>{l}</div>
                ))}
                <span className="community-count">+2.5k alunos</span>
              </div>
              <Link to="/comunidade" className="btn btn-dark">Ver comunidade</Link>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="cta-final">
          <div className="container cta-final-inner">
            <PoussinMascot size={100} animate />
            <div>
              <h2>Pronto para começar sua jornada?</h2>
              <p>Junte-se a milhares de estudantes e transforme seu futuro com código.</p>
            </div>
            <Link to="/login?tab=cadastro" className="btn btn-primary btn-lg">
              Começar agora grátis →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
