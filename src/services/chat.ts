import { supabase } from '@/lib/supabase/client'

export type ChatMessage = {
  id: string
  created_at: string
  sender_id: string
  content: string
  profiles: {
    full_name: string | null
  } | null
}

export const fetchChatMessages = async (limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      id, created_at, sender_id, content,
      profiles ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return { data: [] as ChatMessage[], error }

  const formatted = data
    .map((item: any) => ({
      ...item,
      profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
    }))
    .reverse() as ChatMessage[]

  return { data: formatted, error: null }
}

export const fetchChatMessagesBefore = async (before: string, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      id, created_at, sender_id, content,
      profiles ( full_name )
    `)
    .lt('created_at', before)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return { data: [] as ChatMessage[], error }

  const formatted = data
    .map((item: any) => ({
      ...item,
      profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
    }))
    .reverse() as ChatMessage[]

  return { data: formatted, error: null }
}

export const sendChatMessage = async (senderId: string, content: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{ sender_id: senderId, content }])
    .select(`
      id, created_at, sender_id, content,
      profiles ( full_name )
    `)
    .single()

  if (error || !data) return { data: null, error }

  const formatted = {
    ...data,
    profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
  } as ChatMessage

  return { data: formatted, error: null }
}
