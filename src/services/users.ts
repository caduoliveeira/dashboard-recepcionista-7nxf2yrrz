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

export const createUser = async (input: {
  fullName: string
  email: string
  password: string
  role: 'receptionist' | 'owner'
}) => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: input,
  })

  if (error) {
    let errorMessage = error.message

    // Try to extract the custom error message from the response body
    if (typeof error === 'object' && 'context' in error) {
      try {
        const context = (error as any).context
        if (context && typeof context.json === 'function') {
          const clone = context.clone()
          const errData = await clone.json()
          if (errData && errData.error) {
            errorMessage = errData.error
          }
        }
      } catch (e) {
        // Ignore extraction errors
      }
    }

    return { data: null, error: new Error(errorMessage) }
  }

  return { data, error }
}

export const updateUserName = async (userId: string, fullName: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)
    .select('*')
    .single()
  return { data: data as UserProfile | null, error }
}
