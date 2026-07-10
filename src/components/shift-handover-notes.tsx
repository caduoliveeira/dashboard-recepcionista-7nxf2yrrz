import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { fetchHandoverNotes, addHandoverNote, type HandoverNote } from '@/services/handover-notes'

interface ShiftHandoverNotesProps {
  categoryId: string
  userId?: string
}

export function ShiftHandoverNotes({ categoryId, userId }: ShiftHandoverNotesProps) {
  const [notes, setNotes] = useState<HandoverNote[]>([])
  const [newNote, setNewNote] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchHandoverNotes(categoryId).then(({ data }) => {
      if (data) setNotes(data)
    })
  }, [categoryId])

  const handleAdd = async () => {
    if (!userId || !newNote.trim()) return
    const { data, error } = await addHandoverNote(categoryId, userId, newNote.trim())
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
      return
    }
    if (data) {
      setNotes((prev) => [data, ...prev])
      setNewNote('')
    }
  }

  return (
    <div className="p-4 bg-white/[0.02] border-t border-white/5">
      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-2 scrollbar-thin">
        {notes.map((note) => (
          <div key={note.id} className="text-xs bg-black/20 rounded-md p-2 border border-white/5">
            <p className="text-white/40 font-medium mb-1">
              {note.profiles?.full_name || 'Usuário'} ·{' '}
              {new Date(note.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-white/80">{note.note}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-medium text-white/50 mb-2">Recado para o próximo turno</p>
      <div className="relative">
        <Input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Deixe um recado..."
          className="bg-black/40 border-white/10 text-xs h-10 pr-10 focus-visible:ring-primary/50 text-white placeholder:text-white/30"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newNote.trim() || !userId}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
