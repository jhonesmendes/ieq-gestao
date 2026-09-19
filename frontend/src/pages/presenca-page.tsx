import { useEffect, useState } from 'react'
import { api, type RespostaApi } from '@/lib/api'
import type { Celula } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AbaPresenca } from '@/pages/presenca/aba-presenca'
import { AbaMembros } from '@/pages/presenca/aba-membros'
import { AbaVisitantes } from '@/pages/presenca/aba-visitantes'
import { AbaGaleria } from '@/pages/presenca/aba-galeria'

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Tela única de gestão da célula — junta o que antes eram 4 telas
 * separadas (Presença, Membros, Visitantes, Galeria) em abas, sempre no
 * contexto da célula selecionada. Decisão explícita do usuário: uma só
 * tela ao invés de navegação espalhada.
 */
type AbaId = 'presenca' | 'membros' | 'visitantes' | 'galeria'

export function PresencaPage({ abaInicial = 'presenca' }: { abaInicial?: AbaId }) {
  const [celulas, setCelulas] = useState<Celula[]>([])
  const [celulaId, setCelulaId] = useState('')
  const [data, setData] = useState(hoje())

  const igrejaId = celulas.find((c) => String(c.id) === celulaId)?.igreja_id ?? null

  useEffect(() => {
    api.get<RespostaApi<Celula[]>>('/celulas').then(({ data }) => {
      const lista = data.dados ?? []
      setCelulas(lista)
      if (lista.length === 1) setCelulaId(String(lista[0].id))
    })
  }, [])

  return (
    <div>
      <PageHeader titulo="Presença & Célula" subtitulo="Presença, membros, visitantes e fotos — tudo em um só lugar" />

      <div className="border-border bg-slate mb-6 grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Célula</Label>
          <Select value={celulaId} onValueChange={(valor) => setCelulaId(valor ?? '')}>
            <SelectTrigger className="bg-card w-full">
              <SelectValue placeholder="Selecione uma célula" />
            </SelectTrigger>
            <SelectContent>
              {celulas.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nome} {c.lider_nome ? `— ${c.lider_nome}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Data (para o lançamento de presença)</Label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="bg-card" />
        </div>
      </div>

      {!celulaId && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">Selecione uma célula para começar.</CardContent>
        </Card>
      )}

      {celulaId && (
        <Tabs defaultValue={abaInicial}>
          <TabsList className="mb-5">
            <TabsTrigger value="presenca">Presença</TabsTrigger>
            <TabsTrigger value="membros">Membros</TabsTrigger>
            <TabsTrigger value="visitantes">Visitantes</TabsTrigger>
            <TabsTrigger value="galeria">Galeria</TabsTrigger>
          </TabsList>

          <TabsContent value="presenca">
            <AbaPresenca celulaId={celulaId} data={data} />
          </TabsContent>
          <TabsContent value="membros">
            <AbaMembros celulaId={celulaId} />
          </TabsContent>
          <TabsContent value="visitantes">
            <AbaVisitantes celulaId={celulaId} />
          </TabsContent>
          <TabsContent value="galeria">
            <AbaGaleria celulaId={celulaId} igrejaId={igrejaId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
