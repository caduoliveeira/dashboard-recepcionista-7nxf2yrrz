import { supabase } from '@/lib/supabase/client'

export type UserProfile = {
  id: string
  full_name: string | null
  role: 'owner' | 'receptionist'
  is_active: boolean
  created_at: string
}

export const fetchAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: (data as UserProfile[]) || [], error }
}

export const toggleUserActive = async (userId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select('*')
    .single()
  return { data: data as UserProfile | null, error }
}
