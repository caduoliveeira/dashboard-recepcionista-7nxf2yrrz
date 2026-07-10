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
import logoImg from '@/assets/02-04684.png'

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
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
      {/* Luxurious Background image overlay */}
      <div
        className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity grayscale"
        style={{
          backgroundImage: 'url(https://img.usecurling.com/p/1920/1080?q=luxury%20architecture)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Deep gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/90 via-[#050505]/80 to-primary/20 pointer-events-none z-0" />

      <Card className="w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border-0 bg-white/95 backdrop-blur-xl relative z-10 rounded-2xl overflow-hidden">
        {/* Top elegant accent line */}
        <div className="h-1.5 w-full bg-primary" />

        <CardHeader className="space-y-4 text-center pb-6 pt-10">
          <div className="mx-auto flex items-center justify-center mb-2">
            <img src={logoImg} alt="The Ruby's Gym Logo" className="h-20 w-auto object-contain" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 font-display">
              Acesso Restrito
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-semibold tracking-[0.2em] uppercase">
              The Ruby's Gym Management
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
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
                className="bg-white border-slate-200 h-12 focus-visible:ring-primary/20 shadow-sm"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-slate-200 h-12 focus-visible:ring-primary/20 shadow-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 bg-slate-50/50 border-t border-slate-100">
          <div className="text-center w-full text-sm text-slate-500 pt-4">
            Acesso exclusivo para colaboradores.{' '}
            <Link
              to="/auth/signup"
              className="text-primary font-medium hover:underline transition-all"
            >
              Solicitar Conta
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
