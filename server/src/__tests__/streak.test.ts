import { calculateStreak } from '../utils/streak'

// Helper que retorna uma data UTC ajustada em N dias a partir de hoje
function daysAgo(n: number): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

describe('calculateStreak', () => {
  it('inicia streak em 1 na primeira atividade', () => {
    const result = calculateStreak({ last_activity_date: null, streak_count: 0, streak_freezes: 0 })
    expect(result.streak_count).toBe(1)
  })

  it('não incrementa se já fez atividade hoje', () => {
    const result = calculateStreak({ last_activity_date: new Date(), streak_count: 5, streak_freezes: 0 })
    expect(result.streak_count).toBe(5)
  })

  it('incrementa streak em 1 no dia seguinte', () => {
    const result = calculateStreak({ last_activity_date: daysAgo(1), streak_count: 3, streak_freezes: 0 })
    expect(result.streak_count).toBe(4)
  })

  it('reseta streak para 1 ao pular 2+ dias sem freeze', () => {
    const result = calculateStreak({ last_activity_date: daysAgo(2), streak_count: 10, streak_freezes: 0 })
    expect(result.streak_count).toBe(1)
    expect(result.streak_freezes).toBe(0)
  })

  it('usa freeze e preserva streak ao pular 2+ dias com freeze disponível', () => {
    const result = calculateStreak({ last_activity_date: daysAgo(2), streak_count: 10, streak_freezes: 2 })
    expect(result.streak_count).toBe(10)
    expect(result.streak_freezes).toBe(1)
  })

  it('atualiza last_activity_date para agora', () => {
    const before = new Date()
    const result = calculateStreak({ last_activity_date: daysAgo(1), streak_count: 1, streak_freezes: 0 })
    expect(result.last_activity_date.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })
})
