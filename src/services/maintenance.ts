import { supabase } from '@/lib/supabase/client'

export type MaintenanceTicket = {
  id: string
  description: string
  status: string
  created_by: string | null
  created_at: string
  profiles?: { full_name: string | null } | null
}

export const fetchTickets = async () => {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select(`
      id, description, status, created_by, created_at,
      profiles ( full_name )
    `)
    .order('created_at', { ascending: false })

  const formatted = (data || []).map((item: any) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  })) as MaintenanceTicket[]

  return { data: formatted, error }
}

export const createTicket = async (description: string, userId: string) => {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .insert([{ description, created_by: userId }])
    .select('*')
    .single()

  if (!error && data) {
    const { data: owner } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'owner')
      .limit(1)
      .single()

    if (owner) {
      await supabase.from('notifications').insert([
        {
          user_id: owner.id,
          message: `Novo ticket de manutencao: ${description}`,
        },
      ])
    }
  }

  return { data: data as unknown as MaintenanceTicket | null, error }
}

export const updateTicketStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
  return { data: data as unknown as MaintenanceTicket | null, error }
}
