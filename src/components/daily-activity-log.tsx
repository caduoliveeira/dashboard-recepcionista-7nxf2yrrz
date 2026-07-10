import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Clock } from 'lucide-react'

type ActivityItem = {
  id: string
  task_title: string | null
  completed_at: string
  full_name: string | null
}

export function DailyActivityLog() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

      const { data } = await supabase
        .from('task_completions')
        .select(`
          id, completed_at,
          tasks ( title ),
          profiles ( full_name )
        `)
        .gte('completed_at', start)
        .lt('completed_at', end)
        .order('completed_at', { ascending: false })

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        task_title: Array.isArray(item.tasks) ? item.tasks[0]?.title : item.tasks?.title,
        completed_at: item.completed_at,
        full_name: Array.isArray(item.profiles)
          ? item.profiles[0]?.full_name
          : item.profiles?.full_name,
      })) as ActivityItem[]

      setItems(formatted)
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('daily_activity_log')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_completions' },
        () => load(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Atividades de Hoje
        </CardTitle>
        <CardDescription>
          Tarefas concluídas no dia de hoje — atualização em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground text-sm">
            Nenhuma tarefa concluída hoje ainda.
          </p>
        ) : (
          <ul className="divide-y max-h-[320px] overflow-y-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.task_title || 'Tarefa sem título'}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.full_name || 'Usuário'}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {new Date(item.completed_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
