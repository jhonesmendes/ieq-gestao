import type { ReactNode } from 'react'

export function PageHeader({
  titulo,
  subtitulo,
  acoes,
}: {
  titulo: string
  subtitulo?: string
  acoes?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-text-primary text-2xl font-bold">{titulo}</h1>
        {subtitulo && <p className="text-text-secondary mt-1 text-sm">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  )
}
