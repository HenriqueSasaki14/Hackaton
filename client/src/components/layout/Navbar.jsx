import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PoussinMascot } from '../ui/PoussinMascot'
import { Icons } from '../ui/Icons'
import './Navbar.css'

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <PoussinMascot size={40} />
          <span className="navbar-brand">
            Poussin<br />
            <strong>Learning</strong>
          </span>
        </Link>

        {/* Links desktop */}
        <ul className="navbar-links">
          <li><Link to="/trilhas" className={isActive('/trilhas') ? 'active' : ''}>Trilhas</Link></li>
          <li><Link to="/comunidade" className={isActive('/comunidade') ? 'active' : ''}>Comunidade</Link></li>
          {user && <li><Link to="/projetos" className={isActive('/projetos') ? 'active' : ''}>Meus Projetos</Link></li>}
          {isAdmin && <li><Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Admin</Link></li>}
        </ul>

        {/* Ações */}
        <div className="navbar-actions">
          {user ? (
            <>
              <div className="navbar-user">
                <Link to="/dashboard" className="navbar-stat">
                  <Icons.Fire />
                  <span>{user.streak_count}</span>
                </Link>
                <Link to="/dashboard" className="navbar-stat">
                  <Icons.Bolt />
                  <span>{user.xp_total} XP</span>
                </Link>
                <Link to="/dashboard" className="navbar-avatar" title={user.name}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} />
                    : <span>{user.name?.[0]?.toUpperCase()}</span>
                  }
                </Link>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-secondary btn-sm">Entrar</Link>
              <Link to="/auth?tab=cadastro" className="btn btn-primary btn-sm">Começar agora</Link>
            </>
          )}
        </div>

        {/* Hamburger mobile */}
        <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <Icons.X /> : <Icons.Menu />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="navbar-mobile" onClick={() => setMenuOpen(false)}>
          <Link to="/trilhas">Trilhas</Link>
          <Link to="/comunidade">Comunidade</Link>
          {user && <Link to="/projetos">Meus Projetos</Link>}
          {user && <Link to="/dashboard">Dashboard</Link>}
          {isAdmin && <Link to="/admin">Admin</Link>}
          {user
            ? <button onClick={handleLogout}>Sair</button>
            : <><Link to="/auth">Entrar</Link><Link to="/auth?tab=cadastro">Cadastrar</Link></>
          }
        </div>
      )}
    </nav>
  )
}
