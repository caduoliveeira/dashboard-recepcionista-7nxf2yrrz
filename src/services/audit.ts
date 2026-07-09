import { supabase } from '@/lib/supabase/client'

export type AuditStaffStat = {
  id: string
  full_name: string | null
  completed_count: number
  exception_count: number
  maintenance_count: number
  completion_rate: number
}

export type AuditGlobalMetrics = {
  totalTasks: number
  completedCount: number
  exceptionCount: number
  completionRate: number
  topReasons: { reason: string; count: number }[]
}

export type WeeklyTrend = {
  week: string
  completed: number
  exceptions: number
}

const getMonthRange = (year: number, month: number) => {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export const fetchAuditGlobalMetrics = async (year: number, month: number) => {
  const { start, end } = getMonthRange(year, month)
  const { data: tasks } = await supabase.from('tasks').select('id, is_active').eq('is_active', true)

  const { data: completions } = await supabase
    .from('task_completions')
    .select('id')
    .gte('completed_at', start)
    .lt('completed_at', end)

  const { data: exceptions } = await supabase
    .from('task_exceptions')
    .select('reason')
    .gte('skipped_at', start)
    .lt('skipped_at', end)

  const totalTasks = tasks?.length ?? 0
  const completedCount = completions?.length ?? 0
  const exceptionCount = exceptions?.length ?? 0
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  const reasonMap = new Map<string, number>()
  exceptions?.forEach((e: { reason: string }) => {
    const r = e.reason || 'Sem motivo'
    reasonMap.set(r, (reasonMap.get(r) ?? 0) + 1)
  })
  const topReasons = Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalTasks,
    completedCount,
    exceptionCount,
    completionRate,
    topReasons,
  } as AuditGlobalMetrics
}

export const fetchAuditStaffStats = async (year: number, month: number) => {
  const { start, end } = getMonthRange(year, month)

  const [{ data: profiles }, { data: completions }, { data: exceptions }, { data: maintenance }] =
    await Promise.all([
      supabase.from('profiles').select('id, full_name, role').eq('role', 'receptionist'),
      supabase
        .from('task_completions')
        .select('id, completed_by')
        .gte('completed_at', start)
        .lt('completed_at', end),
      supabase
        .from('task_exceptions')
        .select('id, skipped_by')
        .gte('skipped_at', start)
        .lt('skipped_at', end),
      supabase
        .from('maintenance_tickets')
        .select('id, created_by')
        .gte('created_at', start)
        .lt('created_at', end),
    ])

  const totalTasks = (completions?.length ?? 0) + (exceptions?.length ?? 0)

  const stats: AuditStaffStat[] = (profiles ?? []).map((p: any) => {
    const completed_count = completions?.filter((c: any) => c.completed_by === p.id).length ?? 0
    const exception_count = exceptions?.filter((e: any) => e.skipped_by === p.id).length ?? 0
    const maintenance_count = maintenance?.filter((m: any) => m.created_by === p.id).length ?? 0
    const completion_rate = totalTasks > 0 ? Math.round((completed_count / totalTasks) * 100) : 0
    return {
      id: p.id,
      full_name: p.full_name,
      completed_count,
      exception_count,
      maintenance_count,
      completion_rate,
    }
  })

  return stats
}

export const fetchAuditWeeklyTrend = async (year: number, month: number) => {
  const { start, end } = getMonthRange(year, month)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weekCount = Math.ceil(daysInMonth / 7)

  const [{ data: completions }, { data: exceptions }] = await Promise.all([
    supabase
      .from('task_completions')
      .select('completed_at')
      .gte('completed_at', start)
      .lt('completed_at', end),
    supabase
      .from('task_exceptions')
      .select('skipped_at')
      .gte('skipped_at', start)
      .lt('skipped_at', end),
  ])

  const weeks: WeeklyTrend[] = []
  for (let w = 0; w < weekCount; w++) {
    const weekStartDay = w * 7 + 1
    const weekEndDay = Math.min((w + 1) * 7, daysInMonth)
    const weekStart = new Date(year, month, weekStartDay)
    const weekEnd = new Date(year, month, weekEndDay + 1)
    const completed =
      completions?.filter((c: any) => {
        const d = new Date(c.completed_at)
        return d >= weekStart && d < weekEnd
      }).length ?? 0
    const exc =
      exceptions?.filter((e: any) => {
        const d = new Date(e.skipped_at)
        return d >= weekStart && d < weekEnd
      }).length ?? 0
    weeks.push({ week: `Sem ${w + 1}`, completed, exceptions: exc })
  }

  return weeks
}
