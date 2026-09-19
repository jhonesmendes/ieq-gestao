<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visitante;
use Illuminate\Http\Request;

class VisitanteController extends Controller
{
    public function index(Request $request)
    {
        $query = Visitante::query()->with('celula:id,nome');

        if ($celulaId = $request->query('celula_id')) {
            $query->where('celula_id', $celulaId);
        }

        $visitantes = $query->orderBy('data_visita', 'desc')->get()
            ->map(fn (Visitante $v) => $this->apresentar($v));

        return response()->json(['status' => 'sucesso', 'dados' => $visitantes]);
    }

    public function show(Visitante $visitante)
    {
        $visitante->load('celula:id,nome');

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($visitante)]);
    }

    public function store(Request $request)
    {
        $dados = $this->validarDados($request);
        $visitante = Visitante::create($dados);

        return response()->json(['status' => 'sucesso', 'dados' => ['visitante_id' => $visitante->id] + $this->apresentar($visitante)], 201);
    }

    public function update(Request $request, Visitante $visitante)
    {
        $dados = $this->validarDados($request, atualizando: true);
        $visitante->update($dados);

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($visitante)]);
    }

    public function destroy(Visitante $visitante)
    {
        $visitante->delete();

        return response()->json(['status' => 'sucesso']);
    }

    private function validarDados(Request $request, bool $atualizando = false): array
    {
        $regra = $atualizando ? 'sometimes' : 'required';

        return $request->validate([
            'nome' => [$regra, 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email'],
            'celula_id' => ['nullable', 'exists:celulas,id'],
            'data_visita' => [$regra, 'date'],
            'status' => ['nullable', 'string', 'in:primeira_visita,retornou,convertido,membro'],
            'observacoes' => ['nullable', 'string'],
        ]);
    }

    private function apresentar(Visitante $v): array
    {
        return [
            'id' => $v->id,
            'nome' => $v->nome,
            'telefone' => $v->telefone,
            'email' => $v->email,
            'celula_id' => $v->celula_id,
            'celula_nome' => $v->celula?->nome,
            'data_visita' => $v->data_visita,
            'status' => $v->status,
            'observacoes' => $v->observacoes,
        ];
    }
}
