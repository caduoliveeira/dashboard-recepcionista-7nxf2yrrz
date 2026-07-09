import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore, { demoAccounts } from '@/stores/use-auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dumbbell, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = login(email, password)
    if (success) {
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' })
      navigate('/')
    } else {
      setError('Credenciais inválidas. Tente novamente.')
    }
  }

  const quickLogin = (em: string, pw: string) => {
    const success = login(em, pw)
    if (success) {
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recepção Exímia</h1>
          <p className="text-sm text-slate-500 mt-1">Sistema de Gestão de Recepção</p>
        </div>

        <Card className="border-none shadow-elevation bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Entrar</CardTitle>
            <CardDescription>Acesse com suas credenciais para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}

              <Button type="submit" className="w-full h-11 text-base">
                Entrar
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 mb-3 text-center">
                Acessos rápidos para demonstração
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <Button
                    key={acc.email}
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin(acc.email, acc.password)}
                    className="text-xs gap-1.5"
                  >
                    {acc.label} <ArrowRight className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
