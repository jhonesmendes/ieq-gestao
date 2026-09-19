import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { PessoaIgreja, TipoPessoaIgreja } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { formatarDataLocal, iniciais } from '@/lib/formatadores'

interface ConfigTipo {
  endpoint: string
  campoData: keyof PessoaIgreja
  rotulo: string
  rotuloSingular: string
  icone: string
  campoExtra?: { chave: keyof PessoaIgreja; rotulo: string }[]
}

const CONFIG: Record<TipoPessoaIgreja, ConfigTipo> = {
  visitantes: {
    endpoint: '/igrejas-visitantes',
    campoData: 'data_visita',
    rotulo: 'Visitantes',
    rotuloSingular: 'visitante',
    icone: '👥',
    campoExtra: [{ chave: 'telefone', rotulo: 'Telefone' }],
  },
  conversoes: {
    endpoint: '/igrejas-conversoes',
    campoData: 'data_conversao',
    rotulo: 'Aceitações de Jesus',
    rotuloSingular: 'conversão',
    icone: '✝️',
  },
  reconciliacao: {
    endpoint: '/igrejas-reconciliacao',
    campoData: 'data_reconciliacao',
    rotulo: 'Reconciliações',
    rotuloSingular: 'reconciliação',
    icone: '🤝',
  },
  batismos: {
    endpoint: '/igrejas-batismos',
    campoData: 'data_batismo',
    rotulo: 'Batismos',
    rotuloSingular: 'batismo',
    icone: '💧',
    campoExtra: [
      { chave: 'ministro', rotulo: 'Ministro/Pastor' },
      { chave: 'localizacao', rotulo: 'Localização' },
    ],
  },
}

const ABAS: TipoPessoaIgreja[] = ['visitantes', 'conversoes', 'reconciliacao', 'batismos']

export function AbaPessoasIgreja({ igrejaId }: { igrejaId: number }) {
  const [tipo, setTipo] = useState<TipoPessoaIgreja>('visitantes')
  const [lista, setLista] = useState<PessoaIgreja[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [obs, setObs] = useState('')
  const [extras, setExtras] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)

  const config = CONFIG[tipo]

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<PessoaIgreja[]>>(config.endpoint, { params: { id: igrejaId } })
      .then(({ data }) => setLista(data.dados ?? []))
      .catch(() => toast.error(`Não foi possível carregar ${config.rotulo.toLowerCase()}.`))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
    setFormAberto(false)
    setNome('')
    setObs('')
    setExtras({})
    setData(new Date().toISOString().slice(0, 10))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, igrejaId])

  async function salvar() {
    if (!nome.trim()) {
      toast.error('Informe o nome.')
      return
    }
    setSalvando(true)
    try {
      await apiMutate('post', config.endpoint, {
        igreja_id: igrejaId,
        nome,
        [config.campoData]: data,
        obs: obs || null,
        ...extras,
      })
      toast.success(`${config.rotuloSingular[0].toUpperCase() + config.rotuloSingular.slice(1)} registrado(a).`)
      setFormAberto(false)
      setNome('')
      setObs('')
      setExtras({})
      carregar()
    } catch {
      toast.error('Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(p: PessoaIgreja) {
    if (!confirm(`Excluir o registro de ${p.nome}?`)) return
    try {
      await apiMutate('delete', `${config.endpoint}/${p.id}`)
      setLista((atual) => atual.filter((x) => x.id !== p.id))
      toast.success('Registro excluído.')
    } catch {
      toast.error('Não foi possível excluir.')
    }
  }

  return (
    <div>
      <div className="bg-slate mb-4 flex gap-1 overflow-x-auto rounded-lg p-1">
        {ABAS.map((a) => (
          <button
            key={a}
            onClick={() => setTipo(a)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-xs font-bold whitespace-nowrap text-text-muted',
              tipo === a && 'bg-card text-primary-dark shadow-sm',
            )}
          >
            {CONFIG[a].icone} {CONFIG[a].rotulo}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-text-primary text-sm font-semibold">
          {config.icone} {config.rotulo} ({lista.length})
        </h4>
        <Button size="sm" onClick={() => setFormAberto((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> Novo registro
        </Button>
      </div>

      {formAberto && (
        <div className="border-border bg-slate mb-4 flex flex-col gap-3 rounded-lg border p-4">
          <div>
            <Label className="mb-1.5">Nome da pessoa</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5">Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          {(config.campoExtra ?? []).map((campo) => (
            <div key={String(campo.chave)}>
              <Label className="mb-1.5">{campo.rotulo}</Label>
              <Input
                value={extras[String(campo.chave)] ?? ''}
                onChange={(e) => setExtras((atual) => ({ ...atual, [String(campo.chave)]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <Label className="mb-1.5">Observações</Label>
            <Textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
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
      {!carregando && lista.length === 0 && <p className="text-text-muted py-8 text-center text-sm">Nenhum registro ainda.</p>}

      <ul className="flex flex-col gap-2">
        {lista.map((p) => (
          <li key={p.id} className="border-border flex items-center gap-3 rounded-lg border p-3">
            <span className="bg-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
              {iniciais(p.nome)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-text-primary truncate text-sm font-medium">{p.nome}</p>
              <p className="text-text-muted truncate text-xs">
                {formatarDataLocal((p[config.campoData] as string) ?? null)}
                {p.telefone ? ` · ${p.telefone}` : ''}
                {p.localizacao ? ` · ${p.localizacao}` : ''}
              </p>
            </div>
            <button onClick={() => excluir(p)} className="text-danger p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
