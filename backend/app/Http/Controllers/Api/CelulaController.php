<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Celula;
use App\Models\Usuario;
use Illuminate\Http\Request;

class CelulaController extends Controller
{
    public function index(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        $celulas = Celula::query()
            ->visivelPara($usuario)
            ->withCount(['membrosAtivos as total_membros'])
            ->with(['lider:id,nome', 'lider2:id,nome', 'liderTreinamento:id,nome', 'igreja:id,nome'])
            ->orderBy('nome')
            ->get()
            ->map(fn (Celula $c) => $this->apresentar($c));

        return response()->json(['status' => 'sucesso', 'dados' => $celulas]);
    }

    public function show(Request $request, Celula $celula)
    {
        $this->authorize('view', $celula);

        $celula->load(['lider:id,nome,email', 'lider2:id,nome,email', 'liderTreinamento:id,nome,email', 'supervisor:id,nome', 'igreja:id,nome']);
        $celula->loadCount(['membrosAtivos as total_membros']);

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($celula)]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Celula::class);

        $dados = $this->validarDados($request);
        $celula = Celula::create($dados);

        return response()->json(['status' => 'sucesso', 'dados' => $celula], 201);
    }

    public function update(Request $request, Celula $celula)
    {
        $this->authorize('update', $celula);

        $dados = $this->validarDados($request, atualizando: true);
        $celula->update($dados);

        return response()->json(['status' => 'sucesso', 'dados' => $celula]);
    }

    public function destroy(Request $request, Celula $celula)
    {
        $this->authorize('delete', $celula);
        $celula->delete();

        return response()->json(['status' => 'sucesso']);
    }

    // Selects de "líder"/"líder em treinamento" nos formulários de célula.
    public function lideres()
    {
        $lideres = Usuario::whereIn('funcao', ['lider', 'supervisor', 'pastor', 'admin'])
            ->orderBy('nome')->get(['id', 'nome']);

        return response()->json(['status' => 'sucesso', 'dados' => $lideres]);
    }

    public function lideresTreinamento()
    {
        $lideres = Usuario::where('funcao', 'lider_treinamento')
            ->orderBy('nome')->get(['id', 'nome', 'funcao']);

        return response()->json(['status' => 'sucesso', 'dados' => $lideres]);
    }

    private function validarDados(Request $request, bool $atualizando = false): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'igreja_id' => ['nullable', 'exists:igrejas,id'],
            'dia_semana' => ['nullable', 'string', 'max:50'],
            'hora' => ['nullable', 'string', 'max:20'],
            'endereco' => ['nullable', 'string'],
            'bairro' => ['nullable', 'string', 'max:150'],
            'cidade' => ['nullable', 'string', 'max:150'],
            'lider_id' => ['nullable', 'exists:usuarios,id'],
            'lider_id_2' => ['nullable', 'exists:usuarios,id'],
            'lider_treinamento_id' => ['nullable', 'exists:usuarios,id'],
            'supervisor_id' => ['nullable', 'exists:usuarios,id'],
        ]);
    }

    private function apresentar(Celula $c): array
    {
        return [
            'id' => $c->id,
            'nome' => $c->nome,
            'igreja_id' => $c->igreja_id,
            'igreja_nome' => $c->igreja?->nome,
            'dia_semana' => $c->dia_semana,
            'hora' => $c->hora,
            'endereco' => $c->endereco,
            'bairro' => $c->bairro,
            'cidade' => $c->cidade,
            'lider_id' => $c->lider_id,
            'lider_nome' => $c->lider?->nome,
            'lider_id_2' => $c->lider_id_2,
            'lider_2_nome' => $c->lider2?->nome,
            'lider_treinamento_id' => $c->lider_treinamento_id,
            'lider_treinamento_nome' => $c->liderTreinamento?->nome,
            'total_membros' => $c->total_membros ?? 0,
        ];
    }
}
