import { supabase } from '@/lib/supabase/client'

export type StockItem = {
  id: string
  name: string
  quantity: number
  unit: string
  updated_at: string
}

export const fetchStockItems = async () => {
  const { data, error } = await supabase
    .from('stock_items')
    .select('*')
    .order('name', { ascending: true })
  return { data: (data as unknown as StockItem[]) || [], error }
}

export const updateStockQuantity = async (id: string, quantity: number) => {
  const { data, error } = await supabase
    .from('stock_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  return { data: data as unknown as StockItem | null, error }
}

export const addStockItem = async (name: string, quantity: number, unit: string) => {
  const { data, error } = await supabase
    .from('stock_items')
    .insert([{ name, quantity, unit }])
    .select('*')
    .single()
  return { data: data as unknown as StockItem | null, error }
}

export const deleteStockItem = async (id: string) => {
  const { error } = await supabase.from('stock_items').delete().eq('id', id)
  return { error }
}
