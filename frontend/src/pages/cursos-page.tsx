import { useEffect, useState } from 'react'
import { api, apiMutate, type RespostaApi } from '@/lib/api'
import type { Curso } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { formatarDataLocal } from '@/lib/formatadores'

interface FormularioCurso {
  id: number | null
  nome: string
  descricao: string
  data_inicio: string
  data_fim: string
  localizacao: string
  vagas: string
}

function formVazio(): FormularioCurso {
  return { id: null, nome: '', descricao: '', data_inicio: '', data_fim: '', localizacao: '', vagas: '' }
}

function cursoAtivo(c: Curso) {
  if (!c.data_fim) return true
  return new Date(c.data_fim) >= new Date(new Date().toDateString())
}

export function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState<FormularioCurso>(formVazio())
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    setCarregando(true)
    api
      .get<RespostaApi<Curso[]>>('/cursos')
      .then(({ data }) => setCursos(data.dados ?? []))
      .catch(() => toast.error('Não foi possível carregar os cursos.'))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  function abrirNovo() {
    setForm(formVazio())
    setModalAberto(true)
  }

  function abrirEdicao(c: Curso) {
    setForm({
      id: c.id,
      nome: c.nome,
      descricao: c.descricao ?? '',
      data_inicio: c.data_inicio ?? '',
      data_fim: c.data_fim ?? '',
      localizacao: c.localizacao ?? '',
      vagas: c.vagas != null ? String(c.vagas) : '',
    })
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim() || !form.data_inicio) {
      toast.error('Informe nome e data de início do curso.')
      return
    }
    setSalvando(true)
    const dados = {
      nome: form.nome,
      descricao: form.descricao || null,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim || null,
      localizacao: form.localizacao || null,
      vagas: form.vagas ? Number(form.vagas) : null,
    }
    try {
      if (form.id) {
        await apiMutate('put', `/cursos/${form.id}`, dados)
        toast.success('Curso atualizado.')
      } else {
        await apiMutate('post', '/cursos', dados)
        toast.success('Curso criado.')
      }
      setModalAberto(false)
      carregar()
    } catch {
      toast.error('Não foi possível salvar o curso.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(c: Curso) {
    if (!confirm(`Excluir o curso "${c.nome}"?`)) return
    try {
      await apiMutate('delete', `/cursos/${c.id}`)
      setCursos((atual) => atual.filter((x) => x.id !== c.id))
      toast.success('Curso excluído.')
    } catch {
      toast.error('Não foi possível excluir o curso.')
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Cursos"
        subtitulo="Gerencie cursos e formação de líderes"
        acoes={
          <Button onClick={abrirNovo}>
            <Plus className="mr-1 h-4 w-4" /> Novo curso
          </Button>
        }
      />

      {carregando && <p className="text-text-muted text-sm">Carregando…</p>}
      {!carregando && cursos.length === 0 && (
        <Card>
          <CardContent className="text-text-muted p-10 text-center text-sm">Nenhum curso cadastrado.</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((c) => {
          const ativo = cursoAtivo(c)
          return (
            <Card key={c.id}>
              <CardContent>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-text-primary text-base font-bold">{c.nome}</h3>
                  <Badge className={ativo ? 'bg-primary-light text-primary-dark' : 'bg-slate text-text-muted'}>
                    {ativo ? '✓ Ativo' : '✕ Encerrado'}
                  </Badge>
                </div>
                {c.descricao && <p className="text-text-muted mb-2 line-clamp-2 text-xs">{c.descricao}</p>}
                <p className="text-text-muted text-xs">📅 Início: {formatarDataLocal(c.data_inicio)}</p>
                <p className="text-text-muted text-xs">📅 Término: {c.data_fim ? formatarDataLocal(c.data_fim) : 'Em andamento'}</p>
                {c.localizacao && (
                  <p className="text-text-muted flex items-center gap-1.5 text-xs">
                    <MapPin className="h-3.5 w-3.5" /> {c.localizacao}
                  </p>
                )}
                {c.vagas && (
                  <p className="text-text-muted flex items-center gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" /> {c.vagas} vagas
                  </p>
                )}
                {c.professor_nome && <p className="text-text-muted text-xs">👨‍🏫 {c.professor_nome}</p>}

                <div className="border-border mt-3 flex gap-2 border-t pt-3">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => abrirEdicao(c)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="border-danger-light text-danger flex-1" onClick={() => excluir(c)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar curso' : 'Novo curso'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Nome do curso</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Descrição</Label>
              <Textarea
                rows={3}
                placeholder="Descreva o conteúdo e objetivos do curso…"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1.5">Data de início</Label>
              <Input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Data de término</Label>
              <Input type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Localização</Label>
              <Input
                placeholder="Ex: Sala de Ensino, Online…"
                value={form.localizacao}
                onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1.5">Vagas</Label>
              <Input type="number" min={0} placeholder="0 = ilimitado" value={form.vagas} onChange={(e) => setForm({ ...form, vagas: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
