export interface Celula {
  id: number
  nome: string
  igreja_id: number | null
  igreja_nome: string | null
  dia_semana: string | null
  hora: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  lider_id: number | null
  lider_nome: string | null
  lider_id_2: number | null
  lider_2_nome: string | null
  lider_treinamento_id: number | null
  lider_treinamento_nome: string | null
  total_membros: number
}

export interface Membro {
  id: number
  nome: string
  email: string | null
  telefone: string | null
  funcao: string | null
  celula_id: number
  celula_nome: string | null
  status: 'ativo' | 'inativo'
  data_conversao: string | null
  data_batismo: string | null
  data_nasc: string | null
}

export interface Visitante {
  id: number
  nome: string
  telefone: string | null
  email: string | null
  celula_id: number | null
  celula_nome: string | null
  data_visita: string
  status: 'primeira_visita' | 'retornou' | 'convertido' | 'membro'
  observacoes: string | null
}

export interface ReuniaoCelula {
  id: number
  data_reuniao: string
  foto_url: string | null
  observacoes: string | null
  total_presentes: number
  total_visitantes: number
}

export interface Igreja {
  id: number
  nome: string
  endereco: string | null
  bairro: string | null
  cidade: string | null
  telefone: string | null
  email: string | null
  pastor_presidente_id: number | null
  pastor_presidente_nome: string | null
  pastor_auxiliar_id: number | null
  pastor_auxiliar_nome: string | null
  total_celulas: number
}

export interface Evento {
  id: number
  celula_id: number | null
  nome: string
  descricao: string | null
  data_evento: string
  localizacao: string | null
  responsavel_id: number | null
  tipo: string | null
  vagas: number | null
}

export interface Curso {
  id: number
  nome: string
  descricao: string | null
  data_inicio: string | null
  data_fim: string | null
  localizacao: string | null
  vagas: number | null
  professor_nome: string | null
}

export interface MembroRecente {
  nome: string | null
  telefone: string | null
  status: string
}

export interface SemanaPresenca {
  label: string
  pct: number
  total: number
}

export interface CelulaDestaque {
  id: number
  nome: string
  lider: string
  dia_semana: string | null
  hora: string | null
  total_membros: number
  presenca_pct: number | null
}

export interface DashboardDados {
  pode_ver_agregados: boolean
  total_membros?: number
  total_celulas?: number
  total_lideres?: number
  media_presenca?: number | null
  presenca_semanal?: SemanaPresenca[]
  membros_recentes?: MembroRecente[]
  proximos_eventos?: Evento[]
  celulas_destaque?: CelulaDestaque[]
}

export interface EventoIgreja {
  id: number
  igreja_id: number
  nome: string
  descricao: string | null
  data_evento: string
  localizacao: string | null
  responsavel_id: number | null
  tipo: string | null
  vagas: number | null
}

export type TipoPessoaIgreja = 'visitantes' | 'conversoes' | 'reconciliacao' | 'batismos'

export interface PessoaIgreja {
  id: number
  igreja_id: number
  nome: string
  telefone?: string | null
  email?: string | null
  ministro?: string | null
  localizacao?: string | null
  data_visita?: string
  data_conversao?: string
  data_reconciliacao?: string
  data_batismo?: string
  obs: string | null
}

export interface RelatorioIgreja {
  igreja: Igreja
  total_visitantes: number
  total_conversoes: number
  total_reconciliacao: number
  total_batismos: number
}

export interface Usuario {
  id: number
  nome: string
  email: string
  telefone: string | null
  funcao: string
  permissoes: string[] | null
  modulos_permitidos: string[]
}
