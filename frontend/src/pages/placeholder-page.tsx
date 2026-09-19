import { PageHeader } from '@/components/shared/page-header'

/** Tela ainda não portada — entra na Fase 4 do plano de migração. */
export function PlaceholderPage({ titulo }: { titulo: string }) {
  return (
    <div>
      <PageHeader titulo={titulo} subtitulo="Esta tela ainda será portada (Fase 4)." />
      <div className="border-border bg-card rounded-lg border border-dashed p-10 text-center">
        <p className="text-text-muted text-sm">🚧 Em construção</p>
      </div>
    </div>
  )
}
