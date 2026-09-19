import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Membro, Visitante } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Camera, Check, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { iniciais } from '@/lib/formatadores'

interface VisitanteNovo {
  chaveLocal: string
  nome: string
}

export function AbaPresenca({ celulaId, data }: { celulaId: string; data: string }) {
  const [membros, setMembros] = useState<Membro[]>([])
  const [visitantes, setVisitantes] = useState<Visitante[]>([])
  const [presencas, setPresencas] = useState<Record<number, boolean>>({})
  const [visitantesNovos, setVisitantesNovos] = useState<VisitanteNovo[]>([])
  const [nomeVisitanteNovo, setNomeVisitanteNovo] = useState('')

  const [observacoes, setObservacoes] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)

  const [carregandoMembros, setCarregandoMembros] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setCarregandoMembros(true)
    Promise.all([
      api.get<RespostaApi<Membro[]>>('/membros', { params: { celula_id: celulaId } }),
      api.get<RespostaApi<Visitante[]>>('/visitantes', { params: { celula_id: celulaId } }),
    ])
      .then(([respMembros, respVisitantes]) => {
        // Só membros ativos entram no lançamento de presença — inativo não
        // precisa ser marcado presente/faltou toda reunião.
        const listaMembros = (respMembros.data.dados ?? []).filter((m) => m.status === 'ativo')
        setMembros(listaMembros)
        setVisitantes(respVisitantes.data.dados ?? [])
        setPresencas(Object.fromEntries(listaMembros.map((m) => [m.id, true])))
      })
      .catch(() => toast.error('Não foi possível carregar os membros. Verifique a conexão.'))
      .finally(() => setCarregandoMembros(false))

    setVisitantesNovos([])
    setObservacoes('')
    setFoto(null)
    setPreviewFoto(null)
  }, [celulaId])

  const visitantesDoDia = useMemo(() => visitantes.filter((v) => v.data_visita === data), [visitantes, data])

  const presentes = Object.values(presencas).filter(Boolean).length
  const faltaram = membros.length - presentes
  const percentual = membros.length ? Math.round((presentes / membros.length) * 100) : 0

  function marcarTodos(valor: boolean) {
    setPresencas(Object.fromEntries(membros.map((m) => [m.id, valor])))
  }

  function inverter() {
    setPresencas((atual) => Object.fromEntries(membros.map((m) => [m.id, !atual[m.id]])))
  }

  function adicionarVisitanteNovo() {
    const nome = nomeVisitanteNovo.trim()
    if (!nome) {
      toast.error('Informe o nome do visitante')
      return
    }
    setVisitantesNovos((atual) => [...atual, { chaveLocal: crypto.randomUUID(), nome }])
    setNomeVisitanteNovo('')
  }

  async function removerVisitanteExistente(id: number) {
    if (!confirm('Remover este visitante do lançamento de hoje?')) return
    try {
      await apiMutate('delete', `/visitantes/${id}`)
      setVisitantes((atual) => atual.filter((v) => v.id !== id))
    } catch {
      toast.error('Falha ao remover visitante.')
    }
  }

  function aoEscolherFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(arquivo.type)) {
      toast.error('Apenas JPG, PNG ou GIF são permitidos.')
      return
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 5MB.')
      return
    }

    setFoto(arquivo)
    setPreviewFoto(URL.createObjectURL(arquivo))
  }

  async function salvarReuniao() {
    setSalvando(true)
    try {
      const formData = new FormData()
      formData.append('celula_id', celulaId)
      formData.append('data', data)
      formData.append('observacoes', observacoes)
      membros.forEach((m, i) => {
        formData.append(`presencas[${i}][membro_id]`, String(m.id))
        formData.append(`presencas[${i}][presente]`, presencas[m.id] ? '1' : '0')
      })
      visitantesNovos.forEach((v, i) => formData.append(`visitantes_novos[${i}]`, v.nome))
      if (foto) formData.append('foto', foto)

      const resposta = await apiMutate<
        RespostaApi<{ presentes: number; ausentes: number; visitantes_salvos: number; foto_salva: boolean }>
      >('post', '/presenca/salvar-reuniao', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const resumo = resposta.dados!
      toast.success(
        `Reunião salva: ${resumo.presentes} presente(s), ${resumo.ausentes} falta(s)` +
          (resumo.visitantes_salvos > 0 ? `, ${resumo.visitantes_salvos} visitante(s)` : ''),
      )

      const respVisitantes = await api.get<RespostaApi<Visitante[]>>('/visitantes', { params: { celula_id: celulaId } })
      setVisitantes(respVisitantes.data.dados ?? [])
      setVisitantesNovos([])
    } catch {
      toast.error('Não foi possível salvar a reunião. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
      {/* Coluna principal: lista de presença */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-slate border-border gap-1 border-b !py-5">
          <CardTitle>Presença da reunião</CardTitle>
          <p className="text-text-muted text-xs">Toque em Presente/Faltou — tudo é salvo de uma vez no botão abaixo</p>
        </CardHeader>

        {membros.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            <button
              onClick={() => marcarTodos(true)}
              className="border-primary-light text-primary-dark flex-1 rounded-md border px-3 py-2 text-xs font-semibold whitespace-nowrap"
            >
              ✓ Todos presentes
            </button>
            <button
              onClick={() => marcarTodos(false)}
              className="border-danger-light text-danger flex-1 rounded-md border px-3 py-2 text-xs font-semibold whitespace-nowrap"
            >
              ✗ Todos faltaram
            </button>
            <button
              onClick={inverter}
              className="border-border text-text-muted flex-1 rounded-md border px-3 py-2 text-xs font-semibold whitespace-nowrap"
            >
              <RotateCcw className="mr-1 inline h-3 w-3" /> Inverter
            </button>
          </div>
        )}

        <CardContent className="p-5">
          {carregandoMembros && <p className="text-text-muted py-10 text-center text-sm">Carregando membros…</p>}

          {!carregandoMembros && membros.length === 0 && visitantesDoDia.length === 0 && (
            <p className="text-text-muted py-10 text-center text-sm">Nenhum membro cadastrado nesta célula</p>
          )}

          <ul className="flex flex-col gap-2.5">
            {membros.map((m) => (
              <li key={m.id} className="border-border flex items-center gap-3 rounded-lg border p-3">
                <span className="bg-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {iniciais(m.nome)}
                </span>
                <span className="text-text-primary flex-1 text-sm font-medium">{m.nome}</span>
                <div className="border-border inline-flex overflow-hidden rounded-md border">
                  <button
                    onClick={() => setPresencas((a) => ({ ...a, [m.id]: true }))}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold text-text-muted opacity-40',
                      presencas[m.id] && 'bg-primary-light text-primary-dark opacity-100',
                    )}
                  >
                    Presente
                  </button>
                  <button
                    onClick={() => setPresencas((a) => ({ ...a, [m.id]: false }))}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold text-text-muted opacity-40',
                      presencas[m.id] === false && 'bg-danger-light text-danger opacity-100',
                    )}
                  >
                    Faltou
                  </button>
                </div>
              </li>
            ))}

            {visitantesDoDia.map((v) => (
              <li key={v.id} className="flex items-center gap-3 rounded-lg border border-blue-100 bg-[#F8FBFF] p-3">
                <span className="bg-amber flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {iniciais(v.nome)}
                </span>
                <div className="flex-1">
                  <span className="text-text-primary block text-sm font-medium">{v.nome}</span>
                  <span className="text-info bg-info-light rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">Visitante</span>
                </div>
                <button onClick={() => removerVisitanteExistente(v.id)} className="text-danger p-1 text-xs font-semibold">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}

            {visitantesNovos.map((v, i) => (
              <li key={v.chaveLocal} className="flex items-center gap-3 rounded-lg border border-blue-100 bg-[#F8FBFF] p-3">
                <span className="bg-amber flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {iniciais(v.nome)}
                </span>
                <div className="flex-1">
                  <span className="text-text-primary block text-sm font-medium">{v.nome}</span>
                  <span className="text-info bg-info-light rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    Visitante (não salvo)
                  </span>
                </div>
                <button
                  onClick={() => setVisitantesNovos((atual) => atual.filter((_, idx) => idx !== i))}
                  className="text-danger p-1 text-xs font-semibold"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {membros.length > 0 && (
            <div className="border-border mt-4 border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do visitante"
                  value={nomeVisitanteNovo}
                  onChange={(e) => setNomeVisitanteNovo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionarVisitanteNovo()}
                />
                <Button type="button" variant="secondary" onClick={adicionarVisitanteNovo}>
                  + Visitante
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coluna lateral: resumo, observações e foto */}
      <div className="flex flex-col gap-5">
        {membros.length > 0 && (
          <Card>
            <CardContent className="text-center">
              <h3 className="text-text-primary mb-3 text-left text-sm font-semibold">Resumo da reunião</h3>
              <p className="text-primary text-4xl font-extrabold">{percentual}%</p>
              <p className="text-text-muted mb-4 text-sm">presença hoje</p>
              <div className="mb-4 flex gap-3">
                <div className="bg-primary-light flex-1 rounded-lg py-3">
                  <strong className="text-primary block text-xl">{presentes}</strong>
                  <span className="text-primary-dark text-xs">presentes</span>
                </div>
                <div className="bg-danger-light flex-1 rounded-lg py-3">
                  <strong className="text-danger block text-xl">{faltaram}</strong>
                  <span className="text-danger text-xs">faltaram</span>
                </div>
              </div>
              <div className="text-left">
                <Label className="mb-1.5">Observações</Label>
                <Textarea
                  placeholder="Tema, destaques da reunião…"
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {membros.length > 0 && (
          <Card>
            <CardContent>
              <h3 className="text-text-primary mb-3 text-sm font-semibold">📸 Foto da célula</h3>
              <label
                htmlFor="foto-reuniao"
                className="border-border bg-slate mb-3 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
              >
                {previewFoto ? (
                  <img src={previewFoto} alt="Prévia da foto da reunião" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-text-muted flex flex-col items-center gap-2 text-sm">
                    <Camera className="h-8 w-8" />
                    Adicionar foto da reunião
                  </span>
                )}
              </label>
              <input id="foto-reuniao" type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={aoEscolherFoto} />
              <p className="text-text-muted text-center text-xs">JPG, PNG ou GIF · máx. 5MB</p>
            </CardContent>
          </Card>
        )}

        {membros.length > 0 && (
          <Card>
            <CardContent>
              <Button onClick={salvarReuniao} disabled={salvando} className="w-full py-6 text-base font-bold">
                {salvando ? (
                  'Salvando…'
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Salvar reunião de hoje
                  </>
                )}
              </Button>
              <p className="text-text-muted mt-2 text-center text-xs">Presença, visitantes e foto são enviados juntos, de uma vez</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
