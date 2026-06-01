import { Link } from 'react-router-dom'
import { PoussinMascot } from '../ui/PoussinMascot'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <PoussinMascot size={48} />
          <div>
            <p className="footer-brand-name">Poussin Learning</p>
            <p className="footer-tagline">Aprenda programação.<br/>Construa o futuro. Divirta-se!</p>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Aprender</h4>
            <Link to="/trilhas">Trilhas</Link>
            <Link to="/trilhas">HTML & CSS</Link>
            <Link to="/trilhas">JavaScript</Link>
            <Link to="/trilhas">Python</Link>
          </div>
          <div className="footer-col">
            <h4>Comunidade</h4>
            <Link to="/comunidade">Projetos</Link>
            <Link to="/comunidade">Ranking</Link>
          </div>
          <div className="footer-col">
            <h4>Conta</h4>
            <Link to="/auth">Entrar</Link>
            <Link to="/login?tab=cadastro">Cadastrar</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Poussin Learning. Feito com 💛 para devs em formação.</p>
      </div>
    </footer>
  )
}
