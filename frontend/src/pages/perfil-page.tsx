import { useAuth } from '@/context/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { iniciais } from '@/lib/formatadores'
import { useNavigate } from 'react-router-dom'

const ROTULOS_FUNCAO: Record<string, string> = {
  admin: 'Administrador',
  pastor: 'Pastor',
  supervisor: 'Supervisor',
  lider: 'Líder de célula',
  lider_treinamento: 'Líder em treinamento',
  gestor_igreja: 'Gestor da igreja',
  membro: 'Membro',
}

export function PerfilPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  if (!usuario) return null

  async function sair() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center gap-4">
          <span className="bg-primary flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
            {iniciais(usuario.nome)}
          </span>
          <div>
            <p className="text-text-primary text-base font-semibold">{usuario.nome}</p>
            <p className="text-text-muted text-sm">{usuario.email}</p>
            <p className="text-text-muted text-xs">{ROTULOS_FUNCAO[usuario.funcao] ?? usuario.funcao}</p>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={sair} className="border-danger-light text-danger w-full py-6">
        <LogOut className="mr-2 h-4 w-4" /> Sair do aplicativo
      </Button>
    </div>
  )
}
