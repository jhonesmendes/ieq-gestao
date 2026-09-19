<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Celula;
use App\Models\Evento;
use App\Models\Membro;
use App\Models\Presenca;
use App\Models\Usuario;
use Illuminate\Http\Request;

/**
 * Réplica de config/dashboard.php do projeto PHP original: cards de
 * estatística, presença semanal (6 semanas), membros recentes, próximos
 * eventos e células em destaque — tudo escopado pela hierarquia do
 * usuário logado (mesma regra de Celula::scopeVisivelPara).
 */
class DashboardController extends Controller
{
    public function index(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        if ($usuario->funcao === 'membro' || $usuario->funcao === 'gestor_igreja') {
            // Membro comum e gestor_igreja não usam os agregados do
            // dashboard administrativo (o gestor tem o próprio painel,
            // ver Fase 4 — app da igreja).
            return response()->json(['status' => 'sucesso', 'dados' => ['pode_ver_agregados' => false]]);
        }

        $celulasVisiveis = Celula::query()->visivelPara($usuario)->with('lider:id,nome')->get();
        $celulaIds = $celulasVisiveis->pluck('id');

        $totalMembros = Membro::whereIn('celula_id', $celulaIds)->where('status', 'ativo')->count();
        $totalLideres = $this->totalLideres($usuario);
        $mediaPresenca = $this->mediaPresenca($celulaIds);
        $presencaSemanal = $this->presencaSemanal($celulaIds);
        $membrosRecentes = $this->membrosRecentes($celulaIds);
        $proximosEventos = Evento::where('data_evento', '>=', now()->startOfDay())->orderBy('data_evento')->limit(3)->get();
        $celulasDestaque = $this->celulasDestaque($celulasVisiveis);

        return response()->json(['status' => 'sucesso', 'dados' => [
            'pode_ver_agregados' => true,
            'total_membros' => $totalMembros,
            'total_celulas' => $celulasVisiveis->count(),
            'total_lideres' => $totalLideres,
            'media_presenca' => $mediaPresenca,
            'presenca_semanal' => $presencaSemanal,
            'membros_recentes' => $membrosRecentes,
            'proximos_eventos' => $proximosEventos,
            'celulas_destaque' => $celulasDestaque,
        ]]);
    }

    private function totalLideres(Usuario $usuario): int
    {
        if ($usuario->isPastorOuAcima()) {
            return Usuario::whereIn('funcao', ['lider', 'lider_treinamento', 'supervisor'])->count();
        }
        if ($usuario->funcao === 'supervisor') {
            return Celula::where('supervisor_id', $usuario->id)->whereNotNull('lider_id')->pluck('lider_id')->unique()->count();
        }
        return 0;
    }

    private function mediaPresenca($celulaIds): ?int
    {
        $limite = now()->subDays(30)->toDateString();
        $linha = Presenca::whereIn('celula_id', $celulaIds)
            ->where('data_presenca', '>=', $limite)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes')
            ->first();

        if (! $linha || (int) $linha->total === 0) {
            return null;
        }

        return (int) round(($linha->presentes / $linha->total) * 100);
    }

    private function presencaSemanal($celulaIds, int $semanas = 6): array
    {
        $resultado = [];
        for ($i = $semanas - 1; $i >= 0; $i--) {
            $inicio = now()->subWeeks($i)->startOfWeek()->toDateString();
            $fim = now()->subWeeks($i)->endOfWeek()->toDateString();

            $linha = Presenca::whereIn('celula_id', $celulaIds)
                ->whereBetween('data_presenca', [$inicio, $fim])
                ->selectRaw('COUNT(*) as total, SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes')
                ->first();

            $total = (int) ($linha->total ?? 0);
            $presentes = (int) ($linha->presentes ?? 0);

            $resultado[] = [
                'label' => \Carbon\Carbon::parse($inicio)->format('d/m'),
                'pct' => $total > 0 ? (int) round(($presentes / $total) * 100) : 0,
                'total' => $total,
            ];
        }
        return $resultado;
    }

    private function membrosRecentes($celulaIds): array
    {
        return Membro::whereIn('celula_id', $celulaIds)
            ->with('usuario:id,nome,telefone')
            ->orderByDesc('criado_em')
            ->limit(5)
            ->get()
            ->map(fn (Membro $m) => [
                'nome' => $m->usuario?->nome,
                'telefone' => $m->usuario?->telefone,
                'status' => $m->status,
            ])
            ->all();
    }

    private function celulasDestaque($celulasVisiveis): array
    {
        $limite = now()->subDays(30)->toDateString();

        return $celulasVisiveis
            ->map(function (Celula $c) use ($limite) {
                $totalMembros = Membro::where('celula_id', $c->id)->where('status', 'ativo')->count();
                $linha = Presenca::where('celula_id', $c->id)
                    ->where('data_presenca', '>=', $limite)
                    ->selectRaw('COUNT(*) as total, SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes')
                    ->first();
                $total = (int) ($linha->total ?? 0);
                $presentes = (int) ($linha->presentes ?? 0);

                return [
                    'id' => $c->id,
                    'nome' => $c->nome,
                    'lider' => $c->lider?->nome ?? 'Não definido',
                    'dia_semana' => $c->dia_semana,
                    'hora' => $c->hora,
                    'total_membros' => $totalMembros,
                    'presenca_pct' => $total > 0 ? (int) round(($presentes / $total) * 100) : null,
                ];
            })
            ->sortByDesc('total_membros')
            ->take(3)
            ->values()
            ->all();
    }
}
