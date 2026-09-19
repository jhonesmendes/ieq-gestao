import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { iniciais } from '@/lib/formatadores'

interface CadastroPendente {
  id: number
  nome: string
  email: string
  foto_url: string | null
  criado_em: string
}

const FUNCOES = [
  { valor: 'membro', rotulo: '👤 Membro' },
  { valor: 'lider', rotulo: '⭐ Líder' },
  { valor: 'lider_treinamento', rotulo: '📚 Líder em treinamento' },
  { valor: 'gestor_igreja', rotulo: '⛪ Gestor da igreja' },
  { valor: 'supervisor', rotulo: '👔 Supervisor' },
  { valor: 'pastor', rotulo: '✝️ Pastor' },
  { valor: 'admin', rotulo: '👑 Administrador' },
]

export function AprovacaoCadastrosPage() {
  const [pendentes, setPendentes] = useState<CadastroPendente[]>([])
  const [carregando, setCarregando] = useState(true)

  const [cadastroAprovando, setCadastroAprovando] = useState<CadastroPendente | null>(null)
  const [funcaoEscolhida, setFuncaoEscolhida] = useState('membro')

  const [cadastroRejeitando, setCadastroRejeitando] = useState<CadastroPendente | null>(null)
  const [motivo, setMotivo] = useState('')

  const [processando, setProcessando] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<CadastroPendente[]>>('/cadastros-pendentes')
      .then(({ data }) => setPendentes(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar os cadastros pendentes.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  async function confirmarAprovacao() {
    if (!cadastroAprovando) return
    setProcessando(true)
    try {
      await apiMutate('post', `/cadastros-pendentes/${cadastroAprovando.id}/aprovar`, { funcao: funcaoEscolhida })
      toast.success(`${cadastroAprovando.nome} aprovado(a) como ${funcaoEscolhida}.`)
      setCadastroAprovando(null)
      setFuncaoEscolhida('membro')
      carregar()
    } catch {
      toast.error('Não foi possível aprovar o cadastro.')
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarRejeicao() {
    if (!cadastroRejeitando) return
    setProcessando(true)
    try {
      await apiMutate('post', `/cadastros-pendentes/${cadastroRejeitando.id}/rejeitar`, { motivo: motivo || null })
      toast.success(`Cadastro de ${cadastroRejeitando.nome} rejeitado.`)
      setCadastroRejeitando(null)
      setMotivo('')
      carregar()
    } catch {
      toast.error('Não foi possível rejeitar o cadastro.')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div>
      <PageHeader titulo="Aprovação de Cadastros" subtitulo="Gerencie solicitações de cadastro via Google" />

      {carregando && <p className="text-text-muted text-sm">Carregando…</p>}
      {!carregando && pendentes.length === 0 && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">🎉 Nenhum cadastro aguardando aprovação.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pendentes.map((c) => (
          <Card key={c.id}>
            <CardContent>
              <div className="mb-3 flex items-center gap-3">
                {c.foto_url ? (
                  <img src={c.foto_url} alt={c.nome} className="h-11 w-11 flex-shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="bg-primary flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                    {iniciais(c.nome)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-text-primary truncate text-sm font-semibold">{c.nome}</p>
                  <p className="text-text-muted truncate text-xs">{c.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setCadastroAprovando(c)
                    setFuncaoEscolhida('membro')
                  }}
                >
                  <Check className="mr-1 h-3.5 w-3.5" /> Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-danger-light text-danger flex-1"
                  onClick={() => {
                    setCadastroRejeitando(c)
                    setMotivo('')
                  }}
                >
                  <X className="mr-1 h-3.5 w-3.5" /> Rejeitar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!cadastroAprovando} onOpenChange={(aberto) => !aberto && setCadastroAprovando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar {cadastroAprovando?.nome}</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-text-muted mb-3 text-sm">Escolha a função que esse usuário terá no sistema:</p>
            <Select value={funcaoEscolhida} onValueChange={(v) => setFuncaoEscolhida(v ?? 'membro')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUNCOES.map((f) => (
                  <SelectItem key={f.valor} value={f.valor}>
                    {f.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCadastroAprovando(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAprovacao} disabled={processando}>
              {processando ? 'Aprovando…' : 'Confirmar aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cadastroRejeitando} onOpenChange={(aberto) => !aberto && setCadastroRejeitando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar {cadastroRejeitando?.nome}</DialogTitle>
          </DialogHeader>
          <div>
            <Textarea placeholder="Motivo (opcional)" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCadastroRejeitando(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarRejeicao} disabled={processando}>
              {processando ? 'Rejeitando…' : 'Confirmar rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
