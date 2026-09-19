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

/** Tela inicial por papel — líder/líder_treinamento caem em Presença, gestor_igreja
 * na própria Igreja, e todo o resto no Dashboard administrativo. */
export function useRotaInicial() {
  const { usuario } = useAuth()

  if (usuario?.funcao === 'gestor_igreja') return '/app/igreja/inicio'
  if (usuario?.funcao === 'lider' || usuario?.funcao === 'lider_treinamento') return '/presenca'

  return '/dashboard'
}
