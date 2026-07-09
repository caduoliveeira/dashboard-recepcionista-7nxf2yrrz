import { supabase } from '@/lib/supabase/client'

export type TaskCategory = {
  id: string
  name: string
  start_time: string | null
  end_time: string | null
  created_at: string
}

export type CreateCategoryInput = {
  name: string
  start_time?: string | null
  end_time?: string | null
}

const formatTime = (time: string | null | undefined): string | null => {
  if (!time) return null
  return time.length === 5 ? `${time}:00` : time
}

export const fetchTaskCategories = async () => {
  const { data, error } = await supabase
    .from('task_categories')
    .select('*')
    .order('start_time', { ascending: true, nullsFirst: false })
  return { data: (data as unknown as TaskCategory[]) || [], error }
}

export const createTaskCategory = async (input: CreateCategoryInput) => {
  const { data, error } = await supabase
    .from('task_categories')
    .insert([
      {
        name: input.name.trim(),
        start_time: formatTime(input.start_time),
        end_time: formatTime(input.end_time),
      },
    ])
    .select('*')
    .single()
  return { data: data as unknown as TaskCategory | null, error }
}

export const updateTaskCategory = async (id: string, input: Partial<CreateCategoryInput>) => {
  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.name = input.name.trim()
  if (input.start_time !== undefined) payload.start_time = formatTime(input.start_time)
  if (input.end_time !== undefined) payload.end_time = formatTime(input.end_time)
  const { data, error } = await supabase
    .from('task_categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  return { data: data as unknown as TaskCategory | null, error }
}

export const deleteTaskCategory = async (id: string) => {
  const { error } = await supabase.from('task_categories').delete().eq('id', id)
  return { error }
}

export const fetchTaskCountByCategory = async (categoryId: string) => {
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('is_active', true)
  return { count: count || 0, error }
}
