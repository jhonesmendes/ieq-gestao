export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return partes.length >= 2 ? (partes[0][0] + partes[1][0]).toUpperCase() : nome.slice(0, 2).toUpperCase()
}

export function formatarDataLocal(dataString: string | null) {
  if (!dataString) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
    const [ano, mes, dia] = dataString.split('-')
    return new Date(Number(ano), Number(mes) - 1, Number(dia)).toLocaleDateString('pt-BR')
  }
  return new Date(dataString).toLocaleDateString('pt-BR')
}
