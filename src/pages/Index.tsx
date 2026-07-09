import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { role, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role === 'owner') {
    return <Navigate to="/reports" replace />
  }

  return <Navigate to="/checklist" replace />
}
