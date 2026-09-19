import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Usuario } from '@/types'
import { useAuth } from '@/context/auth-context'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { iniciais } from '@/lib/formatadores'

const FUNCOES = [
  { valor: 'admin', rotulo: '👑 Administrador' },
  { valor: 'pastor', rotulo: '✝️ Pastor' },
  { valor: 'supervisor', rotulo: '👔 Supervisor' },
  { valor: 'lider', rotulo: '⭐ Líder' },
  { valor: 'lider_treinamento', rotulo: '📚 Líder em treinamento' },
  { valor: 'gestor_igreja', rotulo: '⛪ Gestor da igreja' },
  { valor: 'membro', rotulo: '👤 Membro' },
]

// Módulos configuráveis manualmente — líder/líder_treinamento/gestor_igreja
// têm o próprio acesso forçado no backend (modulosPermitidos()), então o
// editor de permissões só faz diferença para pastor/supervisor/membro.
const MODULOS = [
  { valor: 'dashboard', rotulo: 'Dashboard' },
  { valor: 'celulas', rotulo: 'Células' },
  { valor: 'presenca', rotulo: 'Presença (+ membros/visitantes/galeria)' },
  { valor: 'eventos', rotulo: 'Eventos' },
  { valor: 'cursos', rotulo: 'Cursos' },
  { valor: 'igrejas', rotulo: 'Igrejas' },
  { valor: 'usuarios', rotulo: 'Usuários' },
  { valor: 'aprovacao_cadastros', rotulo: 'Aprovação de cadastros' },
  { valor: 'configuracoes', rotulo: 'Configurações' },
]

interface FormularioUsuario {
  id: number | null
  nome: string
  email: string
  senha: string
  telefone: string
  funcao: string
  permissoes: string[]
}

function formVazio(): FormularioUsuario {
  return { id: null, nome: '', email: '', senha: '', telefone: '', funcao: 'membro', permissoes: [] }
}

const CORES_FUNCAO: Record<string, string> = {
  admin: 'bg-primary-light text-primary-dark',
  pastor: 'bg-amber-light text-amber',
  supervisor: 'bg-info-light text-info',
  lider: 'bg-primary-light text-primary-dark',
  lider_treinamento: 'bg-amber-light text-amber',
  gestor_igreja: 'bg-violet-100 text-violet-700',
  membro: 'bg-slate text-text-muted',
}

export function UsuariosPage() {
  const { usuario: usuarioLogado } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormularioUsuario>(formVazio())
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<Usuario[]>>('/usuarios')
      .then(({ data }) => setUsuarios(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar os usuários.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  const listaFiltrada = usuarios.filter((u) => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return true
    return u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
  })

  function abrirNovo() {
    setForm(formVazio())
    setModalAberto(true)
  }

  function abrirEdicao(u: Usuario) {
    setForm({ id: u.id, nome: u.nome, email: u.email, senha: '', telefone: u.telefone ?? '', funcao: u.funcao, permissoes: u.permissoes ?? [] })
    setModalAberto(true)
  }

  function alternarModulo(modulo: string) {
    setForm((atual) => ({
      ...atual,
      permissoes: atual.permissoes.includes(modulo) ? atual.permissoes.filter((m) => m !== modulo) : [...atual.permissoes, modulo],
    }))
  }

  async function salvar() {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error('Informe nome e e-mail.')
      return
    }
    if (!form.id && form.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setSalvando(true)
    try {
      const dados: Record<string, unknown> = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || null,
        funcao: form.funcao,
        permissoes: form.permissoes,
      }
      if (form.senha) dados.senha = form.senha

      if (form.id) {
        await apiMutate('put', `/usuarios/${form.id}`, dados)
        toast.success('Usuário atualizado.')
      } else {
        await apiMutate('post', '/usuarios', dados)
        toast.success('Usuário criado.')
      }
      setModalAberto(false)
      carregar()
    } catch {
      toast.error('Não foi possível salvar o usuário.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(u: Usuario) {
    if (u.id === usuarioLogado?.id) {
      toast.error('Você não pode excluir sua própria conta.')
      return
    }
    if (!confirm(`Excluir o usuário "${u.nome}"?`)) return
    try {
      await apiMutate('delete', `/usuarios/${u.id}`)
      setUsuarios((atual) => atual.filter((x) => x.id !== u.id))
      toast.success('Usuário excluído.')
    } catch {
      toast.error('Não foi possível excluir o usuário.')
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Usuários"
        subtitulo="Controle de acesso e permissões do sistema"
        acoes={
          <Button onClick={abrirNovo}>
            <Plus className="mr-1 h-4 w-4" /> Novo usuário
          </Button>
        }
      />

      <Input placeholder="Buscar usuário…" value={busca} onChange={(e) => setBusca(e.target.value)} className="mb-4 max-w-xs" />

      <Card className="overflow-hidden py-0">
        {carregando && <p className="text-text-muted p-8 text-center text-sm">Carregando…</p>}
        {!carregando && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listaFiltrada.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                        {iniciais(u.nome)}
                      </span>
                      <div>
                        <p className="text-text-primary font-medium">{u.nome}</p>
                        <p className="text-text-muted text-xs">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={CORES_FUNCAO[u.funcao] ?? 'bg-slate text-text-muted'}>
                      {FUNCOES.find((f) => f.valor === u.funcao)?.rotulo ?? u.funcao}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-muted">{u.telefone || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => abrirEdicao(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {u.id !== usuarioLogado?.id && (
                      <Button size="sm" variant="ghost" className="text-danger" onClick={() => excluir(u)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Nome completo</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Função</Label>
              <Select value={form.funcao} onValueChange={(v) => setForm({ ...form, funcao: v ?? 'membro' })}>
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
            <div>
              <Label className="mb-1.5">Senha {form.id && '(deixe em branco para manter)'}</Label>
              <Input type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-2">Módulos liberados</Label>
              <div className="border-border grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2">
                {MODULOS.map((m) => (
                  <label key={m.valor} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.permissoes.includes(m.valor)} onChange={() => alternarModulo(m.valor)} />
                    {m.rotulo}
                  </label>
                ))}
              </div>
              {['admin', 'lider', 'lider_treinamento', 'gestor_igreja'].includes(form.funcao) && (
                <p className="text-text-muted mt-2 text-xs">
                  ℹ️ Essa função tem acesso {form.funcao === 'admin' ? 'total' : 'restrito ao próprio app'} independente do que for marcado acima.
                </p>
              )}
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
