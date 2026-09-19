<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use Illuminate\Http\Request;

class CursoController extends Controller
{
    public function index()
    {
        $cursos = Curso::with('professor:id,nome')->orderBy('data_inicio', 'desc')->get()
            ->map(fn (Curso $c) => $this->apresentar($c));

        return response()->json(['status' => 'sucesso', 'dados' => $cursos]);
    }

    public function show(Curso $curso)
    {
        $curso->load('professor:id,nome');

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($curso)]);
    }

    public function store(Request $request)
    {
        $curso = Curso::create($this->validarDados($request));

        return response()->json(['status' => 'sucesso', 'dados' => $curso], 201);
    }

    public function update(Request $request, Curso $curso)
    {
        $curso->update($this->validarDados($request, atualizando: true));

        return response()->json(['status' => 'sucesso', 'dados' => $curso]);
    }

    public function destroy(Curso $curso)
    {
        $curso->delete();

        return response()->json(['status' => 'sucesso']);
    }

    private function validarDados(Request $request, bool $atualizando = false): array
    {
        $regra = $atualizando ? 'sometimes' : 'required';

        return $request->validate([
            'nome' => [$regra, 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'data_inicio' => [$regra, 'date'],
            'data_fim' => ['nullable', 'date'],
            'localizacao' => ['nullable', 'string'],
            'vagas' => ['nullable', 'integer'],
            'professor_id' => ['nullable', 'exists:usuarios,id'],
        ]);
    }

    private function apresentar(Curso $c): array
    {
        return [
            'id' => $c->id,
            'nome' => $c->nome,
            'descricao' => $c->descricao,
            'data_inicio' => $c->data_inicio,
            'data_fim' => $c->data_fim,
            'localizacao' => $c->localizacao,
            'vagas' => $c->vagas,
            'professor_nome' => $c->professor?->nome,
        ];
    }
}
