import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi, trailsApi } from '../services/api'
import { useData } from '../hooks/useData'
import { Navbar } from '../components/layout/Navbar'
import './ProjectsPage.css'

function NewProjectModal({ trails, onClose, onCreated }) {
  const [form, setForm] = useState({ trail_id: '', title: '', description: '', code_url: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.trail_id || !form.title || !form.description || !form.code_url) {
      setError('Preencha todos os campos.'); return
    }
    setLoading(true)
    try {
      const project = await projectsApi.create(form)
      onCreated(project)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Projeto</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="label">Trilha relacionada</label>
            <select
              className="input"
              value={form.trail_id}
              onChange={e => setForm(f => ({ ...f, trail_id: e.target.value }))}
            >
              <option value="">Selecione uma trilha</option>
              {(trails || []).map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Título do projeto</label>
            <input className="input" type="text" placeholder="Ex: Lista de Tarefas" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="label">Descrição</label>
            <textarea
              className="input"
              placeholder="Descreva seu projeto..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="form-group">
            <label className="label">URL do código</label>
            <input className="input" type="url" placeholder="https://github.com/..." value={form.code_url} onChange={e => setForm(f => ({...f, code_url: e.target.value}))} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Criando...' : 'Criar projeto'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [showModal, setShowModal] = useState(false)
  const [publishing, setPublishing] = useState(null)
  const [publishError, setPublishError] = useState('')

  const { data: myProjects, loading, error, refetch } = useData(() => projectsApi.getMy())
  const { data: trails } = useData(() => trailsApi.list())

  const handleCreated = () => refetch()

  const handlePublish = async (id) => {
    setPublishing(id)
    setPublishError('')
    try {
      await projectsApi.publish(id)
      refetch()
    } catch (err) {
      setPublishError(err.message)
    } finally {
      setPublishing(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className="projects-page" style={{ paddingTop: 64 }}>
        <div className="container projects-container">

          <div className="projects-header">
            <div>
              <h1>Meus Projetos</h1>
              <p>Crie projetos, edite e publique na comunidade após concluir 100% da trilha.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Novo projeto
            </button>
          </div>

          {publishError && (
            <div className="alert alert-error">{publishError}</div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="spinner spinner-lg" />
              <span>Carregando projetos...</span>
            </div>
          )}

          {error && <div className="alert alert-error">Erro: {error}</div>}

          {myProjects && myProjects.length === 0 && (
            <div className="empty-state" style={{ marginTop: 40 }}>
              <div className="icon">💻</div>
              <h3>Nenhum projeto ainda!</h3>
              <p>Crie seu primeiro projeto e publique na comunidade.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Novo projeto
              </button>
            </div>
          )}

          {myProjects && myProjects.length > 0 && (
            <div className="my-projects-grid">
              {myProjects.map(project => (
                <div className="my-project-card card" key={project.id}>
                  <div className="my-project-header">
                    <h3>{project.title}</h3>
                    <span className={`pill ${project.status === 'PUBLISHED' ? 'pill-green' : 'pill-yellow'}`}>
                      {project.status === 'PUBLISHED' ? '✅ Publicado' : '📝 Rascunho'}
                    </span>
                  </div>
                  <p className="my-project-desc">{project.description}</p>
                  <div className="my-project-trail">
                    📚 {project.trail?.title || 'Trilha'}
                  </div>
                  <div className="my-project-footer">
                    <a href={project.code_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                      Ver código →
                    </a>
                    {project.status === 'DRAFT' && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={publishing === project.id}
                        onClick={() => handlePublish(project.id)}
                        title="Requer 100% da trilha concluída"
                      >
                        {publishing === project.id ? 'Publicando...' : 'Publicar'}
                      </button>
                    )}
                    {project.status === 'PUBLISHED' && (
                      <div className="my-project-likes">❤️ {project.likes_count} curtidas</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {showModal && (
        <NewProjectModal
          trails={trails}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
