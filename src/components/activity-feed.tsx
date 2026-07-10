import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ActivityItem } from '@/services/tasks'

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="hidden xl:block w-[320px] shrink-0">
      <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-2xl sticky top-8 flex flex-col max-h-[calc(100vh-6rem)]">
        <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01] shrink-0">
          <CardTitle className="text-sm font-bold tracking-widest uppercase flex items-center gap-2.5 text-white/90">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            Atividades de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6 overflow-y-auto scrollbar-thin flex-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-3">
                <span className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <p className="text-sm text-white/40 font-medium">Nenhuma atividade registrada.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id} className="text-sm relative pl-5 group">
                {index !== items.length - 1 && (
                  <div className="absolute left-[3px] top-6 w-px h-[calc(100%+16px)] bg-gradient-to-b from-white/10 to-transparent group-hover:from-primary/30 transition-colors duration-500" />
                )}
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full border-2 border-[#0a0a0a] bg-white/20 group-hover:bg-primary group-hover:shadow-[0_0_8px_rgba(128,0,32,0.6)] transition-all duration-300" />
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-white/90">{item.full_name || 'Usuário'}</p>
                    <p className="text-[10px] font-medium text-white/40 tabular-nums shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="text-white/60 leading-relaxed text-[13px]">
                    {item.action === 'completed' ? (
                      <>
                        completou{' '}
                        <span className="text-white/80 font-medium">"{item.task_title}"</span>
                      </>
                    ) : (
                      <>
                        pulou{' '}
                        <span className="text-amber-400/90 font-medium">"{item.task_title}"</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
