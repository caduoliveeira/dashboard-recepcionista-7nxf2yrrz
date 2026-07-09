import { supabase } from '@/lib/supabase/client'

export type HandoverNote = {
  id: string
  category_id: string
  user_id: string | null
  note: string
  created_at: string
  profiles?: { full_name: string | null } | null
}

export const fetchHandoverNotes = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('shift_handover_notes')
    .select(`
      id, category_id, user_id, note, created_at,
      profiles ( full_name )
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .limit(5)

  const formatted = (data || []).map((item: any) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  })) as HandoverNote[]

  return { data: formatted, error }
}

export const addHandoverNote = async (categoryId: string, userId: string, note: string) => {
  const { data, error } = await supabase
    .from('shift_handover_notes')
    .insert([{ category_id: categoryId, user_id: userId, note }])
    .select(`
      id, category_id, user_id, note, created_at,
      profiles ( full_name )
    `)
    .single()

  const formatted = data
    ? ({
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
      } as HandoverNote)
    : null

  return { data: formatted, error }
}
