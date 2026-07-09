import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import useChecklistStore from '@/stores/use-checklist-store'
import { getAvatarUrl } from '@/stores/use-auth-store'
import { CheckCircle2 } from 'lucide-react'

const staffMembers = [
  { name: 'Ana Silva', avatarSeed: 'a1', gender: 'female' as const },
  { name: 'Bruno Costa', avatarSeed: 'b1', gender: 'male' as const },
]

export function StaffPerformance() {
  const { tasks } = useChecklistStore()

  const stats = staffMembers.map((s) => ({
    ...s,
    completed: tasks.filter((t) => t.status === 'completed' && t.completedBy === s.name).length,
  }))

  const totalCompleted = stats.reduce((sum, s) => sum + s.completed, 0)

  return (
    <Card className="border-none shadow-subtle bg-white">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle>Performance da Equipe</CardTitle>
        <CardDescription>Responsabilidade e produtividade individual</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-5">
          {stats.map((staff) => (
            <div key={staff.name} className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={getAvatarUrl(staff)} alt={staff.name} />
                <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">{staff.name}</span>
                  <span className="text-sm font-bold text-primary flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {staff.completed}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${totalCompleted > 0 ? (staff.completed / totalCompleted) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
