import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/auth-context'
import { ProtectedRoute, useRotaInicial } from '@/components/shared/protected-route'
import { LoginPage } from '@/pages/login-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { PresencaPage } from '@/pages/presenca-page'
import { PerfilPage } from '@/pages/perfil-page'
import { CelulasPage } from '@/pages/celulas-page'
import { EventosPage } from '@/pages/eventos-page'
import { CursosPage } from '@/pages/cursos-page'
import { IgrejasPage } from '@/pages/igrejas-page'
import { IgrejaAppPage } from '@/pages/igreja-app-page'
import { CelulaEventosPage } from '@/pages/celula-eventos-page'
import { UsuariosPage } from '@/pages/usuarios-page'
import { AprovacaoCadastrosPage } from '@/pages/aprovacao-cadastros-page'
import { ConfiguracoesPage } from '@/pages/configuracoes-page'
import { Toaster } from '@/components/ui/sonner'

/** Redireciona "/" para a tela inicial certa conforme o papel do usuário logado. */
function RotaInicial() {
  return <Navigate to={useRotaInicial()} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/celulas" element={<CelulasPage />} />
            <Route path="/presenca" element={<PresencaPage />} />
            {/* Membros, Visitantes e Galeria agora são abas dentro de Presença. */}
            <Route path="/membros" element={<Navigate to="/presenca" replace />} />
            <Route path="/visitantes" element={<Navigate to="/presenca" replace />} />
            <Route path="/galeria" element={<Navigate to="/presenca" replace />} />
            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/igrejas" element={<IgrejasPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/aprovacao-cadastros" element={<AprovacaoCadastrosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />

            {/* App simplificado do líder — mesma tela de Presença, abrindo
                em abas diferentes por padrão conforme o item do menu. */}
            <Route path="/app/membros" element={<PresencaPage abaInicial="membros" />} />
            {/* Galeria de fotos + agenda da igreja continuam acessíveis
                dentro de Presença & Célula (aba Galeria), só não têm mais
                atalho direto no menu — o menu agora abre a agenda própria
                da célula. */}
            <Route path="/app/eventos" element={<CelulaEventosPage />} />
            <Route path="/app/perfil" element={<PerfilPage />} />

            {/* App simplificado do gestor da igreja — reaproveita as abas
                da tela de Igrejas, resolvendo "minha igreja" sozinho. */}
            <Route path="/app/igreja/inicio" element={<IgrejaAppPage aba="resumo" />} />
            <Route path="/app/igreja/eventos" element={<IgrejaAppPage aba="eventos" />} />
            <Route path="/app/igreja/pessoas" element={<IgrejaAppPage aba="pessoas" />} />

            <Route path="/" element={<RotaInicial />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}
