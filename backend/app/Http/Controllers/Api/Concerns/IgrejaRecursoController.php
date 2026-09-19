<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Base para os 5 sub-recursos de igreja (eventos/visitantes/conversões/
 * reconciliação/batismos) — no PHP original eram 15 ações quase idênticas
 * (criar/listar/deletar × 5), todas gated por usuario_pode_gerenciar_igreja().
 * Cada controller concreto só declara o model e as regras de validação.
 */
abstract class IgrejaRecursoController extends Controller
{
    /** @return class-string<Model> */
    abstract protected function model(): string;

    abstract protected function regrasValidacao(): array;

    public function index(Request $request)
    {
        $igrejaId = $request->query('id') ?? $request->query('igreja_id');
        $this->autorizarIgreja($request, (int) $igrejaId);

        $modelo = $this->model();
        $registros = $modelo::where('igreja_id', $igrejaId)->orderBy('id', 'desc')->get();

        return response()->json(['status' => 'sucesso', 'dados' => $registros]);
    }

    public function store(Request $request)
    {
        $dados = $request->validate(array_merge(
            ['igreja_id' => ['required', 'exists:igrejas,id']],
            $this->regrasValidacao()
        ));

        $this->autorizarIgreja($request, (int) $dados['igreja_id']);

        $modelo = $this->model();
        $registro = $modelo::create($dados);

        return response()->json(['status' => 'sucesso', 'dados' => $registro], 201);
    }

    public function destroy(Request $request, int $id)
    {
        $modelo = $this->model();
        $registro = $modelo::findOrFail($id);

        $this->autorizarIgreja($request, (int) $registro->igreja_id);
        $registro->delete();

        return response()->json(['status' => 'sucesso']);
    }

    private function autorizarIgreja(Request $request, int $igrejaId): void
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        abort_unless($usuario->podeGerenciarIgreja($igrejaId), 403, 'Sem permissão para gerenciar esta igreja.');
    }
}
