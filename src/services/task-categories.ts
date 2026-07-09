import { supabase } from '@/lib/supabase/client'

export type TaskCategory = {
  id: string
  name: string
  start_time: string | null
  end_time: string | null
}

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('task_categories')
    .select('*')
    .order('start_time', { ascending: true, nullsFirst: false })
  return { data: (data as TaskCategory[]) || null, error }
}

export const createCategory = async (input: {
  name: string
  start_time: string | null
  end_time: string | null
}) => {
  const { data, error } = await supabase
    .from('task_categories')
    .insert([input])
    .select('*')
    .single()
  return { data: data as TaskCategory | null, error }
}

export const updateCategory = async (
  id: string,
  updates: { name?: string; start_time?: string | null; end_time?: string | null },
) => {
  const { data, error } = await supabase
    .from('task_categories')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  return { data: data as TaskCategory | null, error }
}

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('task_categories').delete().eq('id', id)
  return { error }
}

export const fetchTaskCountByCategory = async (categoryId: string) => {
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
  return { count: count || 0, error }
}
