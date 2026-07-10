import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ActivityItem } from '@/services/tasks'

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="hidden xl:block w-[300px] shrink-0">
      <Card className="shadow-glass border-white/5 bg-card/40 backdrop-blur-xl rounded-2xl sticky top-8">
        <CardHeader className="pb-4 border-b border-white/5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Atividades de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-5 max-h-[600px] overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">Nenhuma atividade ainda.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="text-sm space-y-1 relative pl-3">
                <div className="absolute left-0 top-1.5 w-0.5 h-full bg-white/10 rounded-full" />
                <p className="font-medium text-white/90">{item.full_name || 'Usuário'}</p>
                <p className="text-white/60 leading-snug">
                  {item.action === 'completed' ? (
                    <>
                      completou "<span className="text-white/80">{item.task_title}</span>"
                    </>
                  ) : (
                    <span className="text-amber-500/80">
                      pulou "<span className="text-amber-500">{item.task_title}</span>"
                    </span>
                  )}
                </p>
                <p className="text-xs text-white/30 pt-1">
                  {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
