import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Igreja, Usuario } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { IgrejaDetalheDialog } from '@/pages/igrejas/igreja-detalhe-dialog'

interface FormularioIgreja {
  id: number | null
  nome: string
  endereco: string
  bairro: string
  cidade: string
  telefone: string
  email: string
  pastor_presidente_id: string
  pastor_auxiliar_id: string
}

function formVazio(): FormularioIgreja {
  return { id: null, nome: '', endereco: '', bairro: '', cidade: '', telefone: '', email: '', pastor_presidente_id: '', pastor_auxiliar_id: '' }
}

export function IgrejasPage() {
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [pastores, setPastores] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormularioIgreja>(formVazio())
  const [salvando, setSalvando] = useState(false)

  const [igrejaDetalhe, setIgrejaDetalhe] = useState<Igreja | null>(null)
  const [detalheAberto, setDetalheAberto] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<Igreja[]>>('/igrejas')
      .then(({ data }) => setIgrejas(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar as igrejas.'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
    api.get<RespostaApi<Usuario[]>>('/igrejas/pastores').then(({ data }) => setPastores(data.dados ?? []))
  }, [])

  function abrirNova() {
    setForm(formVazio())
    setModalAberto(true)
  }

  function abrirEdicao(i: Igreja) {
    setForm({
      id: i.id,
      nome: i.nome,
      endereco: i.endereco ?? '',
      bairro: i.bairro ?? '',
      cidade: i.cidade ?? '',
      telefone: i.telefone ?? '',
      email: i.email ?? '',
      pastor_presidente_id: i.pastor_presidente_id ? String(i.pastor_presidente_id) : '',
      pastor_auxiliar_id: i.pastor_auxiliar_id ? String(i.pastor_auxiliar_id) : '',
    })
    setModalAberto(true)
  }

  function abrirDetalhe(i: Igreja) {
    setIgrejaDetalhe(i)
    setDetalheAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error('Informe o nome da igreja.')
      return
    }
    setSalvando(true)
    const dados = {
      nome: form.nome,
      endereco: form.endereco || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      telefone: form.telefone || null,
      email: form.email || null,
      pastor_presidente_id: form.pastor_presidente_id || null,
      pastor_auxiliar_id: form.pastor_auxiliar_id || null,
    }
    try {
      if (form.id) {
        await apiMutate('put', `/igrejas/${form.id}`, dados)
        toast.success('Igreja atualizada.')
      } else {
        await apiMutate('post', '/igrejas', dados)
        toast.success('Igreja criada.')
      }
      setModalAberto(false)
      carregar()
    } catch {
      toast.error('Não foi possível salvar a igreja.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(i: Igreja) {
    if (!confirm(`Excluir a igreja "${i.nome}"? Isso também remove os registros vinculados a ela.`)) return
    try {
      await apiMutate('delete', `/igrejas/${i.id}`)
      setIgrejas((atual) => atual.filter((x) => x.id !== i.id))
      toast.success('Igreja excluída.')
    } catch {
      toast.error('Não foi possível excluir a igreja.')
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Igrejas"
        subtitulo="Gerencie igrejas, eventos, visitantes, conversões, reconciliações e batismos"
        acoes={
          <Button onClick={abrirNova}>
            <Plus className="mr-1 h-4 w-4" /> Nova igreja
          </Button>
        }
      />

      {carregando && <p className="text-text-muted text-sm">Carregando…</p>}
      {!carregando && igrejas.length === 0 && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">Nenhuma igreja cadastrada.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {igrejas.map((i) => (
          <Card key={i.id} className="relative overflow-hidden">
            <CardContent>
              {i.total_celulas > 0 && (
                <span className="bg-primary absolute top-4 right-4 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">
                  📍 {i.total_celulas} célula(s)
                </span>
              )}
              <h3 className="text-text-primary pr-24 text-base font-bold">⛪ {i.nome}</h3>
              {i.endereco && <p className="text-text-muted mt-2 text-xs">📍 {i.endereco}</p>}
              {(i.bairro || i.cidade) && <p className="text-text-muted text-xs">🏘️ {[i.bairro, i.cidade].filter(Boolean).join(', ')}</p>}
              {i.telefone && <p className="text-text-muted text-xs">📞 {i.telefone}</p>}

              <div className="bg-slate mt-3 rounded-lg p-3 text-xs">
                <p className="text-text-muted">👔 Pastor presidente: {i.pastor_presidente_nome || 'Não definido'}</p>
                <p className="text-text-muted mt-1">🤝 Pastor auxiliar: {i.pastor_auxiliar_nome || 'Não definido'}</p>
              </div>

              <div className="border-border mt-3 flex gap-2 border-t pt-3">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => abrirDetalhe(i)}>
                  <Eye className="mr-1 h-3.5 w-3.5" /> Ver
                </Button>
                <Button size="sm" variant="secondary" onClick={() => abrirEdicao(i)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="border-danger-light text-danger" onClick={() => excluir(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar igreja' : 'Nova igreja'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Nome da igreja</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Pastor presidente</Label>
              <Select value={form.pastor_presidente_id} onValueChange={(v) => setForm({ ...form, pastor_presidente_id: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {pastores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Pastor auxiliar</Label>
              <Select value={form.pastor_auxiliar_id} onValueChange={(v) => setForm({ ...form, pastor_auxiliar_id: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {pastores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Bairro</Label>
              <Input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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

      <IgrejaDetalheDialog igreja={igrejaDetalhe} aberto={detalheAberto} onOpenChange={setDetalheAberto} />
    </div>
  )
}
