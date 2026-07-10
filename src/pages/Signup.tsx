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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pointer-events-none z-0" />

      <Card className="w-full max-w-md shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl relative z-10 rounded-2xl overflow-hidden">
        {/* Top elegant accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />

        <CardHeader className="space-y-4 text-center pb-6 pt-10">
          <div className="mx-auto bg-gradient-to-br from-blue-600 to-blue-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-blue-500/25 border border-blue-400/50">
            <Activity className="h-7 w-7 text-white drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white font-display">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-xs text-blue-200/70 font-semibold tracking-[0.2em] uppercase">
              The Ruby's Gym Colaboradores
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label
                htmlFor="fullName"
                className="text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 h-12 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@rubysgym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 h-12 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 h-12 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold uppercase tracking-wider transition-all duration-300 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8 bg-slate-950/20 border-t border-white/5 pt-4">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Já tenho conta — Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
