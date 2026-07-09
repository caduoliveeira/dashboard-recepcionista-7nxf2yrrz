import { useState, useEffect } from 'react'

export type Period = 'Abertura' | 'Turno Manhã' | 'Troca de Turno' | 'Turno Tarde' | 'Fechamento'

export interface Task {
  id: string
  title: string
  sop: string
  time: string
  period: Period
  status: 'pending' | 'completed' | 'delayed'
  note?: string
  completedAt?: Date
  assignedTo?: string
}

let globalTasks: Task[] = [
  {
    id: '1',
    title: 'Desativar alarme e ligar luzes',
    sop: 'Digitar senha no painel principal e ligar disjuntores da recepção.',
    time: '07:30',
    period: 'Abertura',
    status: 'completed',
    completedAt: new Date(new Date().setHours(7, 30, 0, 0)),
    assignedTo: 'Ana Silva',
  },
  {
    id: '2',
    title: 'Conferência de fundo de caixa',
    sop: 'Contar moedas e notas, registrar no sistema.',
    time: '07:45',
    period: 'Abertura',
    status: 'completed',
    completedAt: new Date(new Date().setHours(7, 50, 0, 0)),
    assignedTo: 'Ana Silva',
  },
  {
    id: '3',
    title: 'Verificar agendamentos do dia',
    sop: 'Imprimir lista de pacientes e separar prontuários.',
    time: '08:00',
    period: 'Turno Manhã',
    status: 'delayed',
  },
  {
    id: '4',
    title: 'Preparar café e água para recepção',
    sop: 'Abastecer máquina de café, verificar copos e galão de água.',
    time: '08:15',
    period: 'Turno Manhã',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Confirmar consultas do dia seguinte',
    sop: 'Enviar mensagens no WhatsApp e realizar ligações para não confirmados.',
    time: '10:00',
    period: 'Turno Manhã',
    status: 'pending',
  },
  {
    id: '6',
    title: 'Entrega de relatórios de turno',
    sop: 'Imprimir relatório de atendimentos e passar para a gerência.',
    time: '13:00',
    period: 'Troca de Turno',
    status: 'pending',
  },
  {
    id: '7',
    title: 'Repassar pendências para equipe da tarde',
    sop: 'Informar sobre pacientes atrasados ou exames pendentes.',
    time: '13:15',
    period: 'Troca de Turno',
    status: 'pending',
  },
  {
    id: '8',
    title: 'Organização da recepção',
    sop: 'Recolher revistas antigas, organizar cadeiras, limpar balcão.',
    time: '15:00',
    period: 'Turno Tarde',
    status: 'pending',
  },
  {
    id: '9',
    title: 'Conferir correspondências e entregas',
    sop: 'Receber e distribuir malotes e pacotes para os setores.',
    time: '16:00',
    period: 'Turno Tarde',
    status: 'pending',
  },
  {
    id: '10',
    title: 'Fechamento do caixa',
    sop: 'Fazer conciliação de cartões e dinheiro, depositar no cofre.',
    time: '18:30',
    period: 'Fechamento',
    status: 'pending',
  },
  {
    id: '11',
    title: 'Desligar equipamentos e luzes',
    sop: 'Verificar se computadores estão desligados e ativar alarme.',
    time: '19:00',
    period: 'Fechamento',
    status: 'pending',
  },
]

let listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export default function useChecklistStore() {
  const [tasks, setTasks] = useState<Task[]>(globalTasks)

  useEffect(() => {
    const listener = () => setTasks([...globalTasks])
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const toggleTask = (id: string) => {
    globalTasks = globalTasks.map((t) => {
      if (t.id === id) {
        const isCompleted = t.status === 'completed'
        return {
          ...t,
          status: isCompleted ? 'pending' : 'completed',
          completedAt: isCompleted ? undefined : new Date(),
          assignedTo: isCompleted ? undefined : 'Você',
        }
      }
      return t
    })
    notify()
  }

  const updateTaskNote = (id: string, note: string) => {
    globalTasks = globalTasks.map((t) => (t.id === id ? { ...t, note } : t))
    notify()
  }

  return { tasks, toggleTask, updateTaskNote }
}
