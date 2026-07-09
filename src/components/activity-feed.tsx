import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ActivityItem } from '@/services/tasks'

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="hidden xl:block w-72 shrink-0">
      <Card className="shadow-sm sticky top-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Atividades de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma atividade ainda.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="text-sm border-l-2 border-primary/30 pl-3 space-y-0.5">
                <p className="font-medium text-foreground">{item.full_name || 'Usuário'}</p>
                <p className="text-muted-foreground">
                  {item.action === 'completed' ? (
                    <>
                      completou <span className="font-medium">"{item.task_title}"</span>
                    </>
                  ) : (
                    <span className="text-amber-600">
                      pulou <span className="font-medium">"{item.task_title}"</span>
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground/70">
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
