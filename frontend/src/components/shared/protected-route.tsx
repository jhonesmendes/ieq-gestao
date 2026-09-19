import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { AdminLayout } from '@/layouts/admin-layout'
import { SimpleAppLayout } from '@/layouts/simple-app-layout'

/**
 * Exige sessão ativa e escolhe o layout certo pelo papel do usuário —
 * réplica do que index.php fazia no PHP original ($app_lider_simplificado
 * / $app_gestor_igreja_simplificado), agora resolvido no cliente. Cada
 * layout já renderiza seu próprio <Outlet /> para as rotas filhas.
 */
export function ProtectedRoute() {
  const { usuario, carregando, ehAppSimplificado } = useAuth()

  if (carregando) {
    return <div className="text-text-muted flex min-h-dvh items-center justify-center text-sm">Carregando…</div>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return ehAppSimplificado ? <SimpleAppLayout /> : <AdminLayout />
}

/** Tela inicial por papel — gestor_igreja cai na própria Igreja, todo o
 * resto (inclusive líder, com dados já escopados na própria célula pelo
 * backend) cai no Dashboard. */
export function useRotaInicial() {
  const { usuario } = useAuth()

  if (usuario?.funcao === 'gestor_igreja') return '/app/igreja/inicio'

  return '/dashboard'
}
