export function parseTimeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  return parts[0] * 60 + (parts[1] || 0)
}

export function getCurrentMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function isTaskOverdue(expectedTime: string | null, isCompleted: boolean): boolean {
  if (!expectedTime || isCompleted) return false
  return getCurrentMinutes() > parseTimeToMinutes(expectedTime)
}

export function isTaskUpcoming(expectedTime: string | null, isCompleted: boolean): boolean {
  if (!expectedTime || isCompleted) return false
  const diff = parseTimeToMinutes(expectedTime) - getCurrentMinutes()
  return diff >= 0 && diff <= 15
}

export function wasCompletedLate(completedAt: string, expectedTime: string | null): boolean {
  if (!expectedTime) return false
  const completed = new Date(completedAt)
  const completedMinutes = completed.getHours() * 60 + completed.getMinutes()
  return completedMinutes > parseTimeToMinutes(expectedTime)
}

export type FilterType = 'all' | 'now' | 'upcoming' | 'completed'

export function shouldShowTask(
  expectedTime: string | null,
  isCompleted: boolean,
  filter: FilterType,
): boolean {
  const nowMin = getCurrentMinutes()
  switch (filter) {
    case 'all':
      return true
    case 'now': {
      if (!expectedTime) return false
      const taskMin = parseTimeToMinutes(expectedTime)
      const currentHour = Math.floor(nowMin / 60)
      const taskHour = Math.floor(taskMin / 60)
      return taskHour === currentHour || (taskMin < nowMin && !isCompleted)
    }
    case 'upcoming': {
      if (!expectedTime || isCompleted) return false
      const diff = parseTimeToMinutes(expectedTime) - nowMin
      return diff >= 0 && diff <= 120
    }
    case 'completed':
      return isCompleted
    default:
      return true
  }
}
