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
    <div className="p-6 bg-black/20 border-t border-white/5 mt-auto">
      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2 scrollbar-thin">
        {notes.map((note) => (
          <div
            key={note.id}
            className="text-xs bg-white/5 rounded-lg p-3 border border-white/5 backdrop-blur-sm"
          >
            <p className="text-white/40 font-medium mb-1.5 flex items-center justify-between">
              <span>{note.profiles?.full_name || 'Usuário'}</span>
              <span>
                {new Date(note.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
            <p className="text-white/80 leading-relaxed">{note.note}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-medium text-white/50 mb-2 px-1">Recado para o próximo turno</p>
      <div className="relative flex items-center">
        <Input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Deixe um recado..."
          className="bg-black/50 border-white/10 text-xs h-11 pr-12 focus-visible:ring-primary/50 focus-visible:border-primary/30 text-white placeholder:text-white/30 rounded-xl transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newNote.trim() || !userId}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white disabled:opacity-0 transition-all duration-300"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
