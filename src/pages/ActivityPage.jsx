import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { trailsApi, activitiesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/layout/Navbar'
import { PoussinMascot } from '../components/ui/PoussinMascot'
import './ActivityPage.css'

/**
 * Atividade interativa — integrada ao backend.
 *
 * O backend armazena as atividades em trail.activities com um campo `payload` (JSON).
 * Para cada tipo de atividade, o payload tem estrutura diferente:
 *
 * MULTIPLE_CHOICE:
 *   { question: string, code?: string, options: string[], correct: number, hint?: string }
 *
 * FILL_BLANK:
 *   { sentence: string, blank: string, options: string[], correct: number, hint?: string }
 *
 * FIND_ERROR:
 *   { code: string, correct_line: number, explanation: string }
 *
 * ⚠️ O payload não é validado pelo backend — é um campo JSON livre (Activity.payload: Json).
 *    A estrutura acima é uma convenção esperada pelo frontend.
 */

export default function ActivityPage() {
  const { id } = useParams() // activity id
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [activity, setActivity] = useState(null)
  const [trail, setTrail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estado da atividade
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [xpEarned, setXpEarned] = useState(null)
  const [alreadyDone, setAlreadyDone] = useState(false)

  // Buscar a atividade via trilha (GET /api/trails/:trailId não expõe atividade individual)
  // ⚠️ O backend NÃO tem rota GET /api/activities/:id.
  //    Precisamos buscar a trilha completa e encontrar a atividade.
  //    Esta é uma limitação real do backend atual.
  useEffect(() => {
    async function loadActivity() {
      setLoading(true)
      setError('')
      try {
        // Busca todas as trilhas para encontrar a que contém esta atividade
        const trails = await trailsApi.list()
        for (const t of trails) {
          const detail = await trailsApi.getDetail(t.id)
          const act = detail.activities?.find(a => a.id === id)
          if (act) {
            setActivity(act)
            setTrail(detail)
            if (act.user_status === 'COMPLETED') setAlreadyDone(true)
            break
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadActivity()
  }, [id])

  const payload = activity?.payload || {}
  const type = activity?.type || 'MULTIPLE_CHOICE'

  const handleSelect = (index) => {
    if (answered) return
    setSelected(index)
  }

  const handleSubmit = async () => {
    if (selected === null || answered) return

    let correct = false
    if (type === 'MULTIPLE_CHOICE' || type === 'FILL_BLANK') {
      correct = selected === payload.correct
    } else if (type === 'FIND_ERROR') {
      correct = selected === payload.correct_line
    }

    setAnswered(true)
    setIsCorrect(correct)

    if (correct && user) {
      setSubmitting(true)
      try {
        const result = await activitiesApi.complete(id)
        setXpEarned(result.xp_earned || 0)
        if (result.already_completed) setAlreadyDone(true)
        await refreshUser()
      } catch (err) {
        // Silencioso — atividade pode já estar completa
        console.warn('[complete]', err.message)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleNext = () => {
    if (!trail) return
    const activities = trail.activities || []
    const currentIndex = activities.findIndex(a => a.id === id)
    const next = activities[currentIndex + 1]
    if (next && next.user_status !== 'COMPLETED') {
      navigate(`/atividade/${next.id}`)
    } else {
      navigate(`/trilhas/${trail.id}`)
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="loading-container" style={{ minHeight: '80vh', paddingTop: 80 }}>
        <div className="spinner spinner-lg" />
        <span>Carregando atividade...</span>
      </div>
    </>
  )

  if (error || !activity) return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 100 }}>
        <div className="alert alert-error">{error || 'Atividade não encontrada.'}</div>
        <Link to="/trilhas" className="btn btn-secondary">← Voltar</Link>
      </div>
    </>
  )

  const totalActivities = trail?.activities?.length || 0
  const currentIndex = trail?.activities?.findIndex(a => a.id === id) ?? 0
  const questionNum = currentIndex + 1

  return (
    <>
      <Navbar />
      <div className="activity-page" style={{ paddingTop: 64 }}>
        <div className="activity-container">

          {/* Header da atividade */}
          <div className="activity-header">
            <Link to={`/trilhas/${trail?.id}`} className="activity-back">← Voltar à trilha</Link>
            <div className="activity-progress-bar-wrap">
              <div className="progress-bar" style={{ height: 10 }}>
                <div
                  className="progress-fill yellow"
                  style={{ width: `${(questionNum / totalActivities) * 100}%` }}
                />
              </div>
              <span>Questão {questionNum} de {totalActivities}</span>
            </div>
            <div className="activity-hearts">
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: i < 3 ? '#FF4757' : '#E5E7EB', fontSize: '1.2rem' }}>♥</span>
              ))}
            </div>
          </div>

          <div className="activity-body">
            {/* Painel da questão */}
            <div className="activity-question-panel">
              <div className="activity-type-tag">
                {type === 'MULTIPLE_CHOICE' ? '📝 Múltipla escolha'
                  : type === 'FILL_BLANK' ? '✏️ Complete a lacuna'
                  : '🔍 Encontre o erro'}
              </div>

              {/* Enunciado */}
              {type === 'MULTIPLE_CHOICE' && (
                <>
                  <h2 className="activity-question">{payload.question || 'Questão sem enunciado'}</h2>
                  {payload.code && (
                    <div className="activity-code-block">
                      <div className="code-dots">
                        <span className="code-dot red"/><span className="code-dot yellow"/><span className="code-dot green"/>
                      </div>
                      <pre>{payload.code}</pre>
                    </div>
                  )}
                </>
              )}

              {type === 'FILL_BLANK' && (
                <h2 className="activity-question">
                  Complete:{' '}
                  <span className="fill-blank-sentence">{payload.sentence || '...'}</span>
                </h2>
              )}

              {type === 'FIND_ERROR' && (
                <>
                  <h2 className="activity-question">Qual linha contém o erro?</h2>
                  <div className="activity-code-block find-error-code">
                    <div className="code-dots">
                      <span className="code-dot red"/><span className="code-dot yellow"/><span className="code-dot green"/>
                    </div>
                    {payload.code?.split('\n').map((line, i) => (
                      <div
                        key={i}
                        className={`code-line ${selected === i ? 'selected-line' : ''} ${answered && i === payload.correct_line ? 'correct-line' : ''} ${answered && i === selected && selected !== payload.correct_line ? 'wrong-line' : ''}`}
                        onClick={() => handleSelect(i)}
                      >
                        <span className="line-num">{i + 1}</span>
                        <pre>{line}</pre>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Opções */}
              {(type === 'MULTIPLE_CHOICE' || type === 'FILL_BLANK') && (
                <div className="activity-options">
                  <p className="options-label">Escolha a resposta correta</p>
                  {(payload.options || []).map((opt, i) => {
                    let cls = 'option-btn'
                    if (selected === i && !answered) cls += ' selected'
                    if (answered && i === payload.correct) cls += ' correct'
                    if (answered && selected === i && i !== payload.correct) cls += ' wrong'
                    return (
                      <button key={i} className={cls} onClick={() => handleSelect(i)}>
                        <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Botão confirmar / próxima */}
              {!answered ? (
                <button
                  className="btn btn-primary btn-lg activity-confirm-btn"
                  disabled={selected === null || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? <><div className="spinner" />Verificando...</> : 'Verificar resposta'}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg activity-confirm-btn"
                  onClick={handleNext}
                >
                  Próxima questão →
                </button>
              )}
            </div>

            {/* Painel de feedback */}
            <div className="activity-feedback-panel">
              {!answered ? (
                <div className="feedback-idle">
                  <PoussinMascot size={100} animate />
                  <p>Escolha sua resposta e clique em "Verificar"!</p>
                </div>
              ) : isCorrect ? (
                <div className="feedback-correct">
                  <PoussinMascot size={100} animate />
                  <div className="feedback-title feedback-correct-title">Correto! 🎉</div>
                  <div className="feedback-hint">
                    {payload.hint || 'Muito bem! Continue assim!'}
                  </div>
                  {xpEarned !== null && xpEarned > 0 && (
                    <div className="feedback-xp">
                      <span>⚡ +{xpEarned} XP ganhos!</span>
                    </div>
                  )}
                  {alreadyDone && (
                    <div className="feedback-already">Você já havia concluído esta atividade.</div>
                  )}
                </div>
              ) : (
                <div className="feedback-wrong">
                  <PoussinMascot size={80} />
                  <div className="feedback-title feedback-wrong-title">Ops! Tente de novo 😅</div>
                  <div className="feedback-hint">
                    {payload.hint || type === 'FIND_ERROR'
                      ? payload.explanation || 'Verifique o código com atenção!'
                      : 'Revise o conceito e tente novamente!'}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
