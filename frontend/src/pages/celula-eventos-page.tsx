import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Celula, Evento } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { formatarDataLocal } from '@/lib/formatadores'

const FORM_VAZIO = { nome: '', descricao: '', data_evento: '', localizacao: '', tipo: '', vagas: '' }

/**
 * Agenda de eventos da própria célula — separada de Presença & Célula de
 * propósito (o líder abre direto do menu, sem precisar navegar por abas).
 * Diferente da agenda da igreja (só leitura pro líder): aqui o líder tem
 * CRUD completo, mas só na(s) célula(s) que ele lidera.
 */
export function CelulaEventosPage() {
  const [celulas, setCelulas] = useState<Celula[]>([])
  const [celulaId, setCelulaId] = useState('')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)

  useEffect(() => {
    api.get<RespostaApi<Celula[]>>('/celulas').then(({ data }) => {
      const lista = data.dados ?? []
      setCelulas(lista)
      if (lista.length === 1) setCelulaId(String(lista[0].id))
    })
  }, [])

  function carregar() {
    if (!celulaId) return
    setCarregando(true)
    api
      .get<RespostaApi<Evento[]>>('/eventos', { params: { celula_id: celulaId } })
      .then(({ data }) => setEventos(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar os eventos.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [celulaId])

  async function salvar() {
    if (!form.nome.trim() || !form.data_evento) {
      toast.error('Informe nome e data do evento.')
      return
    }
    setSalvando(true)
    try {
      await apiMutate('post', '/eventos', {
        celula_id: celulaId,
        nome: form.nome,
        descricao: form.descricao || null,
        data_evento: form.data_evento.replace('T', ' ') + ':00',
        localizacao: form.localizacao || null,
        tipo: form.tipo || null,
        vagas: form.vagas ? Number(form.vagas) : null,
      })
      toast.success('Evento criado.')
      setFormAberto(false)
      setForm(FORM_VAZIO)
      carregar()
    } catch {
      toast.error('Não foi possível salvar o evento.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(e: Evento) {
    if (!confirm(`Excluir o evento "${e.nome}"?`)) return
    try {
      await apiMutate('delete', `/eventos/${e.id}`)
      setEventos((atual) => atual.filter((x) => x.id !== e.id))
      toast.success('Evento excluído.')
    } catch {
      toast.error('Não foi possível excluir o evento.')
    }
  }

  return (
    <div>
      <h1 className="text-text-primary mb-1 text-lg font-bold">Eventos da Célula</h1>
      <p className="text-text-muted mb-5 text-sm">Agenda própria da sua célula — visível para os membros.</p>

      {celulas.length > 1 && (
        <div className="mb-5 flex flex-col gap-1.5">
          <Label>Célula</Label>
          <Select value={celulaId} onValueChange={(v) => setCelulaId(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma célula" />
            </SelectTrigger>
            <SelectContent>
              {celulas.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!celulaId && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">Selecione uma célula para começar.</CardContent>
        </Card>
      )}

      {celulaId && (
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-text-primary text-sm font-semibold">🎯 Eventos ({eventos.length})</h3>
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
                  <Input placeholder="reunião especial, evangelismo…" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
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
            {!carregando && eventos.length === 0 && (
              <p className="text-text-muted py-8 text-center text-sm">Nenhum evento cadastrado para esta célula ainda.</p>
            )}

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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
