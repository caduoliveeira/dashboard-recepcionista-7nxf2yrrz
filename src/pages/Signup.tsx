import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Activity, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  if (user) return <Navigate to="/checklist" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }
    setIsLoading(true)
    const { error } = await signUp(email, password, fullName)
    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Bem-vindo(a) à equipe!',
      })
      navigate('/checklist')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />

      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/80 backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto bg-primary w-14 h-14 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-base">
            Cadastre-se como recepcionista da The Ruby's Gym
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@academia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Já tenho conta — Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
