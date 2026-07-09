import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { fetchAllUsers, toggleUserActive, type UserProfile } from '@/services/users'

export default function UserManagement() {
  const { role, loading } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (role === 'owner') loadUsers()
  }, [role])

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Carregando...
      </div>
    )
  if (role !== 'owner') return <Navigate to="/checklist" replace />

  async function loadUsers() {
    setIsLoading(true)
    const { data } = await fetchAllUsers()
    if (data) setUsers(data)
    setIsLoading(false)
  }

  const handleToggle = async (userId: string, currentActive: boolean) => {
    setTogglingId(userId)
    const { error } = await toggleUserActive(userId, !currentActive)
    setTogglingId(null)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar.', variant: 'destructive' })
      return
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: !currentActive } : u)))
    toast({
      title: 'Sucesso',
      description: !currentActive ? 'Usuário ativado.' : 'Usuário desativado.',
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Usuários</h1>
        <p className="text-muted-foreground mt-1">Gerencie os membros da equipe e seus acessos.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum usuário cadastrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <Card key={user.id} className="shadow-sm">
              <CardContent className="flex items-center gap-4 py-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${user.role === 'owner' ? 'bg-primary/10' : 'bg-muted'}`}
                >
                  {user.role === 'owner' ? (
                    <Shield className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {user.full_name || 'Sem nome'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                  {user.role === 'owner' ? 'Proprietário' : 'Recepcionista'}
                </Badge>
                {user.role === 'receptionist' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={() => handleToggle(user.id, user.is_active)}
                      disabled={togglingId === user.id}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
