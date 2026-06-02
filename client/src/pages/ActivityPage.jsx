import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { trailsApi, activitiesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PoussinMascot } from '../components/ui/PoussinMascot'
import './ActivityPage.css'

const TYPE_LABELS = {
  MULTIPLE_CHOICE: '📝 Múltipla escolha',
  FILL_BLANK:      '✏️ Complete a lacuna',
  FIND_ERROR:      '🔍 Encontre o erro',
}

export default function ActivityPage() {
  // Bug fix: rota é /atividade/:trailId/:activityId — precisa de ambos os params
  const { trailId, activityId } = useParams()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [activity, setActivity] = useState(null)
  const [trail, setTrail]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const [selected, setSelected]     = useState(null)
  const [fillInput, setFillInput]   = useState('')
  const [answered, setAnswered]     = useState(false)
  const [isCorrect, setIsCorrect]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [xpEarned, setXpEarned]     = useState(null)
  const [alreadyDone, setAlreadyDone] = useState(false)

  // Bug fix: carrega a trilha diretamente via trailId — não varre todas as trilhas
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      setSelected(null)
      setFillInput('')
      setAnswered(false)
      setIsCorrect(false)
      setXpEarned(null)
      setAlreadyDone(false)
      try {
        const trailData = await trailsApi.getDetail(trailId)
        const act = trailData.activities?.find(a => a.id === activityId)
        setTrail(trailData)
        if (!act) throw new Error('Atividade não encontrada')
        setActivity(act)
        if (act.user_status === 'COMPLETED') setAlreadyDone(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [trailId, activityId])

  const payload = activity?.payload || {}
  const type    = activity?.type    || 'MULTIPLE_CHOICE'

  // Bug fix: backend usa options[].isCorrect — não payload.correct
  const options      = payload.options || []
  const correctIndex = options.findIndex(o => o.isCorrect)

  // Suporte ao formato legado do seed: FILL_BLANK com gaps[] mas sem options[]
  const isLegacyFillBlank =
    type === 'FILL_BLANK' && options.length === 0 && payload.gaps?.length > 0

  const canSubmit = isLegacyFillBlank
    ? fillInput.trim().length > 0
    : selected !== null

  const handleSelect = (i) => {
    if (answered) return
    setSelected(i)
  }

  const handleSubmit = async () => {
    if (!canSubmit || answered) return

    let correct = false
    if (isLegacyFillBlank) {
      correct = fillInput.trim().toLowerCase() === (payload.gaps?.[0] ?? '').toLowerCase()
    } else {
      correct = selected === correctIndex
    }

    setAnswered(true)
    setIsCorrect(correct)

    if (correct && user) {
      setSubmitting(true)
      try {
        const result = await activitiesApi.complete(activityId)
        setXpEarned(result.xp_earned ?? 0)
        if (result.already_completed) setAlreadyDone(true)
        await refreshUser()
      } catch (err) {
        console.warn('[complete]', err.message)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleRetry = () => {
    setSelected(null)
    setFillInput('')
    setAnswered(false)
    setIsCorrect(false)
    setXpEarned(null)
  }

  const handleNext = () => {
    if (!trail) return
    const acts       = trail.activities || []
    const currentIdx = acts.findIndex(a => a.id === activityId)
    const next       = acts[currentIdx + 1]
    if (next) {
      // Bug fix: inclui trailId na rota
      navigate(`/atividade/${trailId}/${next.id}`)
    } else {
      navigate(`/trilhas/${trailId}`)
    }
  }

  if (loading) return (
    <div className="loading-container" style={{ minHeight: '80vh' }}>
      <div className="spinner spinner-lg" />
      <span>Carregando atividade...</span>
    </div>
  )

  if (error || !activity) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="alert alert-error">{error || 'Atividade não encontrada.'}</div>
      <Link to="/trilhas" className="btn btn-secondary">← Voltar às trilhas</Link>
    </div>
  )

  const totalActivities = trail?.activities?.length || 0
  const currentIndex    = trail?.activities?.findIndex(a => a.id === activityId) ?? 0
  const questionNum     = currentIndex + 1
  const isLast          = questionNum === totalActivities

  return (
    <div className="activity-page">
      <div className="activity-container">

        {/* Header com barra de progresso */}
        <div className="activity-header">
          <Link to={`/trilhas/${trailId}`} className="activity-back">← Trilha</Link>
          <div className="activity-progress-bar-wrap">
            <div className="progress-bar" style={{ height: 10 }}>
              <div
                className="progress-fill yellow"
                style={{ width: `${(questionNum / totalActivities) * 100}%` }}
              />
            </div>
            <span>{questionNum} / {totalActivities}</span>
          </div>
          <div className="activity-hearts">
            {[...Array(3)].map((_, i) => (
              <span key={i} style={{ fontSize: '1.2rem' }}>♥</span>
            ))}
          </div>
        </div>

        <div className="activity-body">

          {/* Painel da questão */}
          <div className="activity-question-panel">
            <div className="activity-type-tag">{TYPE_LABELS[type]}</div>

            <h2 className="activity-question">{payload.question || 'Questão'}</h2>

            {/* Bloco de código — exibido quando existe code_snippet */}
            {payload.code_snippet && (
              <div className="activity-code-block">
                <div className="code-dots">
                  <span className="code-dot red"/>
                  <span className="code-dot yellow"/>
                  <span className="code-dot green"/>
                </div>
                <pre>{payload.code_snippet}</pre>
              </div>
            )}

            {/* FILL_BLANK legado (seed original): input de texto */}
            {isLegacyFillBlank && (
              <div>
                <p className="options-label">Digite a palavra correta</p>
                <input
                  className="input"
                  placeholder="Sua resposta..."
                  value={fillInput}
                  onChange={e => setFillInput(e.target.value)}
                  disabled={answered}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    borderColor: answered
                      ? isCorrect ? 'var(--green)' : 'var(--red)'
                      : undefined,
                    background: answered
                      ? isCorrect ? 'var(--green-pale)' : 'var(--red-pale)'
                      : undefined,
                  }}
                />
                {answered && !isCorrect && (
                  <p style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-mid)' }}>
                    Resposta correta: <code style={{ background: 'var(--gray-light)', padding: '2px 6px', borderRadius: 4 }}>{payload.gaps?.[0]}</code>
                  </p>
                )}
              </div>
            )}

            {/* Opções clicáveis — MULTIPLE_CHOICE, FIND_ERROR e FILL_BLANK com word bank */}
            {!isLegacyFillBlank && options.length > 0 && (
              <div className="activity-options">
                <p className="options-label">
                  {type === 'FILL_BLANK' ? 'Escolha a palavra' : 'Escolha a resposta correta'}
                </p>
                {options.map((opt, i) => {
                  let cls = 'option-btn'
                  if (selected === i && !answered)          cls += ' selected'
                  if (answered && opt.isCorrect)            cls += ' correct'
                  if (answered && selected === i && !opt.isCorrect) cls += ' wrong'
                  return (
                    <button key={i} className={cls} onClick={() => handleSelect(i)}>
                      <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Botão de ação */}
            {!answered ? (
              <button
                className="btn btn-primary btn-lg activity-confirm-btn"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? <><div className="spinner" /> Verificando...</>
                  : 'Verificar resposta'}
              </button>
            ) : isCorrect ? (
              <button
                className="btn btn-primary btn-lg activity-confirm-btn"
                onClick={handleNext}
              >
                {isLast ? 'Concluir trilha ✓' : 'Próxima questão →'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  className="btn btn-primary btn-lg activity-confirm-btn"
                  onClick={handleRetry}
                >
                  🔄 Tentar de novo
                </button>
                <button
                  className="btn btn-secondary btn-lg activity-confirm-btn"
                  onClick={handleNext}
                >
                  {isLast ? 'Concluir trilha ✓' : 'Pular questão →'}
                </button>
              </div>
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
                  {payload.explanation || 'Muito bem! Continue assim!'}
                </div>
                {xpEarned !== null && xpEarned > 0 && (
                  <div className="feedback-xp">⚡ +{xpEarned} XP ganhos!</div>
                )}
                {alreadyDone && (
                  <div className="feedback-already">Você já havia concluído esta atividade.</div>
                )}
              </div>
            ) : (
              <div className="feedback-wrong">
                <PoussinMascot size={80} />
                <div className="feedback-title feedback-wrong-title">Quase lá! 😅</div>
                <div className="feedback-hint">
                  {payload.explanation || 'Revise o conceito e tente novamente!'}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
