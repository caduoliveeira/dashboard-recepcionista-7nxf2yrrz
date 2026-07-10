import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { ActivityItem } from '@/services/tasks'
import { Activity } from 'lucide-react'

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="w-full">
      <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-2xl">
        <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
          <CardTitle className="text-sm font-bold tracking-widest uppercase flex items-center gap-2.5 text-white/90">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            Atividades de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Activity className="h-5 w-5 text-white/20" />
              </div>
              <p className="text-sm text-white/40 font-medium">
                Nenhuma atividade registrada hoje.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="text-sm relative p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/30 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold text-white/90 truncate">
                        {item.full_name || 'Usuário'}
                      </p>
                      <p className="text-[10px] font-medium text-white/40 tabular-nums shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <p className="text-white/60 leading-relaxed text-[13px] line-clamp-2">
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
