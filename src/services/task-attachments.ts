import { supabase } from '@/lib/supabase/client'

export const uploadTaskAttachment = async (
  file: File,
): Promise<{ url: string | null; error: any }> => {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

  const { error } = await supabase.storage.from('task-attachments').upload(fileName, file)

  if (error) return { url: null, error }

  const { data } = supabase.storage.from('task-attachments').getPublicUrl(fileName)

  return { url: data.publicUrl, error: null }
}
