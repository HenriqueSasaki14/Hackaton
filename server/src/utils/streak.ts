interface StreakInput {
  last_activity_date: Date | null
  streak_count: number
  streak_freezes: number
}

interface StreakResult {
  streak_count: number
  streak_freezes: number
  last_activity_date: Date
}

function toUTCDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function calculateStreak(input: StreakInput): StreakResult {
  const now = new Date()
  const todayUTC = toUTCDateString(now)

  if (!input.last_activity_date) {
    return {
      streak_count: 1,
      streak_freezes: input.streak_freezes,
      last_activity_date: now,
    }
  }

  const lastUTC = toUTCDateString(input.last_activity_date)

  if (lastUTC === todayUTC) {
    return {
      streak_count: input.streak_count,
      streak_freezes: input.streak_freezes,
      last_activity_date: input.last_activity_date,
    }
  }

  const lastDate = new Date(lastUTC + 'T00:00:00Z')
  const todayDate = new Date(todayUTC + 'T00:00:00Z')
  const diffDays = Math.round(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 1) {
    return {
      streak_count: input.streak_count + 1,
      streak_freezes: input.streak_freezes,
      last_activity_date: now,
    }
  }

  if (input.streak_freezes > 0) {
    return {
      streak_count: input.streak_count,
      streak_freezes: input.streak_freezes - 1,
      last_activity_date: now,
    }
  }

  return {
    streak_count: 1,
    streak_freezes: 0,
    last_activity_date: now,
  }
}
