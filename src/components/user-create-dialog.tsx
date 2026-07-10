import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createUser } from '@/services/users'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated: () => void
}

export function UserCreateDialog({ open, onOpenChange, onUserCreated }: Props) {
  const { toast } = useToast()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'receptionist' | 'owner'>('receptionist')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('receptionist')
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({ title: 'Erro', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }
    if (!email.trim()) {
      toast({ title: 'Erro', description: 'O e-mail é obrigatório.', variant: 'destructive' })
      return
    }
    if (password.length < 8) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    const { error } = await createUser({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role,
    })
    setSaving(false)

    if (error) {
      const message =
        typeof error === 'object' && error?.message
          ? error.message
          : typeof error === 'object' && error?.error
            ? error.error
            : 'Não foi possível criar o usuário.'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso', description: 'Usuário criado com sucesso!' })
    reset()
    onOpenChange(false)
    onUserCreated()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-[460px]" style={{ backgroundColor: '#F7F2EE' }}>
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ color: '#201011' }}>
            Adicionar Novo Usuário
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="uc-name" style={{ color: '#841F25' }}>
              Nome Completo *
            </Label>
            <Input
              id="uc-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome do funcionário"
              style={{ color: '#201011' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uc-email" style={{ color: '#841F25' }}>
              E-mail *
            </Label>
            <Input
              id="uc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              style={{ color: '#201011' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uc-pass" style={{ color: '#841F25' }}>
              Senha * (mín. 8 caracteres)
            </Label>
            <Input
              id="uc-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ color: '#201011' }}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: '#841F25' }}>Função</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'receptionist' | 'owner')}>
              <SelectTrigger style={{ color: '#201011' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receptionist">Recepcionista</SelectItem>
                <SelectItem value="owner">Proprietário</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            {saving ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
