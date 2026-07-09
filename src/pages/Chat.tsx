import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchChatMessages,
  fetchChatMessagesBefore,
  sendChatMessage,
  type ChatMessage,
} from '@/services/chat'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const formatTimestamp = (iso: string) => {
  const d = new Date(iso)
  if (isToday(d)) return format(d, 'HH:mm', { locale: ptBR })
  if (isYesterday(d)) return `Ontem ${format(d, 'HH:mm', { locale: ptBR })}`
  return format(d, "dd/MM 'às' HH:mm", { locale: ptBR })
}

export default function Chat() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    let mounted = true
    fetchChatMessages(50).then(({ data }) => {
      if (!mounted) return
      setMessages(data)
      setHasMore(data.length >= 50)
      setLoading(false)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    const channel = supabase
      .channel('chat_messages_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload: any) => {
          const newMsg = payload.new as ChatMessage
          if (newMsg.sender_id === user.id) return
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMsg.sender_id)
            .single()
          const formatted: ChatMessage = {
            ...newMsg,
            profiles: profileData,
          }
          setMessages((prev) => [...prev, formatted])
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 50)
        },
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleSend = useCallback(async () => {
    if (!user || !input.trim()) return
    setSending(true)
    const content = input.trim()
    setInput('')
    const { data } = await sendChatMessage(user.id, content)
    if (data) {
      setMessages((prev) => [...prev, data])
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
    setSending(false)
  }, [user, input])

  const handleLoadMore = useCallback(async () => {
    if (!messages.length || loadingMore) return
    setLoadingMore(true)
    const firstTs = messages[0].created_at
    const prevScrollHeight = listRef.current?.scrollHeight ?? 0
    const { data } = await fetchChatMessagesBefore(firstTs, 50)
    if (data.length > 0) {
      setMessages((prev) => [...data, ...prev])
      setHasMore(data.length >= 50)
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight - prevScrollHeight
        }
      }, 0)
    } else {
      setHasMore(false)
    }
    setLoadingMore(false)
  }, [messages, loadingMore])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[60vh] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Chat da Equipe</h1>
        <p className="text-muted-foreground mt-1">
          Comunicação em tempo real entre todos os membros.
        </p>
      </div>

      <Card className="shadow-sm flex flex-col h-[65vh]">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {hasMore && (
              <div className="flex justify-center pb-2">
                <Button variant="ghost" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Carregar mais
                </Button>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Send className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col max-w-[75%]',
                      isOwn ? 'ml-auto items-end' : 'items-start',
                    )}
                  >
                    {!isOwn && (
                      <span className="text-xs font-semibold text-primary mb-0.5 px-1">
                        {msg.profiles?.full_name || 'Usuário'}
                      </span>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 text-sm break-words shadow-sm',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm',
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                      {formatTimestamp(msg.created_at)}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-3 flex gap-2 bg-card">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Digite sua mensagem..."
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon">
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
