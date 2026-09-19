import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { api, type RespostaApi } from '@/lib/api'
import type { DashboardDados } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { iniciais, formatarDataLocal } from '@/lib/formatadores'
import { Users, Home, TrendingUp, Star, Calendar, CheckSquare } from 'lucide-react'

function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardPage() {
  const { usuario } = useAuth()
  const [dados, setDados] = useState<DashboardDados | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api
      .get<RespostaApi<DashboardDados>>('/dashboard')
      .then(({ data }) => setDados(data.dados ?? null))
      .finally(() => setCarregando(false))
  }, [])

  const ehLider = usuario?.funcao === 'lider' || usuario?.funcao === 'lider_treinamento'

  return (
    <div>
      <PageHeader titulo="Dashboard" subtitulo={`${saudacao()}, ${usuario?.nome ?? ''}`} />

      {ehLider && (
        <Link to="/presenca" className="mb-6 block">
          <Button className="w-full py-6 text-base font-bold">
            <CheckSquare className="mr-1 h-4 w-4" /> Lançar presença de hoje
          </Button>
        </Link>
      )}

      {carregando && <p className="text-text-muted text-sm">Carregando…</p>}

      {!carregando && dados && !dados.pode_ver_agregados && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">
            Bem-vindo(a)! Use o menu para acessar suas funções.
          </CardContent>
        </Card>
      )}

      {!carregando && dados?.pode_ver_agregados && (
        <div className="flex flex-col gap-6">
          {/* Cards de estatística */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <CardEstatistica icone={<Users className="h-5 w-5" />} cor="success" valor={dados.total_membros ?? 0} rotulo="Membros ativos" />
            <CardEstatistica icone={<Home className="h-5 w-5" />} cor="info" valor={dados.total_celulas ?? 0} rotulo="Células ativas" />
            <CardEstatistica
              icone={<TrendingUp className="h-5 w-5" />}
              cor="amber"
              valor={dados.media_presenca != null ? `${dados.media_presenca}%` : '—'}
              rotulo="Presença média (30 dias)"
            />
            <CardEstatistica icone={<Star className="h-5 w-5" />} cor="violet" valor={dados.total_lideres ?? 0} rotulo="Líderes" />
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {/* Membros recentes */}
            <Card>
              <CardContent>
                <h3 className="text-text-primary mb-3 text-sm font-semibold">👥 Membros recentes</h3>
                {(dados.membros_recentes ?? []).length === 0 && (
                  <p className="text-text-muted py-6 text-center text-sm">Nenhum membro registrado ainda</p>
                )}
                <ul className="flex flex-col gap-2.5">
                  {(dados.membros_recentes ?? []).map((m, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="bg-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                        {iniciais(m.nome ?? '??')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-text-primary truncate text-sm font-medium">{m.nome}</p>
                        <p className="text-text-muted truncate text-xs">{m.telefone || 'Sem telefone'}</p>
                      </div>
                      <span className="bg-primary-light text-primary-dark rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize">
                        {m.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Presença semanal */}
            <Card>
              <CardContent>
                <h3 className="text-text-primary mb-3 text-sm font-semibold">
                  📈 Presença — últimas {(dados.presenca_semanal ?? []).length} semanas
                </h3>
                <div className="flex h-40 items-end justify-between gap-2">
                  {(dados.presenca_semanal ?? []).map((s, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                      <div className="flex w-full flex-1 items-end">
                        <div className="bg-primary w-full rounded-t" style={{ height: `${Math.max(4, s.pct)}%` }} title={`${s.pct}%`} />
                      </div>
                      <span className="text-text-primary text-xs font-bold">{s.total > 0 ? `${s.pct}%` : '—'}</span>
                      <span className="text-text-muted text-[10px]">{s.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Próximos eventos */}
            <Card>
              <CardContent>
                <h3 className="text-text-primary mb-3 text-sm font-semibold">📅 Próximos eventos</h3>
                {(dados.proximos_eventos ?? []).length === 0 && (
                  <p className="text-text-muted py-6 text-center text-sm">Nenhum evento agendado</p>
                )}
                <ul className="flex flex-col gap-2.5">
                  {(dados.proximos_eventos ?? []).map((e) => (
                    <li key={e.id} className="flex items-center gap-3">
                      <span className="bg-amber-light text-amber flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-text-primary truncate text-sm font-medium">{e.nome}</p>
                        <p className="text-text-muted truncate text-xs">
                          {formatarDataLocal(e.data_evento)}
                          {e.localizacao ? ` · ${e.localizacao}` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Células em destaque */}
            <Card>
              <CardContent>
                <h3 className="text-text-primary mb-3 text-sm font-semibold">🏠 Células em destaque</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(dados.celulas_destaque ?? []).map((c, i) => (
                    <div
                      key={c.id}
                      className="border-border bg-slate rounded-lg border-t-4 p-3"
                      style={{ borderTopColor: ['#059669', '#2563EB', '#D97706', '#8B5CF6'][i % 4] }}
                    >
                      <p className="text-text-primary text-sm font-bold">{c.nome}</p>
                      <p className="text-text-muted text-xs">👤 {c.lider}</p>
                      {c.dia_semana && (
                        <p className="text-text-muted text-xs">
                          🕘 {c.dia_semana} {c.hora ? `· ${c.hora}` : ''}
                        </p>
                      )}
                      <div className="border-border mt-2 flex justify-between border-t pt-2 text-xs">
                        <span className="text-text-muted">{c.total_membros} membro(s)</span>
                        {c.presenca_pct != null && <span className="text-primary-dark font-bold">{c.presenca_pct}% presença</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function CardEstatistica({
  icone,
  cor,
  valor,
  rotulo,
}: {
  icone: React.ReactNode
  cor: 'success' | 'info' | 'amber' | 'violet'
  valor: string | number
  rotulo: string
}) {
  const cores: Record<string, string> = {
    success: 'bg-primary-light text-primary',
    info: 'bg-info-light text-info',
    amber: 'bg-amber-light text-amber',
    violet: 'bg-violet-100 text-violet-600',
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${cores[cor]}`}>{icone}</span>
        <div>
          <p className="text-text-primary text-xl font-bold">{valor}</p>
          <p className="text-text-muted text-xs">{rotulo}</p>
        </div>
      </CardContent>
    </Card>
  )
}
