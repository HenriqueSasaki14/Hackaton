interface StreakInput { last_activity_date: Date | null; streak_count: number; streak_freezes: number }
interface StreakResult { streak_count: number; streak_freezes: number; last_activity_date: Date }

function toUTCDateString(d: Date) { return d.toISOString().split('T')[0] }

export function calculateStreak(input: StreakInput): StreakResult {
  const now = new Date()
  const todayUTC = toUTCDateString(now)

  if (!input.last_activity_date)
    return { streak_count: 1, streak_freezes: input.streak_freezes, last_activity_date: now }

  const lastUTC = toUTCDateString(input.last_activity_date)
  if (lastUTC === todayUTC)
    return { streak_count: input.streak_count, streak_freezes: input.streak_freezes, last_activity_date: input.last_activity_date }

  const diffDays = Math.round(
    (new Date(todayUTC + 'T00:00:00Z').getTime() - new Date(lastUTC + 'T00:00:00Z').getTime()) / 86400000
  )

  if (diffDays === 1) return { streak_count: input.streak_count + 1, streak_freezes: input.streak_freezes, last_activity_date: now }
  if (input.streak_freezes > 0) return { streak_count: input.streak_count, streak_freezes: input.streak_freezes - 1, last_activity_date: now }
  return { streak_count: 1, streak_freezes: 0, last_activity_date: now }
}
