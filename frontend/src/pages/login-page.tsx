import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AxiosError } from 'axios'

export function LoginPage() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) {
    return <Navigate to="/" replace />
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await login(email, senha)
      navigate('/')
    } catch (erroCapturado) {
      if (erroCapturado instanceof AxiosError && !erroCapturado.response) {
        // A requisição nem chegou a ter resposta — o backend Laravel
        // provavelmente não está rodando (ou está em outra porta).
        setErro('Não foi possível conectar ao servidor. Verifique se o backend (php artisan serve) está rodando.')
      } else if (erroCapturado instanceof AxiosError) {
        const mensagem =
          erroCapturado.response?.data?.errors?.email?.[0] ?? erroCapturado.response?.data?.message
        setErro(mensagem ?? 'Não foi possível entrar. Verifique seus dados.')
      } else {
        setErro('Não foi possível entrar. Verifique seus dados.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-ink flex min-h-dvh items-center justify-center px-4 py-6">
      <div className="w-full max-w-[380px] rounded-xl bg-white px-7 py-8 shadow-2xl">
        <div className="mb-7 text-center">
          <span className="bg-primary mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-extrabold text-white">
            IEQ
          </span>
          <h1 className="text-text-primary text-xl font-extrabold">Bem-vindo de volta</h1>
          <p className="text-text-secondary mt-1 text-sm">Gestão de células e membros</p>
        </div>

        {erro && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">{erro}</p>
        )}

        <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="-mt-1 text-right">
            <a href="/recuperar-senha" className="text-primary-dark text-xs font-bold hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          <Button type="submit" disabled={enviando} className="mt-1">
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="text-text-secondary mt-5 text-center text-xs">
          Não tem conta?{' '}
          <a href="/registro" className="text-primary-dark font-bold hover:underline">
            Registre-se aqui
          </a>
        </p>
      </div>
    </div>
  )
}
