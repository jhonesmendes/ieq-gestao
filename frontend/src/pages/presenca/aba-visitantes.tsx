import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Visitante } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { formatarDataLocal, iniciais } from '@/lib/formatadores'

type StatusVisitante = 'primeira_visita' | 'retornou' | 'convertido' | 'membro'

const ROTULO_STATUS: Record<StatusVisitante, string> = {
  primeira_visita: 'Primeira visita',
  retornou: 'Retornou',
  convertido: 'Convertido',
  membro: 'Virou membro',
}

const COR_STATUS: Record<StatusVisitante, string> = {
  primeira_visita: 'bg-info-light text-info',
  retornou: 'bg-amber-light text-amber',
  convertido: 'bg-primary-light text-primary-dark',
  membro: 'bg-violet-100 text-violet-700',
}

interface FormularioVisitante {
  id: number | null
  nome: string
  telefone: string
  data_visita: string
  status: StatusVisitante
}

function formVazio(): FormularioVisitante {
  return { id: null, nome: '', telefone: '', data_visita: new Date().toISOString().slice(0, 10), status: 'primeira_visita' }
}

export function AbaVisitantes({ celulaId }: { celulaId: string }) {
  const [visitantes, setVisitantes] = useState<Visitante[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormularioVisitante>(formVazio())
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<Visitante[]>>('/visitantes', { params: { celula_id: celulaId } })
      .then(({ data }) => setVisitantes((data.dados ?? []).sort((a, b) => (a.data_visita < b.data_visita ? 1 : -1))))
      .catch(() => toast.error('Não foi possível carregar os visitantes.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [celulaId])

  function abrirNovo() {
    setForm(formVazio())
    setModalAberto(true)
  }

  function abrirEdicao(v: Visitante) {
    setForm({ id: v.id, nome: v.nome, telefone: v.telefone ?? '', data_visita: v.data_visita, status: v.status })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do visitante.')
      return
    }
    setSalvando(true)
    try {
      if (form.id) {
        await apiMutate('put', `/visitantes/${form.id}`, {
          nome: form.nome,
          telefone: form.telefone || null,
          data_visita: form.data_visita,
          status: form.status,
        })
        toast.success('Visitante atualizado.')
      } else {
        await apiMutate('post', '/visitantes', {
          nome: form.nome,
          telefone: form.telefone || null,
          data_visita: form.data_visita,
          status: form.status,
          celula_id: celulaId,
        })
        toast.success('Visitante cadastrado.')
      }
      setModalAberto(false)
      carregar()
    } catch {
      toast.error('Não foi possível salvar o visitante.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(v: Visitante) {
    if (!confirm(`Excluir o registro de ${v.nome}?`)) return
    try {
      await apiMutate('delete', `/visitantes/${v.id}`)
      setVisitantes((atual) => atual.filter((x) => x.id !== v.id))
      toast.success('Visitante removido.')
    } catch {
      toast.error('Não foi possível excluir o visitante.')
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-semibold">Visitantes desta célula ({visitantes.length})</h3>
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="mr-1 h-4 w-4" /> Novo visitante
          </Button>
        </div>

        {carregando && <p className="text-text-muted py-10 text-center text-sm">Carregando…</p>}
        {!carregando && visitantes.length === 0 && (
          <p className="text-text-muted py-10 text-center text-sm">Nenhum visitante registrado nesta célula ainda.</p>
        )}

        <ul className="flex flex-col gap-2.5">
          {visitantes.map((v) => (
            <li key={v.id} className="border-border flex items-center gap-3 rounded-lg border p-3">
              <span className="bg-amber flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                {iniciais(v.nome)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary truncate text-sm font-medium">{v.nome}</p>
                <p className="text-text-muted truncate text-xs">
                  {formatarDataLocal(v.data_visita)} {v.telefone ? `· ${v.telefone}` : ''}
                </p>
              </div>
              <Badge className={COR_STATUS[v.status]}>{ROTULO_STATUS[v.status]}</Badge>
              <button onClick={() => abrirEdicao(v)} className="text-text-muted hover:text-primary p-1">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => excluir(v)} className="text-danger p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar visitante' : 'Novo visitante'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label className="mb-1.5">Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Data da visita</Label>
              <Input type="date" value={form.data_visita} onChange={(e) => setForm({ ...form, data_visita: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: (v ?? 'primeira_visita') as StatusVisitante })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
                    <SelectItem key={valor} value={valor}>
                      {rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </Card>
  )
}
