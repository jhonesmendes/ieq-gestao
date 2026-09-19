import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, apiMutate, garantirCookieCsrf, type RespostaApi } from '@/lib/api'

export type Funcao =
  | 'admin'
  | 'pastor'
  | 'supervisor'
  | 'lider'
  | 'lider_treinamento'
  | 'gestor_igreja'
  | 'membro'

export interface Usuario {
  id: number
  nome: string
  email: string
  funcao: Funcao
  foto_url: string | null
  modulos_permitidos: string[]
}

interface AuthContextValor {
  usuario: Usuario | null
  carregando: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  registrar: (dados: { nome: string; email: string; senha: string; telefone?: string }) => Promise<void>
  /** true para líder/líder_treinamento/gestor_igreja — layout simplificado (app mobile). */
  ehAppSimplificado: boolean
}

const AuthContext = createContext<AuthContextValor | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregarUsuarioLogado = useCallback(async () => {
    try {
      const { data } = await api.get<RespostaApi<Usuario>>('/me')
      setUsuario(data.dados ?? null)
    } catch {
      setUsuario(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarUsuarioLogado()
  }, [carregarUsuarioLogado])

  const login = useCallback(async (email: string, senha: string) => {
    await garantirCookieCsrf()
    const dados = await apiMutate<RespostaApi<Usuario>>('post', '/login', { email, senha })
    setUsuario(dados.dados ?? null)
  }, [])

  const registrar = useCallback(
    async (payload: { nome: string; email: string; senha: string; telefone?: string }) => {
      const dados = await apiMutate<RespostaApi<Usuario>>('post', '/registrar', payload)
      setUsuario(dados.dados ?? null)
    },
    [],
  )

  const logout = useCallback(async () => {
    await apiMutate('post', '/logout')
    setUsuario(null)
  }, [])

  const ehAppSimplificado = usuario
    ? ['lider', 'lider_treinamento', 'gestor_igreja'].includes(usuario.funcao)
    : false

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, registrar, ehAppSimplificado }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return contexto
}
