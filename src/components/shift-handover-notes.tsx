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
    <div className="border-t px-4 py-3 bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground mb-2">Recado para o próximo turno</p>
      <div className="flex gap-2 mb-2">
        <Input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Deixe um recado..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={!newNote.trim() || !userId}
          className="h-8 w-8 p-0"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1.5 max-h-28 overflow-y-auto">
        {notes.map((note) => (
          <div key={note.id} className="text-xs bg-muted/50 rounded-md p-2">
            <p className="text-muted-foreground font-medium">
              {note.profiles?.full_name || 'Usuário'} ·{' '}
              {new Date(note.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-0.5 text-foreground">{note.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
