<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Celula;
use App\Models\Membro;
use App\Models\Presenca;
use App\Models\ReuniaoCelula;
use App\Models\Usuario;
use App\Models\Visitante;
use App\Services\UploadReuniaoFotoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PresencaController extends Controller
{
    public function __construct(private UploadReuniaoFotoService $uploadService) {}

    // Toggle único — mantido para paridade com registrar_presenca do PHP
    // original; a tela nova usa principalmente salvarReuniao() (lote).
    public function registrarPresenca(Request $request)
    {
        $dados = $request->validate([
            'membro_id' => ['required', 'exists:membros,id'],
            'celula_id' => ['required', 'exists:celulas,id'],
            'data_presenca' => ['required', 'date'],
            'presente' => ['required', 'boolean'],
        ]);

        $this->autorizarCelula($request->user(), (int) $dados['celula_id']);

        Presenca::updateOrCreate(
            ['membro_id' => $dados['membro_id'], 'celula_id' => $dados['celula_id'], 'data_presenca' => $dados['data_presenca']],
            ['presente' => $dados['presente']]
        );

        return response()->json(['status' => 'sucesso']);
    }

    /**
     * Endpoint único do fluxo "Salvar reunião de hoje": presença de todos
     * os membros + visitantes novos + foto + observações, tudo numa
     * transação. Substitui a sequência de N chamadas que o front PHP
     * fazia (uma por membro, uma por visitante, depois a foto).
     */
    public function salvarReuniao(Request $request)
    {
        $dados = $request->validate([
            'celula_id' => ['required', 'exists:celulas,id'],
            'data' => ['required', 'date'],
            'presencas' => ['array'],
            'presencas.*.membro_id' => ['required', 'exists:membros,id'],
            'presencas.*.presente' => ['required', 'boolean'],
            'visitantes_novos' => ['array'],
            'visitantes_novos.*' => ['string', 'max:255'],
            'observacoes' => ['nullable', 'string'],
            'foto' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $celula = Celula::findOrFail($dados['celula_id']);
        $this->autorizarCelula($request->user(), $celula->id);

        $resumo = DB::transaction(function () use ($dados, $celula, $request) {
            $presentes = 0;
            $ausentes = 0;

            foreach ($dados['presencas'] ?? [] as $p) {
                Presenca::updateOrCreate(
                    ['membro_id' => $p['membro_id'], 'celula_id' => $celula->id, 'data_presenca' => $dados['data']],
                    ['presente' => $p['presente']]
                );
                $p['presente'] ? $presentes++ : $ausentes++;
            }

            $visitantesSalvos = 0;
            foreach ($dados['visitantes_novos'] ?? [] as $nome) {
                if (trim($nome) === '') {
                    continue;
                }
                Visitante::create([
                    'nome' => $nome,
                    'celula_id' => $celula->id,
                    'data_visita' => $dados['data'],
                    'status' => 'primeira_visita',
                ]);
                $visitantesSalvos++;
            }

            $totalVisitantesDoDia = Visitante::where('celula_id', $celula->id)
                ->where('data_visita', $dados['data'])->count();

            $reuniao = ReuniaoCelula::firstOrNew([
                'celula_id' => $celula->id,
                'data_reuniao' => $dados['data'],
            ]);

            if ($request->hasFile('foto')) {
                $this->uploadService->remover($reuniao->foto_url);
                $reuniao->foto_url = $this->uploadService->salvar($request->file('foto'), $celula->id, $dados['data']);
            }

            if (isset($dados['observacoes'])) {
                $reuniao->observacoes = $dados['observacoes'];
            }

            $reuniao->total_presentes = $presentes;
            $reuniao->total_visitantes = $totalVisitantesDoDia;
            $reuniao->save();

            return [
                'presentes' => $presentes,
                'ausentes' => $ausentes,
                'visitantes_salvos' => $visitantesSalvos,
                'foto_salva' => $request->hasFile('foto'),
                'reuniao_id' => $reuniao->id,
            ];
        });

        return response()->json(['status' => 'sucesso', 'dados' => $resumo]);
    }

    public function listarReunioes(Request $request)
    {
        $celulaId = $request->query('celula_id');
        $this->autorizarCelula($request->user(), (int) $celulaId);

        $reunioes = ReuniaoCelula::where('celula_id', $celulaId)
            ->orderBy('data_reuniao', 'desc')
            ->get()
            ->map(fn (ReuniaoCelula $r) => [
                'id' => $r->id,
                'data_reuniao' => $r->data_reuniao,
                'foto_url' => $r->foto_url ? Storage::disk('public')->url($r->foto_url) : null,
                'observacoes' => $r->observacoes,
                'total_presentes' => $r->total_presentes,
                'total_visitantes' => $r->total_visitantes,
            ]);

        return response()->json(['status' => 'sucesso', 'dados' => $reunioes]);
    }

    public function estatisticasCelula(Request $request)
    {
        $celulaId = $request->query('celula_id');
        $this->autorizarCelula($request->user(), (int) $celulaId);

        $totalMembros = Membro::where('celula_id', $celulaId)->where('status', 'ativo')->count();

        $mediaPresenca = Presenca::where('celula_id', $celulaId)
            ->selectRaw('AVG(CASE WHEN presente = 1 THEN 1.0 ELSE 0 END) * 100 as media')
            ->value('media');

        return response()->json(['status' => 'sucesso', 'dados' => [
            'total_membros' => $totalMembros,
            'media_presenca' => round($mediaPresenca ?? 0, 1),
        ]]);
    }

    /**
     * Relatório por período — mesma forma de resposta que
     * pages/presenca.php (admin) já espera no front: totais gerais +
     * lista de células com registros individuais e desempenho por membro.
     */
    public function relatorioPresenca(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        $dados = $request->validate([
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['required', 'date'],
            'celula_id' => ['nullable', 'exists:celulas,id'],
        ]);

        $celulas = Celula::query()->visivelPara($usuario)
            ->when($dados['celula_id'] ?? null, fn ($q, $id) => $q->where('id', $id))
            ->get();

        $totalPresencas = 0;
        $totalAusencias = 0;
        $celulasResposta = [];

        foreach ($celulas as $celula) {
            $registros = Presenca::where('celula_id', $celula->id)
                ->whereBetween('data_presenca', [$dados['data_inicio'], $dados['data_fim']])
                ->with('membro.usuario:id,nome')
                ->get();

            $totalPresencas += $registros->where('presente', true)->count();
            $totalAusencias += $registros->where('presente', false)->count();

            $porMembro = $registros->groupBy('membro_id')->map(function ($grupo) {
                $membro = $grupo->first()->membro;

                return [
                    'nome' => $membro?->usuario?->nome ?? 'Membro removido',
                    'presencas' => $grupo->where('presente', true)->count(),
                    'ausencias' => $grupo->where('presente', false)->count(),
                ];
            })->values();

            $celulasResposta[] = [
                'nome' => $celula->nome,
                'registros_presenca' => $registros->map(fn (Presenca $p) => [
                    'membro_nome' => $p->membro?->usuario?->nome ?? 'Membro removido',
                    'data_presenca' => $p->data_presenca->format('Y-m-d'),
                    'presente' => $p->presente,
                ])->values(),
                'membros' => $porMembro,
            ];
        }

        $totalGeral = $totalPresencas + $totalAusencias;

        return response()->json(['status' => 'sucesso', 'dados' => [
            'totais' => [
                'taxa_presenca' => $totalGeral > 0 ? round(($totalPresencas / $totalGeral) * 100) : 0,
                'total_presencas' => $totalPresencas,
                'total_ausencias' => $totalAusencias,
            ],
            'celulas' => $celulasResposta,
        ]]);
    }

    /**
     * Exportação Excel de verdade (PhpSpreadsheet) — no PHP original isso
     * era um CSV disfarçado de .xlsx; aqui é um .xlsx real.
     */
    public function exportarExcel(Request $request)
    {
        $dados = $request->validate([
            'celula_id' => ['required', 'exists:celulas,id'],
            'data' => ['required', 'date'],
        ]);

        $this->autorizarCelula($request->user(), (int) $dados['celula_id']);

        $celula = Celula::findOrFail($dados['celula_id']);
        $presencas = Presenca::where('celula_id', $celula->id)
            ->where('data_presenca', $dados['data'])
            ->with('membro.usuario:id,nome')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Presença');
        $sheet->setCellValue('A1', 'Célula');
        $sheet->setCellValue('B1', $celula->nome);
        $sheet->setCellValue('A2', 'Data');
        $sheet->setCellValue('B2', $dados['data']);

        $sheet->setCellValue('A4', 'Membro');
        $sheet->setCellValue('B4', 'Status');
        $sheet->getStyle('A4:B4')->getFont()->setBold(true);

        $linha = 5;
        foreach ($presencas as $p) {
            $sheet->setCellValue("A{$linha}", $p->membro?->usuario?->nome ?? 'Membro removido');
            $sheet->setCellValue("B{$linha}", $p->presente ? 'Presente' : 'Faltou');
            $linha++;
        }

        foreach (range('A', 'B') as $coluna) {
            $sheet->getColumnDimension($coluna)->setAutoSize(true);
        }

        $nomeArquivo = "presenca_{$celula->id}_{$dados['data']}.xlsx";
        $caminhoTemp = tempnam(sys_get_temp_dir(), 'ieq_xlsx_');
        (new Xlsx($spreadsheet))->save($caminhoTemp);

        return response()->download($caminhoTemp, $nomeArquivo)->deleteFileAfterSend(true);
    }

    private function autorizarCelula(Usuario $usuario, int $celulaId): void
    {
        if ($usuario->isPastorOuAcima()) {
            return;
        }

        $celula = Celula::findOrFail($celulaId);

        if ($usuario->funcao === 'supervisor' && $celula->supervisor_id === $usuario->id) {
            return;
        }

        if ($usuario->isLiderExclusivo() && $celula->temComoLider($usuario->id)) {
            return;
        }

        abort(403, 'Você não tem permissão para acessar esta célula.');
    }
}
