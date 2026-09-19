import { useEffect, useMemo, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Celula, Igreja, Usuario } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Home, Users, Star, TriangleAlert, Pencil, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const LIMIAR_ALERTA = 5
const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const CORES_FAIXA = ['#059669', '#2563EB', '#D97706', '#8B5CF6', '#DC2626']

interface FormularioCelula {
  id: number | null
  nome: string
  igreja_id: string
  dia_semana: string
  hora: string
  endereco: string
  bairro: string
  cidade: string
  lider_id: string
  lider_id_2: string
  lider_treinamento_id: string
}

function formVazio(): FormularioCelula {
  return {
    id: null,
    nome: '',
    igreja_id: '',
    dia_semana: '',
    hora: '',
    endereco: '',
    bairro: '',
    cidade: '',
    lider_id: '',
    lider_id_2: '',
    lider_treinamento_id: '',
  }
}

export function CelulasPage() {
  const [celulas, setCelulas] = useState<Celula[]>([])
  const [igrejas, setIgrejas] = useState<Igreja[]>([])
  const [lideres, setLideres] = useState<Usuario[]>([])
  const [lideresTreinamento, setLideresTreinamento] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'todas' | 'alerta'>('todas')

  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormularioCelula>(formVazio())
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<Celula[]>>('/celulas')
      .then(({ data }) => setCelulas(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar as células.'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
    api.get<RespostaApi<Igreja[]>>('/igrejas').then(({ data }) => setIgrejas(data.dados ?? []))
    api.get<RespostaApi<Usuario[]>>('/celulas/lideres').then(({ data }) => setLideres(data.dados ?? []))
    api.get<RespostaApi<Usuario[]>>('/celulas/lideres-treinamento').then(({ data }) => setLideresTreinamento(data.dados ?? []))
  }, [])

  const totalMembros = celulas.reduce((soma, c) => soma + c.total_membros, 0)
  const lideresUnicos = new Set(celulas.map((c) => c.lider_id).filter(Boolean)).size
  const totalAlertas = celulas.filter((c) => c.total_membros < LIMIAR_ALERTA).length

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return celulas.filter((c) => {
      const emAlerta = c.total_membros < LIMIAR_ALERTA
      if (filtro === 'alerta' && !emAlerta) return false
      if (!termo) return true
      return c.nome.toLowerCase().includes(termo) || (c.lider_nome ?? '').toLowerCase().includes(termo)
    })
  }, [celulas, busca, filtro])

  function abrirNova() {
    setForm(formVazio())
    setModalAberto(true)
  }

  function abrirEdicao(c: Celula) {
    setForm({
      id: c.id,
      nome: c.nome,
      igreja_id: c.igreja_id ? String(c.igreja_id) : '',
      dia_semana: c.dia_semana ?? '',
      hora: c.hora ?? '',
      endereco: c.endereco ?? '',
      bairro: c.bairro ?? '',
      cidade: c.cidade ?? '',
      lider_id: c.lider_id ? String(c.lider_id) : '',
      lider_id_2: c.lider_id_2 ? String(c.lider_id_2) : '',
      lider_treinamento_id: c.lider_treinamento_id ? String(c.lider_treinamento_id) : '',
    })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error('Informe o nome da célula.')
      return
    }
    setSalvando(true)
    const dados = {
      nome: form.nome,
      igreja_id: form.igreja_id || null,
      dia_semana: form.dia_semana || null,
      hora: form.hora || null,
      endereco: form.endereco || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      lider_id: form.lider_id || null,
      lider_id_2: form.lider_id_2 || null,
      lider_treinamento_id: form.lider_treinamento_id || null,
    }
    try {
      if (form.id) {
        await apiMutate('put', `/celulas/${form.id}`, dados)
        toast.success('Célula atualizada.')
      } else {
        await apiMutate('post', '/celulas', dados)
        toast.success('Célula criada.')
      }
      setModalAberto(false)
      carregar()
    } catch {
      toast.error('Não foi possível salvar a célula.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(c: Celula) {
    if (!confirm(`Excluir a célula "${c.nome}"?`)) return
    try {
      await apiMutate('delete', `/celulas/${c.id}`)
      setCelulas((atual) => atual.filter((x) => x.id !== c.id))
      toast.success('Célula excluída.')
    } catch {
      toast.error('Não foi possível excluir a célula.')
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Células"
        subtitulo="Gerencie as células da sua igreja"
        acoes={
          <Button onClick={abrirNova}>
            <Plus className="mr-1 h-4 w-4" /> Nova célula
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CardEstatistica icone={<Home className="h-5 w-5" />} cor="bg-primary-light text-primary" valor={celulas.length} rotulo="Células ativas" />
        <CardEstatistica icone={<Users className="h-5 w-5" />} cor="bg-info-light text-info" valor={totalMembros} rotulo="Membros nas células" />
        <CardEstatistica icone={<Star className="h-5 w-5" />} cor="bg-violet-100 text-violet-600" valor={lideresUnicos} rotulo="Líderes ativos" />
        <CardEstatistica icone={<TriangleAlert className="h-5 w-5" />} cor="bg-danger-light text-danger" valor={totalAlertas} rotulo="Com poucos membros" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input placeholder="Buscar por nome ou líder…" value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-xs" />
        <Tabs value={filtro} onValueChange={(v) => setFiltro((v ?? 'todas') as 'todas' | 'alerta')}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="alerta">Com alerta</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {carregando && <p className="text-text-muted text-sm">Carregando…</p>}
      {!carregando && listaFiltrada.length === 0 && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">Nenhuma célula encontrada.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listaFiltrada.map((c, i) => {
          const emAlerta = c.total_membros < LIMIAR_ALERTA
          return (
            <Card key={c.id} className="overflow-hidden border-t-4" style={{ borderTopColor: emAlerta ? '#DC2626' : CORES_FAIXA[i % CORES_FAIXA.length] }}>
              <CardContent>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-text-primary text-base font-bold">{c.nome}</h3>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap',
                      emAlerta ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary-dark',
                    )}
                  >
                    {emAlerta ? '⚠️ Alerta' : '✓ Ativa'}
                  </span>
                </div>
                <p className="text-text-muted text-xs">📍 {c.endereco || 'Endereço não definido'}</p>
                <p className="text-text-muted text-xs">
                  📅 {c.dia_semana || '-'} às {c.hora || '-'}
                </p>
                <p className="text-text-muted text-xs">
                  👥 <strong className="text-text-primary">{c.total_membros}</strong> membros ativos
                </p>
                <p className="text-text-muted text-xs">👤 Líder: {c.lider_nome || 'Não definido'}</p>
                {c.lider_2_nome && <p className="text-text-muted text-xs">👥 2º líder: {c.lider_2_nome}</p>}
                {c.lider_treinamento_nome && <p className="text-text-muted text-xs">📚 Em treinamento: {c.lider_treinamento_nome}</p>}
                {c.igreja_nome && <p className="text-text-muted text-xs">⛪ {c.igreja_nome}</p>}

                <div className="border-border mt-3 flex gap-2 border-t pt-3">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => abrirEdicao(c)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="border-danger-light text-danger flex-1" onClick={() => excluir(c)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar célula' : 'Nova célula'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Nome da célula</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Igreja</Label>
              <Select value={form.igreja_id} onValueChange={(v) => setForm({ ...form, igreja_id: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {igrejas.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Dia da semana</Label>
              <Select value={form.dia_semana} onValueChange={(v) => setForm({ ...form, dia_semana: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Horário</Label>
              <Input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Bairro</Label>
              <Input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Líder</Label>
              <Select value={form.lider_id} onValueChange={(v) => setForm({ ...form, lider_id: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {lideres.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">2º líder (opcional)</Label>
              <Select value={form.lider_id_2} onValueChange={(v) => setForm({ ...form, lider_id_2: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {lideres.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Líder em treinamento</Label>
              <Select value={form.lider_treinamento_id} onValueChange={(v) => setForm({ ...form, lider_treinamento_id: v ?? '' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {lideresTreinamento.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.nome}
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
    </div>
  )
}

function CardEstatistica({ icone, cor, valor, rotulo }: { icone: React.ReactNode; cor: string; valor: number | string; rotulo: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${cor}`}>{icone}</span>
        <div>
          <p className="text-text-primary text-xl font-bold">{valor}</p>
          <p className="text-text-muted text-xs">{rotulo}</p>
        </div>
      </CardContent>
    </Card>
  )
}
