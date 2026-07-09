import { useState, useEffect } from 'react'
import {
  fetchStockItems,
  updateStockQuantity,
  addStockItem,
  deleteStockItem,
  type StockItem,
} from '@/services/stock'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Minus, Trash2, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Inventory() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newUnit, setNewUnit] = useState('un')
  const { toast } = useToast()

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    const { data } = await fetchStockItems()
    if (data) setItems(data)
    setLoading(false)
  }

  const handleQtyChange = async (item: StockItem, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta)
    const { error } = await updateStockQuantity(item.id, newQuantity)
    if (error) {
      toast({ title: 'Erro', description: 'Nao foi possivel atualizar.', variant: 'destructive' })
      return
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: newQuantity } : i)))
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    const { error } = await addStockItem(
      newName.trim(),
      parseInt(newQty) || 0,
      newUnit.trim() || 'un',
    )
    if (error) {
      toast({ title: 'Erro', description: 'Nao foi possivel adicionar.', variant: 'destructive' })
      return
    }
    toast({ title: 'Item adicionado!' })
    setNewName('')
    setNewQty('')
    setNewUnit('un')
    loadItems()
  }

  const handleDelete = async (id: string) => {
    const { error } = await deleteStockItem(id)
    if (error) {
      toast({ title: 'Erro', description: 'Nao foi possivel remover.', variant: 'destructive' })
      return
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Controle de Estoque</h1>
        <p className="text-muted-foreground mt-1">Gerencie os suprimentos da academia.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Item
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Nome do item"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Qtd"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="w-24"
            />
            <Input
              placeholder="Unidade"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="w-28"
            />
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className={cn('shadow-sm', item.quantity <= 10 && 'border-amber-300')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p
                    className={cn(
                      'text-sm',
                      item.quantity <= 10 ? 'text-amber-600 font-medium' : 'text-muted-foreground',
                    )}
                  >
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQtyChange(item, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQtyChange(item, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <Card className="col-span-full border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum item em estoque.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
