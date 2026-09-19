import { useEffect, useState } from 'react'
import { api, type RespostaApi } from '@/lib/api'
import type { RelatorioIgreja } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const FILTROS = [
  { valor: 'todos', rotulo: 'Todos os registros' },
  { valor: 'mes_atual', rotulo: 'Este mês' },
  { valor: 'ultimos_30_dias', rotulo: 'Últimos 30 dias' },
  { valor: 'ultimos_90_dias', rotulo: 'Últimos 90 dias' },
]

export function AbaResumoIgreja({ igrejaId }: { igrejaId: number }) {
  const [filtro, setFiltro] = useState('mes_atual')
  const [dados, setDados] = useState<RelatorioIgreja | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    api
      .get<RespostaApi<RelatorioIgreja>>(`/igrejas/${igrejaId}/relatorio`, { params: { filtro } })
      .then(({ data }) => setDados(data.dados ?? null))
      .catch(() => toast.error('Não foi possível carregar o resumo.'))
      .finally(() => setCarregando(false))
  }, [igrejaId, filtro])

  return (
    <div>
      <div className="mb-6 flex items-center justify-center gap-3">
        <span className="text-text-primary text-sm font-semibold">Período:</span>
        <Select value={filtro} onValueChange={(v) => setFiltro(v ?? 'mes_atual')}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTROS.map((f) => (
              <SelectItem key={f.valor} value={f.valor}>
                {f.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {carregando && <p className="text-text-muted py-10 text-center text-sm">Carregando…</p>}

      {!carregando && dados && (
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          <CardResumo valor={dados.total_visitantes} rotulo="Visitantes" />
          <CardResumo valor={dados.total_conversoes} rotulo="Conversões" />
          <CardResumo valor={dados.total_reconciliacao} rotulo="Reconciliações" />
          <CardResumo valor={dados.total_batismos} rotulo="Batismos" />
        </div>
      )}
    </div>
  )
}

function CardResumo({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className="bg-primary rounded-2xl px-4 py-6 text-center text-white">
      <p className="text-3xl font-bold">{valor}</p>
      <p className="mt-1 text-xs font-medium opacity-90">{rotulo}</p>
    </div>
  )
}
