import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import { Home, Users, Calendar, User, CheckSquare } from 'lucide-react'

/**
 * Layout simplificado (topo + rodapé com abas) — líder/líder_treinamento
 * e gestor_igreja. Substitui o sniffing de User-Agent do app mobile
 * (eh_app_mobile() no PHP original) por decisão client-side baseada no
 * papel do usuário logado: o app mobile só é usado por esses dois
 * papéis na prática, então não precisa de um sinal separado.
 */
const ABAS_LIDER = [
  { to: '/presenca', label: 'Início', icon: Home },
  { to: '/app/membros', label: 'Membros', icon: Users },
  { to: '/app/reunioes', label: 'Reuniões', icon: Calendar },
  { to: '/app/perfil', label: 'Perfil', icon: User },
]

const ABAS_GESTOR_IGREJA = [
  { to: '/app/igreja/inicio', label: 'Início', icon: Home },
  { to: '/app/igreja/eventos', label: 'Eventos', icon: Calendar },
  { to: '/app/igreja/pessoas', label: 'Pessoas', icon: CheckSquare },
  { to: '/app/perfil', label: 'Perfil', icon: User },
]

export function SimpleAppLayout() {
  const { usuario } = useAuth()
  if (!usuario) return null

  const abas = usuario.funcao === 'gestor_igreja' ? ABAS_GESTOR_IGREJA : ABAS_LIDER

  return (
    <div className="bg-slate mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <header className="bg-ink px-5 pt-[calc(16px+env(safe-area-inset-top))] pb-5 text-white">
        <p className="text-xs opacity-70">Olá,</p>
        <h1 className="text-xl font-bold">{usuario.nome}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-6">
        <Outlet />
      </main>

      <nav className="bg-card border-border sticky bottom-0 flex border-t px-1 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        {abas.map((aba) => (
          <NavLink
            key={aba.to}
            to={aba.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-1 text-[10.5px] font-semibold text-text-muted',
                isActive && 'text-primary',
              )
            }
          >
            <aba.icon className="h-[18px] w-[18px]" />
            {aba.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
