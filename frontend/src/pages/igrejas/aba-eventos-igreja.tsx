import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { EventoIgreja } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { formatarDataLocal } from '@/lib/formatadores'

export function AbaEventosIgreja({ igrejaId }: { igrejaId: number }) {
  const [eventos, setEventos] = useState<EventoIgreja[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', data_evento: '', localizacao: '', tipo: '', vagas: '' })

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<EventoIgreja[]>>('/igrejas-eventos', { params: { id: igrejaId } })
      .then(({ data }) => setEventos(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar os eventos.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [igrejaId])

  async function salvar() {
    if (!form.nome.trim() || !form.data_evento) {
      toast.error('Informe nome e data do evento.')
      return
    }
    setSalvando(true)
    try {
      await apiMutate('post', '/igrejas-eventos', {
        igreja_id: igrejaId,
        nome: form.nome,
        descricao: form.descricao || null,
        data_evento: form.data_evento.replace('T', ' ') + ':00',
        localizacao: form.localizacao || null,
        tipo: form.tipo || null,
        vagas: form.vagas ? Number(form.vagas) : null,
      })
      toast.success('Evento criado.')
      setFormAberto(false)
      setForm({ nome: '', descricao: '', data_evento: '', localizacao: '', tipo: '', vagas: '' })
      carregar()
    } catch {
      toast.error('Não foi possível salvar o evento.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(e: EventoIgreja) {
    if (!confirm(`Excluir o evento "${e.nome}"?`)) return
    try {
      await apiMutate('delete', `/igrejas-eventos/${e.id}`)
      setEventos((atual) => atual.filter((x) => x.id !== e.id))
      toast.success('Evento excluído.')
    } catch {
      toast.error('Não foi possível excluir o evento.')
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-text-primary text-sm font-semibold">🎯 Eventos da igreja ({eventos.length})</h4>
        <Button size="sm" onClick={() => setFormAberto((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> Novo evento
        </Button>
      </div>

      {formAberto && (
        <div className="border-border bg-slate mb-4 grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5">Nome do evento</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5">Descrição</Label>
            <Textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">Data do evento</Label>
            <Input type="datetime-local" value={form.data_evento} onChange={(e) => setForm({ ...form, data_evento: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">Localização</Label>
            <Input value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">Tipo</Label>
            <Input placeholder="culto, congresso, retiro…" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">Vagas</Label>
            <Input type="number" min={0} value={form.vagas} onChange={(e) => setForm({ ...form, vagas: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="secondary" onClick={() => setFormAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      )}

      {carregando && <p className="text-text-muted py-8 text-center text-sm">Carregando…</p>}
      {!carregando && eventos.length === 0 && <p className="text-text-muted py-8 text-center text-sm">Nenhum evento cadastrado.</p>}

      <ul className="flex flex-col gap-2">
        {eventos.map((e) => (
          <li key={e.id} className="border-border flex items-center gap-3 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <p className="text-text-primary truncate text-sm font-medium">{e.nome}</p>
              <p className="text-text-muted truncate text-xs">
                {formatarDataLocal(e.data_evento)}
                {e.tipo ? ` · ${e.tipo}` : ''}
                {e.localizacao ? ` · ${e.localizacao}` : ''}
              </p>
            </div>
            <button onClick={() => excluir(e)} className="text-danger p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
