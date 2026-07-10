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
import bgImage from '@/assets/whatsapp-image-2026-04-24-at-16.18.57-1-c8e91.jpeg'

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
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Luxurious Background image overlay */}
      <div
        className="absolute inset-0 z-0 opacity-60 mix-blend-overlay"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#030303]/95 via-[#0a0a0a]/80 to-primary/40 pointer-events-none z-0" />

      <Card className="w-full max-w-md shadow-glass border border-white/10 bg-black/60 backdrop-blur-2xl relative z-10 rounded-3xl overflow-hidden">
        {/* Top elegant accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        <CardHeader className="space-y-4 text-center pb-6 pt-10">
          <div className="mx-auto bg-gradient-to-br from-primary to-primary/60 w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-glow border border-primary/50">
            <Activity className="h-7 w-7 text-white drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white font-display">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-xs text-white/50 font-semibold tracking-[0.2em] uppercase">
              The Ruby's Gym Colaboradores
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label
                htmlFor="fullName"
                className="text-xs font-semibold uppercase tracking-wider text-white/70"
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-primary focus-visible:border-primary shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-white/70"
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-primary focus-visible:border-primary shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-white/70"
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-primary focus-visible:border-primary shadow-sm transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-glow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border border-primary/50"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8 bg-white/[0.02] border-t border-white/5 pt-4">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Já tenho conta — Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
