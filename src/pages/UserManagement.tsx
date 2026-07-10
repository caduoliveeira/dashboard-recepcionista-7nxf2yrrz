import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield, User, UserPlus, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { fetchAllUsers, toggleUserActive, type UserProfile } from '@/services/users'
import { UserCreateDialog } from '@/components/user-create-dialog'
import { UserEditDialog } from '@/components/user-edit-dialog'

export default function UserManagement() {
  const { role, loading } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [showEdit, setShowEdit] = useState(false)
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

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setShowEdit(true)
  }

  const handleUserUpdated = (userId: string, newName: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, full_name: newName } : u)))
  }

  return (
    <div
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-8rem)] rounded-xl p-6"
      style={{ backgroundColor: '#F7F2EE', color: '#201011' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Equipe</h1>
          <p className="mt-1 opacity-70">Gerencie os membros da equipe e seus acessos.</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="text-white gap-2"
          style={{ backgroundColor: '#9B111E' }}
        >
          <UserPlus className="h-4 w-4" />
          Adicionar Novo Usuário
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center opacity-60">
            Nenhum usuário cadastrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <Card key={user.id} className="shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <CardContent className="flex items-center gap-4 py-4 flex-wrap">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${user.role === 'owner' ? 'bg-[#9B111E]/10' : 'bg-muted'}`}
                >
                  {user.role === 'owner' ? (
                    <Shield className="h-5 w-5" style={{ color: '#9B111E' }} />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.full_name || 'Sem nome'}</p>
                  <p className="text-sm opacity-60">
                    Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge
                  variant={user.role === 'owner' ? 'default' : 'secondary'}
                  style={
                    user.role === 'owner' ? { backgroundColor: '#9B111E', color: '#FFFFFF' } : {}
                  }
                >
                  {user.role === 'owner' ? 'Proprietário' : 'Recepcionista'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(user)}
                  className="shrink-0"
                  title="Editar nome"
                >
                  <Pencil className="h-4 w-4" style={{ color: '#841F25' }} />
                </Button>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm opacity-70">{user.is_active ? 'Ativo' : 'Inativo'}</span>
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={() => handleToggle(user.id, user.is_active)}
                    disabled={togglingId === user.id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UserCreateDialog open={showCreate} onOpenChange={setShowCreate} onUserCreated={loadUsers} />
      <UserEditDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
}
