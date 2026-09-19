import type { Igreja } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AbaResumoIgreja } from './aba-resumo-igreja'
import { AbaEventosIgreja } from './aba-eventos-igreja'
import { AbaPessoasIgreja } from './aba-pessoas-igreja'

export function IgrejaDetalheDialog({
  igreja,
  aberto,
  onOpenChange,
}: {
  igreja: Igreja | null
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
}) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>⛪ {igreja?.nome}</DialogTitle>
        </DialogHeader>

        {igreja && (
          <Tabs defaultValue="resumo">
            <TabsList className="mb-4">
              <TabsTrigger value="resumo">📊 Resumo</TabsTrigger>
              <TabsTrigger value="eventos">🎯 Eventos</TabsTrigger>
              <TabsTrigger value="pessoas">👥 Pessoas</TabsTrigger>
            </TabsList>
            <TabsContent value="resumo">
              <AbaResumoIgreja igrejaId={igreja.id} />
            </TabsContent>
            <TabsContent value="eventos">
              <AbaEventosIgreja igrejaId={igreja.id} />
            </TabsContent>
            <TabsContent value="pessoas">
              <AbaPessoasIgreja igrejaId={igreja.id} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
