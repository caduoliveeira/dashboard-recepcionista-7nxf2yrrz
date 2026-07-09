import { supabase } from '@/lib/supabase/client'

export type GymSettings = {
  id: string
  target_completion_rate: number
  updated_at: string
}

const DEFAULT_SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

export const fetchGymSettings = async () => {
  const { data, error } = await supabase.from('gym_settings').select('*').limit(1).single()
  return { data: data as unknown as GymSettings | null, error }
}

export const updateGymSettings = async (targetCompletionRate: number) => {
  const { data, error } = await supabase
    .from('gym_settings')
    .update({ target_completion_rate: targetCompletionRate })
    .eq('id', DEFAULT_SETTINGS_ID)
    .select('*')
    .single()
  return { data: data as unknown as GymSettings | null, error }
}
