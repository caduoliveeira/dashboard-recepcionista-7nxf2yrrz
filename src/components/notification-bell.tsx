import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchNotifications,
  markAllNotificationsRead,
  type Notification,
} from '@/services/notifications'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const load = () => {
      fetchNotifications(user.id).then(({ data }) => {
        if (data) setNotifications(data)
      })
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleOpen = async () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0 && user) {
      await markAllNotificationsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-popover border rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-3 border-b sticky top-0 bg-popover">
            <p className="font-semibold text-sm">Notificacoes</p>
          </div>
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Sem notificacoes.</p>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li key={n.id} className={cn('p-3 text-sm', !n.read && 'bg-primary/5')}>
                  <p className="text-foreground leading-relaxed">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
