import { useState, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function AuthGuard() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShowSpinner(false)
      return
    }
    const timer = setTimeout(() => setShowSpinner(true), 500)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading && showSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-screen bg-background" />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
