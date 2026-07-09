import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Zap, HeartPulse, Building2, Phone } from 'lucide-react'

const PROTOCOLS = [
  {
    icon: Zap,
    title: 'Falha de Energia',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    steps: [
      'Mantenha a calma e oriente os alunos a pararem os equipamentos.',
      'Acenda lanternas de emergencia e verifique saidas.',
      'Verifique se a catraca de emergencia esta destravada.',
      'Anote o horario e comunique a concessionaria de energia.',
      'Aguarde retorno da energia antes de reativar equipamentos.',
    ],
  },
  {
    icon: HeartPulse,
    title: 'Acidente ou Mal-Estar',
    color: 'text-red-600 bg-red-50 border-red-200',
    steps: [
      'Ligue imediatamente para o SAMU: 192.',
      'Nao mova a pessoa caso suspeite de lesao na coluna.',
      'Mantenha a area isolada e arejada.',
      'Acompanhe a pessoa ate a chegada do socorro.',
      'Registre o incidente e comunique o proprietario.',
    ],
  },
  {
    icon: Building2,
    title: 'Falha Estrutural',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    steps: [
      'Evacue a area afetada imediatamente.',
      'Impeca o acesso de pessoas ao local.',
      'Comunique o proprietario e a administracao do predio.',
      'Documente com fotos se possivel.',
      'Aguarde avaliacao tecnica antes de reabrir a area.',
    ],
  },
]

const CONTACTS = [
  { label: 'SAMU', number: '192' },
  { label: 'Bombeiros', number: '193' },
  { label: 'Policia', number: '190' },
  { label: 'Defesa Civil', number: '199' },
]

export default function Emergency() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Procedimentos de Emergencia
        </h1>
        <p className="text-muted-foreground mt-1">
          Protocolos de acao rapida para situacoes criticas.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CONTACTS.map((c) => (
          <a key={c.number} href={`tel:${c.number}`} className="block">
            <Card className="shadow-sm hover:shadow-md transition-shadow border-destructive/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-destructive/10 p-2.5 rounded-lg">
                  <Phone className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground tabular-nums">{c.number}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PROTOCOLS.map((p) => {
          const Icon = p.icon
          return (
            <Card key={p.title} className="shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg border ${p.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ol className="space-y-2.5">
                  {p.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground/90 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
