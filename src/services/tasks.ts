import { supabase } from '@/lib/supabase/client'

export type Task = {
  id: string
  title: string
  description: string | null
  category: string
  expected_time: string | null
  is_active: boolean
  is_recurring: boolean
  recurrence_type: string | null
  recurrence_days: string[] | null
  priority: string
}

export type TaskCompletion = {
  id: string
  task_id: string
  completed_by: string
  completed_at: string
  notes?: string | null
  profiles?: {
    full_name: string | null
  } | null
}

export type CompletionWithTask = {
  id: string
  task_id: string
  completed_by: string | null
  completed_at: string
  notes: string | null
  tasks: {
    id: string
    title: string
    category: string
    expected_time: string | null
  } | null
  profiles: {
    full_name: string | null
  } | null
}

export type CreateTaskInput = {
  title: string
  description?: string | null
  category: string
  expected_time?: string | null
  is_recurring: boolean
  recurrence_type?: string | null
  recurrence_days?: string[] | null
  priority?: string
}

const formatTime = (time: string | null | undefined): string | null => {
  if (!time) return null
  return time.length === 5 ? `${time}:00` : time
}

export const fetchTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('expected_time', { ascending: true })
  return { data: (data as unknown as Task[]) || [], error }
}

export const fetchCategories = async () => {
  const { data, error } = await supabase.from('tasks').select('category').eq('is_active', true)
  if (error || !data) return { data: [] as string[], error }
  const categories = [...new Set(data.map((t: { category: string }) => t.category))]
  return { data: categories, error: null }
}

export const fetchTodayCompletions = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('task_completions')
    .select(`
      id, task_id, completed_by, completed_at, notes,
      profiles ( full_name )
    `)
    .gte('completed_at', today.toISOString())

  const formattedData = (data || []).map((item: any) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  })) as TaskCompletion[]

  return { data: formattedData, error }
}

export const markTaskComplete = async (taskId: string, userId: string) => {
  const { data, error } = await supabase
    .from('task_completions')
    .insert([{ task_id: taskId, completed_by: userId }])
    .select(`
      id, task_id, completed_by, completed_at, notes,
      profiles ( full_name )
    `)
    .single()

  const formattedData = data
    ? ({
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
      } as TaskCompletion)
    : null

  return { data: formattedData, error }
}

export const fetchRecentCompletions = async (days = 7) => {
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('task_completions')
    .select(`
      id, task_id, completed_by, completed_at, notes,
      tasks ( id, title, category, expected_time ),
      profiles ( full_name )
    `)
    .gte('completed_at', since.toISOString())
    .order('completed_at', { ascending: false })

  const formatted = (data || []).map((item: any) => ({
    ...item,
    tasks: Array.isArray(item.tasks) ? item.tasks[0] : item.tasks,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  })) as CompletionWithTask[]

  return { data: formatted, error }
}

export const createTask = async (input: CreateTaskInput) => {
  const payload = {
    title: input.title,
    description: input.description || null,
    category: input.category,
    expected_time: formatTime(input.expected_time),
    is_active: true,
    is_recurring: input.is_recurring,
    recurrence_type: input.is_recurring ? (input.recurrence_type ?? null) : null,
    recurrence_days:
      input.is_recurring && input.recurrence_type === 'weekly'
        ? (input.recurrence_days ?? null)
        : null,
    priority: input.priority || 'Medium',
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([payload] as any)
    .select('*')
    .single()

  return { data: data as unknown as Task | null, error }
}
