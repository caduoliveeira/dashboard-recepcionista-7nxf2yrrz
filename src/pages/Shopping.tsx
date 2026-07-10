import { useState, useEffect, useMemo } from 'react'
import {
  fetchShoppingItems,
  addShoppingItem,
  markPurchased,
  deleteShoppingItem,
  type ShoppingItem,
} from '@/services/shopping'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ShoppingCart, Plus, Trash2, Flame } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Shopping() {
  const { user, role } = useAuth()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShoppingItem | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    const { data } = await fetchShoppingItems()
    if (data) setItems(data)
    setLoading(false)
  }

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [items])

  const handleAdd = async () => {
    if (!newItem.trim() || !user) return
    const { error } = await addShoppingItem(newItem.trim(), user.id, isUrgent)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível adicionar.', variant: 'destructive' })
      return
    }
    toast({ title: 'Item adicionado!' })
    setNewItem('')
    setIsUrgent(false)
    loadItems()
  }

  const handlePurchase = async (id: string) => {
    const { error } = await markPurchased(id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível marcar.', variant: 'destructive' })
      return
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast({ title: 'Item marcado como comprado!' })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await deleteShoppingItem(deleteTarget.id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
      setDeleteTarget(null)
      return
    }
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    toast({ title: 'Item excluído com sucesso!' })
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const urgentCount = items.filter((i) => i.is_urgent).length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Lista de Compras</h1>
        <p className="text-muted-foreground mt-1">
          {role === 'owner'
            ? 'Marque os itens conforme forem comprados.'
            : 'Adicione itens que estão acabando.'}
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Item
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Ex: Papel toalha, desinfetante..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="urgent-toggle"
                checked={isUrgent}
                onCheckedChange={(v) => setIsUrgent(v === true)}
                className={cn('h-5 w-5', isUrgent && 'border-red-500')}
              />
              <label
                htmlFor="urgent-toggle"
                className="text-sm font-medium text-muted-foreground cursor-pointer select-none flex items-center gap-1"
              >
                <Flame className="h-3.5 w-3.5 text-red-500" /> Urgente?
              </label>
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Itens Pendentes ({items.length})
            {urgentCount > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                <Flame className="h-3 w-3" /> {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {sortedItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors',
                  item.is_urgent && 'bg-red-50/40',
                )}
              >
                {role === 'owner' ? (
                  <Checkbox onCheckedChange={() => handlePurchase(item.id)} className="h-5 w-5" />
                ) : (
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      item.is_urgent ? 'bg-red-500' : 'bg-primary',
                    )}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium text-foreground flex items-center gap-1.5',
                      item.is_urgent && 'font-bold',
                    )}
                  >
                    {item.is_urgent && <Flame className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                    {item.item_name}
                    {item.is_urgent && (
                      <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">
                        Alta Prioridade
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adicionado por {item.profiles?.full_name || 'Usuário'} ·{' '}
                    {new Date(item.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </p>
                </div>
                {role === 'owner' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(item)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
            {items.length === 0 && (
              <li className="py-12 text-center text-muted-foreground">
                Lista vazia. Adicione itens que precisam ser comprados.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este item da lista de compras? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
