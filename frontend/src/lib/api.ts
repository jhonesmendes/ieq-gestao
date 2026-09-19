import axios from 'axios'

/**
 * Cliente HTTP para a API Laravel (Sanctum SPA, auth por cookie).
 * `withCredentials: true` é o que faz o navegador enviar/receber o
 * cookie de sessão — sem isso, cada requisição pareceria "deslogada".
 */
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

// Garante o cookie CSRF (XSRF-TOKEN) antes de qualquer POST/PUT/DELETE —
// o Sanctum lê esse cookie e compara com o header X-XSRF-TOKEN, que o
// axios já envia sozinho quando withXSRFToken está ligado.
axios.defaults.withXSRFToken = true
api.defaults.withXSRFToken = true

let cookiePronto: Promise<void> | null = null

export function garantirCookieCsrf(): Promise<void> {
  if (!cookiePronto) {
    cookiePronto = axios.get('/sanctum/csrf-cookie', { withCredentials: true }).then(() => undefined)
  }
  return cookiePronto
}

// Toda mutação passa por aqui primeiro, para nunca esquecer o cookie CSRF.
export async function apiMutate<T = unknown>(
  metodo: 'post' | 'put' | 'delete',
  url: string,
  dados?: unknown,
  config?: Parameters<typeof api.post>[2],
): Promise<T> {
  await garantirCookieCsrf()
  const resposta =
    metodo === 'delete' ? await api.delete<T>(url, config) : await api[metodo]<T>(url, dados, config)
  return resposta.data
}

export interface RespostaApi<T> {
  status: 'sucesso' | 'erro'
  dados?: T
  mensagem?: string
}
