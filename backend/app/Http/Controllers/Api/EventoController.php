<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Celula;
use App\Models\Evento;
use App\Models\Usuario;
use Illuminate\Http\Request;

/**
 * Eventos globais (celula_id nulo, gerido por admin/pastor) e eventos de
 * uma célula específica (celula_id preenchido, geridos pelo(s) líder(es)
 * dessa célula) — dois usos do mesmo recurso, diferenciados por
 * celula_id e pela regra de autorização em autorizarEvento().
 */
class EventoController extends Controller
{
    public function index(Request $request)
    {
        $celulaId = $request->query('celula_id');

        if ($celulaId) {
            $this->autorizarCelula($request, (int) $celulaId);
            $eventos = Evento::where('celula_id', $celulaId)->orderBy('data_evento', 'desc')->get();
        } else {
            $eventos = Evento::whereNull('celula_id')->orderBy('data_evento', 'desc')->get();
        }

        return response()->json(['status' => 'sucesso', 'dados' => $eventos]);
    }

    public function proximos(Request $request)
    {
        $limite = (int) $request->query('limite', 3);

        $eventos = Evento::whereNull('celula_id')
            ->where('data_evento', '>=', now()->startOfDay())
            ->orderBy('data_evento')
            ->limit($limite)
            ->get();

        return response()->json(['status' => 'sucesso', 'dados' => $eventos]);
    }

    public function show(Evento $evento)
    {
        return response()->json(['status' => 'sucesso', 'dados' => $evento]);
    }

    public function store(Request $request)
    {
        $dados = $this->validarDados($request);

        if (!empty($dados['celula_id'])) {
            $this->autorizarCelula($request, (int) $dados['celula_id']);
        } else {
            $this->autorizarGlobal($request);
        }

        $evento = Evento::create($dados);

        return response()->json(['status' => 'sucesso', 'dados' => $evento], 201);
    }

    public function update(Request $request, Evento $evento)
    {
        $evento->celula_id ? $this->autorizarCelula($request, (int) $evento->celula_id) : $this->autorizarGlobal($request);

        $evento->update($this->validarDados($request, atualizando: true));

        return response()->json(['status' => 'sucesso', 'dados' => $evento]);
    }

    public function destroy(Request $request, Evento $evento)
    {
        $evento->celula_id ? $this->autorizarCelula($request, (int) $evento->celula_id) : $this->autorizarGlobal($request);

        $evento->delete();

        return response()->json(['status' => 'sucesso']);
    }

    private function autorizarCelula(Request $request, int $celulaId): void
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        if ($usuario->isPastorOuAcima()) {
            return;
        }

        $celula = Celula::findOrFail($celulaId);
        abort_unless($celula->temComoLider($usuario->id), 403, 'Sem permissão para gerenciar eventos desta célula.');
    }

    private function autorizarGlobal(Request $request): void
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        abort_unless($usuario->isPastorOuAcima(), 403, 'Sem permissão para gerenciar eventos gerais.');
    }

    private function validarDados(Request $request, bool $atualizando = false): array
    {
        $regra = $atualizando ? 'sometimes' : 'required';

        return $request->validate([
            'celula_id' => ['nullable', 'exists:celulas,id'],
            'nome' => [$regra, 'string', 'max:255'],
            'tipo' => ['nullable', 'string', 'max:50'],
            'data_evento' => [$regra, 'date'],
            'vagas' => ['nullable', 'integer'],
            'localizacao' => ['nullable', 'string'],
            'descricao' => ['nullable', 'string'],
        ]);
    }
}
