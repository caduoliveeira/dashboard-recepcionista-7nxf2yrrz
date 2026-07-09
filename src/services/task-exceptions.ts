import { supabase } from '@/lib/supabase/client'

export const skipTask = async (taskId: string, reason: string, userId: string) => {
  const { data: taskData } = await supabase.from('tasks').select('title').eq('id', taskId).single()
  const taskTitle = taskData?.title || 'Tarefa'

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()
  const userName = profileData?.full_name || 'Usuario'

  const { error } = await supabase.from('task_exceptions').insert([
    {
      task_id: taskId,
      reason,
      skipped_by: userId,
    },
  ])

  if (error) return { error }

  const { data: ownerData } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'owner')
    .limit(1)
    .single()

  if (ownerData) {
    await supabase.from('notifications').insert([
      {
        user_id: ownerData.id,
        message: `Tarefa "${taskTitle}" foi pulada por ${userName}. Motivo: ${reason}`,
      },
    ])
  }

  return { error: null }
}
