import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateUserName, type UserProfile } from '@/services/users'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile | null
  onUserUpdated: (userId: string, newName: string) => void
}

export function UserEditDialog({ open, onOpenChange, user, onUserUpdated }: Props) {
  const { toast } = useToast()
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) setFullName(user.full_name || '')
  }, [user])

  const handleSave = async () => {
    if (!user) return
    if (!fullName.trim()) {
      toast({ title: 'Erro', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }

    setSaving(true)
    const { error } = await updateUserName(user.id, fullName.trim())
    setSaving(false)

    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar.', variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso', description: 'Nome atualizado com sucesso!' })
    onUserUpdated(user.id, fullName.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" style={{ backgroundColor: '#F7F2EE' }}>
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ color: '#201011' }}>
            Editar Usuário
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ue-name" style={{ color: '#841F25' }}>
              Nome Completo
            </Label>
            <Input
              id="ue-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome do funcionário"
              style={{ color: '#201011' }}
            />
          </div>
          {user && (
            <div className="text-sm" style={{ color: '#201011' }}>
              <span className="opacity-60">E-mail / Função: </span>
              <span className="font-medium">
                {user.role === 'owner' ? 'Proprietário' : 'Recepcionista'}
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="text-white"
            style={{ backgroundColor: '#9B111E' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
