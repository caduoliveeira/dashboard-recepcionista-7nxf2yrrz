import { supabase } from '@/lib/supabase/client'

export type ShoppingItem = {
  id: string
  item_name: string
  is_purchased: boolean
  created_by: string | null
  created_at: string
  profiles?: { full_name: string | null } | null
}

export const fetchShoppingItems = async () => {
  const { data, error } = await supabase
    .from('shopping_list')
    .select(`
      id, item_name, is_purchased, created_by, created_at,
      profiles ( full_name )
    `)
    .eq('is_purchased', false)
    .order('created_at', { ascending: false })

  const formatted = (data || []).map((item: any) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  })) as ShoppingItem[]

  return { data: formatted, error }
}

export const addShoppingItem = async (itemName: string, userId: string) => {
  const { data, error } = await supabase
    .from('shopping_list')
    .insert([{ item_name: itemName, created_by: userId }])
    .select('*')
    .single()
  return { data: data as unknown as ShoppingItem | null, error }
}

export const markPurchased = async (id: string) => {
  const { error } = await supabase.from('shopping_list').update({ is_purchased: true }).eq('id', id)
  return { error }
}
