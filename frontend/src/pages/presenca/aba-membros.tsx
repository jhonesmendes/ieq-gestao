import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Membro } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { iniciais } from '@/lib/formatadores'

interface FormularioMembro {
  id: number | null
  nome: string
  email: string
  telefone: string
  status: 'ativo' | 'inativo'
}

const FORM_VAZIO: FormularioMembro = { id: null, nome: '', email: '', telefone: '', status: 'ativo' }

export function AbaMembros({ celulaId }: { celulaId: string }) {
  const [membros, setMembros] = useState<Membro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormularioMembro>(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<Membro[]>>('/membros', { params: { celula_id: celulaId } })
      .then(({ data }) => setMembros(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar os membros.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [celulaId])

  function abrirNovo() {
    setForm(FORM_VAZIO)
    setModalAberto(true)
  }

  function abrirEdicao(m: Membro) {
    setForm({ id: m.id, nome: m.nome, email: m.email ?? '', telefone: m.telefone ?? '', status: m.status })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do membro.')
      return
    }

    setSalvando(true)
    try {
      if (form.id) {
        await apiMutate('put', `/membros/${form.id}`, {
          nome: form.nome,
          email: form.email || null,
          telefone: form.telefone || null,
          status: form.status,
        })
        toast.success('Membro atualizado.')
      } else {
        await apiMutate('post', '/membros', {
          nome: form.nome,
          email: form.email || null,
          telefone: form.telefone || null,
          status: form.status,
          celula_id: celulaId,
        })
        toast.success('Membro criado — senha padrão: 123456')
      }
      setModalAberto(false)
      carregar()
    } catch {
      toast.error('Não foi possível salvar o membro.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(m: Membro) {
    if (!confirm(`Excluir ${m.nome} desta célula?`)) return
    try {
      await apiMutate('delete', `/membros/${m.id}`)
      setMembros((atual) => atual.filter((x) => x.id !== m.id))
      toast.success('Membro removido.')
    } catch {
      toast.error('Não foi possível excluir o membro.')
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-semibold">Membros da célula ({membros.length})</h3>
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="mr-1 h-4 w-4" /> Novo membro
          </Button>
        </div>

        {carregando && <p className="text-text-muted py-10 text-center text-sm">Carregando…</p>}
        {!carregando && membros.length === 0 && (
          <p className="text-text-muted py-10 text-center text-sm">Nenhum membro cadastrado nesta célula.</p>
        )}

        <ul className="flex flex-col gap-2.5">
          {membros.map((m) => (
            <li key={m.id} className="border-border flex items-center gap-3 rounded-lg border p-3">
              <span className="bg-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                {iniciais(m.nome)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary truncate text-sm font-medium">{m.nome}</p>
                <p className="text-text-muted truncate text-xs">{m.telefone || m.email || 'Sem contato cadastrado'}</p>
              </div>
              <Badge variant={m.status === 'ativo' ? 'default' : 'secondary'} className={m.status === 'ativo' ? 'bg-primary-light text-primary-dark' : ''}>
                {m.status}
              </Badge>
              <button onClick={() => abrirEdicao(m)} className="text-text-muted hover:text-primary p-1">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => excluir(m)} className="text-danger p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar membro' : 'Novo membro'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label className="mb-1.5">Nome completo</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">E-mail (opcional)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: (v ?? 'ativo') as 'ativo' | 'inativo' })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
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
