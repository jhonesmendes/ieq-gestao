import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Evento } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Calendar, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { formatarDataLocal } from '@/lib/formatadores'

const TIPOS = ['evento', 'culto', 'retiro', 'conferencia', 'congresso', 'reuniao']

interface FormularioEvento {
  id: number | null
  nome: string
  tipo: string
  data_evento: string
  vagas: string
  localizacao: string
  descricao: string
}

function formVazio(): FormularioEvento {
  return { id: null, nome: '', tipo: 'evento', data_evento: '', vagas: '', localizacao: '', descricao: '' }
}

export function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormularioEvento>(formVazio())
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<Evento[]>>('/eventos')
      .then(({ data }) => setEventos(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar os eventos.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  function abrirNovo() {
    setForm(formVazio())
    setModalAberto(true)
  }

  function abrirEdicao(e: Evento) {
    setForm({
      id: e.id,
      nome: e.nome,
      tipo: e.tipo ?? 'evento',
      data_evento: e.data_evento.slice(0, 16),
      vagas: e.vagas != null ? String(e.vagas) : '',
      localizacao: e.localizacao ?? '',
      descricao: e.descricao ?? '',
    })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim() || !form.data_evento) {
      toast.error('Informe nome e data do evento.')
      return
    }
    setSalvando(true)
    const dados = {
      nome: form.nome,
      tipo: form.tipo,
      data_evento: form.data_evento.replace('T', ' ') + ':00',
      vagas: form.vagas ? Number(form.vagas) : null,
      localizacao: form.localizacao || null,
      descricao: form.descricao || null,
    }
    try {
      if (form.id) {
        await apiMutate('put', `/eventos/${form.id}`, dados)
        toast.success('Evento atualizado.')
      } else {
        await apiMutate('post', '/eventos', dados)
        toast.success('Evento criado.')
      }
      setModalAberto(false)
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
      <PageHeader
        titulo="Eventos"
        subtitulo="Crie e gerencie eventos da sua igreja"
        acoes={
          <Button onClick={abrirNovo}>
            <Plus className="mr-1 h-4 w-4" /> Novo evento
          </Button>
        }
      />

      {carregando && <p className="text-text-muted text-sm">Carregando…</p>}
      {!carregando && eventos.length === 0 && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">Nenhum evento cadastrado.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eventos.map((e) => (
          <Card key={e.id}>
            <CardContent>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-text-primary text-base font-bold">{e.nome}</h3>
                <Badge className="bg-primary-light text-primary-dark capitalize">{e.tipo || 'evento'}</Badge>
              </div>
              <p className="text-text-muted flex items-center gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5" /> {formatarDataLocal(e.data_evento)}
              </p>
              {e.localizacao && (
                <p className="text-text-muted flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5" /> {e.localizacao}
                </p>
              )}
              {e.vagas && (
                <p className="text-text-muted flex items-center gap-1.5 text-xs">
                  <Users className="h-3.5 w-3.5" /> {e.vagas} vagas
                </p>
              )}
              {e.descricao && <p className="text-text-muted mt-2 text-xs italic">{e.descricao}</p>}

              <div className="border-border mt-3 flex gap-2 border-t pt-3">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => abrirEdicao(e)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                </Button>
                <Button size="sm" variant="outline" className="border-danger-light text-danger flex-1" onClick={() => excluir(e)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar evento' : 'Novo evento'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Nome do evento</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v ?? 'evento' })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Vagas</Label>
              <Input type="number" min={0} value={form.vagas} onChange={(e) => setForm({ ...form, vagas: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Data e hora</Label>
              <Input type="datetime-local" value={form.data_evento} onChange={(e) => setForm({ ...form, data_evento: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Localização</Label>
              <Input
                placeholder="Ex: Templo Central, Parque da Lagoa…"
                value={form.localizacao}
                onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Descrição</Label>
              <Textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
