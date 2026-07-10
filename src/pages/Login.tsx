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
import { useToast } from '@/hooks/use-toast'
import logoImg from '@/assets/06-b2e9d.png'
import bgImage from '@/assets/whatsapp-image-2026-04-24-at-16.18.57-1-c8e91.jpeg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  if (user) return <Navigate to="/checklist" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description:
          error.message === 'Invalid login credentials' ? 'Credenciais inválidas' : error.message,
        variant: 'destructive',
      })
    } else {
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

      {/* Deep gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030303]/95 via-[#0a0a0a]/80 to-primary/40 pointer-events-none z-0" />

      <Card className="w-full max-w-md shadow-glass border border-white/10 bg-black/60 backdrop-blur-2xl relative z-10 rounded-3xl overflow-hidden">
        {/* Top elegant accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        <CardHeader className="space-y-4 text-center pb-6 pt-10">
          <div className="mx-auto flex items-center justify-center mb-2">
            <img
              src={logoImg}
              alt="The Ruby's Gym Logo"
              className="h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white font-display">
              Acesso Restrito
            </CardTitle>
            <CardDescription className="text-xs text-white/50 font-semibold tracking-[0.2em] uppercase">
              The Ruby's Gym Management
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white h-12 focus-visible:ring-primary focus-visible:border-primary shadow-sm transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-glow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border border-primary/50"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 bg-white/[0.02] border-t border-white/5">
          <div className="text-center w-full text-sm text-white/50 pt-4">
            Acesso exclusivo para colaboradores.{' '}
            <Link
              to="/auth/signup"
              className="text-primary hover:text-primary/80 font-medium hover:underline transition-all drop-shadow-[0_0_8px_rgba(128,0,32,0.5)]"
            >
              Solicitar Conta
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
