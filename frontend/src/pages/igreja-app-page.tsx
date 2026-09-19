import { useEffect, useState } from 'react'
import { api, type RespostaApi } from '@/lib/api'
import type { Igreja } from '@/types'
import { AbaResumoIgreja } from '@/pages/igrejas/aba-resumo-igreja'
import { AbaEventosIgreja } from '@/pages/igrejas/aba-eventos-igreja'
import { AbaPessoasIgreja } from '@/pages/igrejas/aba-pessoas-igreja'
import { Card, CardContent } from '@/components/ui/card'

type Aba = 'resumo' | 'eventos' | 'pessoas'

/**
 * App simplificado do gestor da igreja — reaproveita as mesmas 3 abas da
 * tela de Igrejas (admin), só que resolvendo a igreja automaticamente via
 * /api/minha-igreja em vez de um seletor manual (o gestor só gerencia uma).
 */
export function IgrejaAppPage({ aba }: { aba: Aba }) {
  const [igreja, setIgreja] = useState<Igreja | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api
      .get<RespostaApi<Igreja | null>>('/minha-igreja')
      .then(({ data }) => setIgreja(data.dados ?? null))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return <p className="text-text-muted text-sm">Carregando…</p>
  }

  if (!igreja) {
    return (
      <Card>
        <CardContent className="text-text-muted p-10 text-center text-sm">
          Nenhuma igreja vinculada à sua conta ainda. Fale com um administrador.
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-text-primary mb-4 text-base font-bold">⛪ {igreja.nome}</h2>
      {aba === 'resumo' && <AbaResumoIgreja igrejaId={igreja.id} />}
      {aba === 'eventos' && <AbaEventosIgreja igrejaId={igreja.id} />}
      {aba === 'pessoas' && <AbaPessoasIgreja igrejaId={igreja.id} />}
    </div>
  )
}
