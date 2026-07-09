import { supabase } from '@/lib/supabase/client'

export type Notification = {
  id: string
  user_id: string
  message: string
  read: boolean
  created_at: string
}

export const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  return { data: (data as unknown as Notification[]) || [], error }
}

export const markAllNotificationsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  return { error }
}
