import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/auth-context'
import { apiMutate } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { iniciais } from '@/lib/formatadores'

export function ConfiguracoesPage() {
  const { usuario } = useAuth()
  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function alterarSenha(evento: FormEvent) {
    evento.preventDefault()

    if (senhaNova.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (senhaNova !== confirmacao) {
      toast.error('A confirmação não bate com a nova senha.')
      return
    }

    setSalvando(true)
    try {
      await apiMutate('post', '/usuarios/alterar-senha', { senha_atual: senhaAtual, senha_nova: senhaNova })
      toast.success('Senha alterada com sucesso.')
      setSenhaAtual('')
      setSenhaNova('')
      setConfirmacao('')
    } catch (erro) {
      const mensagem = erro instanceof AxiosError ? erro.response?.data?.errors?.senha_atual?.[0] : null
      toast.error(mensagem ?? 'Não foi possível alterar a senha.')
    } finally {
      setSalvando(false)
    }
  }

  if (!usuario) return null

  return (
    <div>
      <PageHeader titulo="Configurações" subtitulo="Gerencie suas preferências e configurações da igreja" />

      <Tabs defaultValue="perfil">
        <TabsList className="mb-5">
          <TabsTrigger value="perfil">👤 Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">🔒 Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card className="max-w-lg">
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <span className="bg-primary flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
                  {iniciais(usuario.nome)}
                </span>
                <div>
                  <p className="text-text-primary text-base font-semibold">{usuario.nome}</p>
                  <p className="text-text-muted text-sm">{usuario.email}</p>
                </div>
              </div>
              <p className="text-text-muted text-xs">
                Função: <span className="text-text-primary font-medium capitalize">{usuario.funcao.replace('_', ' ')}</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card className="max-w-lg">
            <CardContent>
              <h3 className="text-text-primary mb-1 text-sm font-semibold">Alterar senha</h3>
              <p className="text-text-muted mb-4 text-xs">Mantenha sua conta segura com uma senha forte.</p>
              <form onSubmit={alterarSenha} className="flex flex-col gap-3">
                <div>
                  <Label className="mb-1.5">Senha atual</Label>
                  <Input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
                </div>
                <div>
                  <Label className="mb-1.5">Nova senha</Label>
                  <Input type="password" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <Label className="mb-1.5">Confirmar nova senha</Label>
                  <Input type="password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" disabled={salvando} className="mt-2">
                  {salvando ? 'Salvando…' : 'Alterar senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
