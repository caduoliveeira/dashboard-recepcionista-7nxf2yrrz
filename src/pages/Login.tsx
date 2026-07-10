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
import { Dumbbell, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  if (user && !loading) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
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
      navigate('/')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/20 selection:text-foreground">
      {/* Background Gradients for image-free stability */}
      <div className="absolute inset-0 bg-background pointer-events-none z-0" />
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-secondary/30 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md shadow-xl border-border bg-card/90 backdrop-blur-xl relative z-10 rounded-2xl overflow-hidden">
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-hover to-primary" />

        <CardHeader className="space-y-4 text-center pb-6 pt-10">
          <div className="mx-auto bg-muted w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-border">
            <Dumbbell className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
              The Ruby's Gym
            </h1>
            <CardDescription className="text-xs text-muted-foreground font-medium tracking-[0.15em] uppercase">
              Acesso Restrito • Sistema de Gestão
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5 text-left">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
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
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 h-12 px-4 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl"
              />
            </div>
            <div className="space-y-2.5 text-left">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 h-12 px-4 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold uppercase tracking-wider transition-all duration-300 bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
              disabled={isLoading || loading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : loading ? (
                'Inicializando...'
              ) : (
                'Entrar na Plataforma'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8 bg-muted/30 border-t border-border">
          <div className="text-center w-full text-sm text-muted-foreground pt-4">
            Acesso exclusivo para colaboradores.{' '}
            <Link
              to="/auth/signup"
              className="text-primary hover:text-primary-hover font-bold hover:underline transition-all underline-offset-4"
            >
              Solicitar Conta
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
