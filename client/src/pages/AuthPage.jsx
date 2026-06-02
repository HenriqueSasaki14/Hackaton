import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PoussinMascot } from '../components/ui/PoussinMascot'
import './AuthPage.css'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'cadastro' ? 'cadastro' : 'login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Cadastro state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { login, register, user } = useAuth()
  const navigate = useNavigate()

  // Se já logado, redireciona
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!loginEmail || !loginPassword) { setError('Preencha e-mail e senha.'); return }
    setLoading(true)
    try {
      await login(loginEmail, loginPassword)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError('Preencha todos os campos.'); return
    }
    if (regPassword !== regConfirm) {
      setError('As senhas não conferem.'); return
    }
    if (regPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.'); return
    }
    setLoading(true)
    try {
      await register(regName, regEmail, regPassword)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo-link">
            <span className="auth-logo-text">Poussin Learning</span>
          </Link>
          <PoussinMascot size={180} showSign animate />
          <div className="auth-perks">
            <div className="auth-perk">⚡ XP e níveis ao completar atividades</div>
            <div className="auth-perk">🔥 Streaks e conquistas exclusivas</div>
            <div className="auth-perk">💻 Projetos reais para o portfólio</div>
            <div className="auth-perk">👥 Comunidade ativa de devs</div>
          </div>
          <p className="auth-tagline">
            {tab === 'login' ? 'Boas-vindas de volta!' : 'Faça login para continuar sua jornada.'}
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError('') }}
            >
              Entrar
            </button>
            <button
              className={`auth-tab ${tab === 'cadastro' ? 'active' : ''}`}
              onClick={() => { setTab('cadastro'); setError('') }}
            >
              Criar conta
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form" noValidate>
              <div className="form-group">
                <label className="label">E-mail ou usuário</label>
                <input
                  className="input"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="label">Senha</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <div className="auth-forgot">
                  {/* ⚠️ Endpoint de recuperação de senha ainda não existe no backend */}
                  <span className="auth-forgot-link">Esqueci minha senha</span>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? <><div className="spinner" />Entrando...</> : 'Entrar'}
              </button>
              <p className="auth-switch">
                Não tem uma conta?{' '}
                <button type="button" className="auth-switch-link" onClick={() => setTab('cadastro')}>
                  Criar conta
                </button>
              </p>
            </form>
          )}

          {/* CADASTRO */}
          {tab === 'cadastro' && (
            <form onSubmit={handleRegister} className="auth-form" noValidate>
              <div className="form-group">
                <label className="label">Nome completo</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Seu nome"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label className="label">E-mail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="seu@email.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="label">Senha</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Mín. 6 caracteres"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="label">Confirmar senha</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Repita a senha"
                  value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? <><div className="spinner" />Criando conta...</> : 'Criar conta grátis'}
              </button>
              <p className="auth-switch">
                Já tem conta?{' '}
                <button type="button" className="auth-switch-link" onClick={() => setTab('login')}>
                  Entrar
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
