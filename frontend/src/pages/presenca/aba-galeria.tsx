import { useEffect, useState } from 'react'
import { api, type RespostaApi } from '@/lib/api'
import type { EventoIgreja, ReuniaoCelula } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Calendar, Image as ImageIcon } from 'lucide-react'
import { formatarDataLocal } from '@/lib/formatadores'

export function AbaGaleria({ celulaId, igrejaId }: { celulaId: string; igrejaId: number | null }) {
  const [reunioes, setReunioes] = useState<ReuniaoCelula[]>([])
  const [carregando, setCarregando] = useState(true)
  const [proximosEventos, setProximosEventos] = useState<EventoIgreja[]>([])

  useEffect(() => {
    setCarregando(true)
    api
      .get<RespostaApi<ReuniaoCelula[]>>('/presenca/reunioes', { params: { celula_id: celulaId } })
      .then(({ data }) => setReunioes(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar a galeria.'))
      .finally(() => setCarregando(false))
  }, [celulaId])

  useEffect(() => {
    if (!igrejaId) {
      setProximosEventos([])
      return
    }
    api
      .get<RespostaApi<EventoIgreja[]>>('/igrejas-eventos/proximos', { params: { igreja_id: igrejaId, limite: 5 } })
      .then(({ data }) => setProximosEventos(data.dados ?? []))
      .catch(() => {})
  }, [igrejaId])

  return (
    <div className="flex flex-col gap-5">
      {/* Agenda — próximos eventos da igreja à qual esta célula pertence,
          cadastrados por quem gerencia a igreja (pastor/gestor_igreja). */}
      <Card>
        <CardContent>
          <h3 className="text-text-primary mb-4 text-sm font-semibold">📅 Próximos eventos</h3>
          {proximosEventos.length === 0 && (
            <p className="text-text-muted py-6 text-center text-sm">Nenhum evento agendado no momento.</p>
          )}
          <ul className="flex flex-col gap-2.5">
            {proximosEventos.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                <span className="bg-amber-light text-amber flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                  <Calendar className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary truncate text-sm font-medium">{e.nome}</p>
                  <p className="text-text-muted truncate text-xs">
                    {formatarDataLocal(e.data_evento)}
                    {e.localizacao ? ` · ${e.localizacao}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="text-text-primary mb-4 text-sm font-semibold">Reuniões anteriores ({reunioes.length})</h3>

        {carregando && <p className="text-text-muted py-10 text-center text-sm">Carregando…</p>}
        {!carregando && reunioes.length === 0 && (
          <p className="text-text-muted py-10 text-center text-sm">Nenhuma reunião registrada ainda para esta célula.</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {reunioes.map((r) => (
            <div key={r.id} className="border-border overflow-hidden rounded-lg border">
              {r.foto_url ? (
                <img src={r.foto_url} alt={`Foto da reunião de ${formatarDataLocal(r.data_reuniao)}`} className="h-32 w-full object-cover" />
              ) : (
                <div className="bg-slate text-text-muted flex h-32 w-full items-center justify-center">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="p-2.5">
                <p className="text-text-primary text-xs font-semibold">{formatarDataLocal(r.data_reuniao)}</p>
                <p className="text-text-muted text-[11px]">
                  {r.total_presentes} presente(s) · {r.total_visitantes} visitante(s)
                </p>
                {r.observacoes && <p className="text-text-muted mt-1 truncate text-[11px] italic">{r.observacoes}</p>}
              </div>
            </div>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
