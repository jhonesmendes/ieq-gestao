import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Home,
  CheckSquare,
  Calendar,
  GraduationCap,
  Church,
  ShieldCheck,
  Unlock,
  Settings,
  LogOut,
} from 'lucide-react'

interface ItemNav {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  modulo: string
}

const NAV_PRINCIPAL: ItemNav[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, modulo: 'dashboard' },
  { to: '/celulas', label: 'Células', icon: Home, modulo: 'celulas' },
  // Membros, Visitantes e Galeria viraram abas dentro de Presença —
  // não têm mais item próprio no menu.
  { to: '/presenca', label: 'Presença', icon: CheckSquare, modulo: 'presenca' },
]

const NAV_GESTAO: ItemNav[] = [
  { to: '/eventos', label: 'Eventos', icon: Calendar, modulo: 'eventos' },
  { to: '/cursos', label: 'Cursos', icon: GraduationCap, modulo: 'cursos' },
  { to: '/igrejas', label: 'Igrejas', icon: Church, modulo: 'igrejas' },
]

const NAV_SISTEMA: ItemNav[] = [
  { to: '/usuarios', label: 'Usuários', icon: ShieldCheck, modulo: 'usuarios' },
  { to: '/aprovacao-cadastros', label: 'Aprovação', icon: Unlock, modulo: 'aprovacao_cadastros' },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, modulo: 'configuracoes' },
]

function podeVer(modulosPermitidos: string[], modulo: string) {
  return modulosPermitidos.includes('*') || modulosPermitidos.includes(modulo)
}

function SecaoNav({ titulo, itens, modulosPermitidos }: { titulo: string; itens: ItemNav[]; modulosPermitidos: string[] }) {
  const visiveis = itens.filter((item) => podeVer(modulosPermitidos, item.modulo))
  if (visiveis.length === 0) return null

  return (
    <div className="mb-6">
      <p className="mb-2 px-4 text-xs font-semibold tracking-wide text-white/40 uppercase">{titulo}</p>
      <ul className="flex flex-col gap-1">
        {visiveis.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md border-l-3 border-transparent px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white',
                  isActive && 'border-primary bg-primary/18 text-white',
                )
              }
            >
              <item.icon className="h-[1.1rem] w-[1.1rem]" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sidebar() {
  const { usuario, logout } = useAuth()
  if (!usuario) return null

  const iniciais = usuario.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <aside className="bg-ink flex w-sidebar flex-shrink-0 flex-col text-white">
      <div className="flex h-[70px] items-center gap-2 border-b border-white/5 bg-black/20 px-4">
        <span className="bg-primary flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold">
          IEQ
        </span>
        <h1 className="text-base font-bold tracking-wide">IEQ Gestão</h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <SecaoNav titulo="Principal" itens={NAV_PRINCIPAL} modulosPermitidos={usuario.modulos_permitidos} />
        <SecaoNav titulo="Gestão" itens={NAV_GESTAO} modulosPermitidos={usuario.modulos_permitidos} />
        <SecaoNav titulo="Sistema" itens={NAV_SISTEMA} modulosPermitidos={usuario.modulos_permitidos} />
      </nav>

      <div className="border-t border-white/5 bg-black/20 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
          <span className="bg-primary flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-white/20 text-sm font-bold">
            {iniciais}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{usuario.nome}</p>
            <p className="truncate text-xs text-slate-400 capitalize">{usuario.funcao.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
