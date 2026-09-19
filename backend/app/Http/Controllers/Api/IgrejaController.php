<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BatismoIgreja;
use App\Models\ConversaoIgreja;
use App\Models\Igreja;
use App\Models\ReconciliacaoIgreja;
use App\Models\Usuario;
use App\Models\VisitanteIgreja;
use Illuminate\Http\Request;

class IgrejaController extends Controller
{
    public function index()
    {
        $igrejas = Igreja::with(['pastorPresidente:id,nome', 'pastorAuxiliar:id,nome'])
            ->withCount('celulas as total_celulas')
            ->orderBy('nome')
            ->get()
            ->map(fn (Igreja $i) => $this->apresentar($i));

        return response()->json(['status' => 'sucesso', 'dados' => $igrejas]);
    }

    public function show(Igreja $igreja)
    {
        $igreja->load(['pastorPresidente:id,nome,email', 'pastorAuxiliar:id,nome,email']);

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($igreja)]);
    }

    public function store(Request $request)
    {
        $this->exigirSupervisorOuAcima($request);

        $dados = $this->validarDados($request);
        $igreja = Igreja::create($dados);

        return response()->json(['status' => 'sucesso', 'dados' => $igreja], 201);
    }

    public function update(Request $request, Igreja $igreja)
    {
        $this->exigirSupervisorOuAcima($request);

        $dados = $this->validarDados($request, atualizando: true);
        $igreja->update($dados);

        return response()->json(['status' => 'sucesso', 'dados' => $igreja]);
    }

    public function destroy(Request $request, Igreja $igreja)
    {
        $this->exigirSupervisorOuAcima($request);
        $igreja->delete();

        return response()->json(['status' => 'sucesso']);
    }

    private function exigirSupervisorOuAcima(Request $request): void
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        abort_unless($usuario->isSupervisorOuAcima(), 403, 'Sem permissão para gerenciar igrejas.');
    }

    /**
     * Resumo/relatório de uma igreja num período — réplica de
     * relatorio_igreja($id, $filtro) do PHP original.
     */
    public function relatorio(Request $request, Igreja $igreja)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        abort_unless($usuario->podeGerenciarIgreja($igreja->id), 403);

        [$inicio, $fim] = $this->periodoPorFiltro($request->query('filtro', 'mes_atual'));

        $filtroData = fn ($query, string $coluna) => $inicio
            ? $query->whereBetween($coluna, [$inicio, $fim])
            : $query;

        return response()->json(['status' => 'sucesso', 'dados' => [
            'igreja' => $igreja,
            'total_visitantes' => $filtroData(VisitanteIgreja::where('igreja_id', $igreja->id), 'data_visita')->count(),
            'total_conversoes' => $filtroData(ConversaoIgreja::where('igreja_id', $igreja->id), 'data_conversao')->count(),
            'total_reconciliacao' => $filtroData(ReconciliacaoIgreja::where('igreja_id', $igreja->id), 'data_reconciliacao')->count(),
            'total_batismos' => $filtroData(BatismoIgreja::where('igreja_id', $igreja->id), 'data_batismo')->count(),
        ]]);
    }

    private function periodoPorFiltro(string $filtro): array
    {
        return match ($filtro) {
            'mes_atual' => [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()],
            'ultimos_30_dias' => [now()->subDays(30)->toDateString(), now()->toDateString()],
            'ultimos_90_dias' => [now()->subDays(90)->toDateString(), now()->toDateString()],
            default => [null, null], // 'todos'
        };
    }

    // Select de pastores nos formulários de igreja/célula.
    public function pastores()
    {
        $pastores = Usuario::whereIn('funcao', ['pastor', 'gestor_igreja'])
            ->orderBy('nome')->get(['id', 'nome']);

        return response()->json(['status' => 'sucesso', 'dados' => $pastores]);
    }

    private function validarDados(Request $request, bool $atualizando = false): array
    {
        $regra = $atualizando ? 'sometimes' : 'required';

        return $request->validate([
            'nome' => [$regra, 'string', 'max:255'],
            'endereco' => ['nullable', 'string'],
            'bairro' => ['nullable', 'string', 'max:150'],
            'cidade' => ['nullable', 'string', 'max:150'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'pastor_presidente_id' => ['nullable', 'exists:usuarios,id'],
            'pastor_auxiliar_id' => ['nullable', 'exists:usuarios,id'],
        ]);
    }

    private function apresentar(Igreja $i): array
    {
        return [
            'id' => $i->id,
            'nome' => $i->nome,
            'endereco' => $i->endereco,
            'bairro' => $i->bairro,
            'cidade' => $i->cidade,
            'telefone' => $i->telefone,
            'email' => $i->email,
            'pastor_presidente_id' => $i->pastor_presidente_id,
            'pastor_presidente_nome' => $i->pastorPresidente?->nome,
            'pastor_auxiliar_id' => $i->pastor_auxiliar_id,
            'pastor_auxiliar_nome' => $i->pastorAuxiliar?->nome,
            'total_celulas' => $i->total_celulas ?? 0,
        ];
    }
}
