<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\IgrejaRecursoController;
use App\Models\EventoIgreja;
use Illuminate\Http\Request;

class EventoIgrejaController extends IgrejaRecursoController
{
    protected function model(): string
    {
        return EventoIgreja::class;
    }

    /**
     * Próximos eventos da igreja — leitura livre pra qualquer usuário
     * autenticado (líder, membro), diferente de index()/store()/destroy()
     * que exigem podeGerenciarIgreja(). O objetivo é justamente que membros
     * e líderes vejam a agenda da igreja, só quem gerencia é que cadastra.
     */
    public function proximos(Request $request)
    {
        $igrejaId = (int) $request->query('igreja_id');

        $eventos = EventoIgreja::where('igreja_id', $igrejaId)
            ->where('data_evento', '>=', now()->startOfDay())
            ->orderBy('data_evento')
            ->limit((int) $request->query('limite', 5))
            ->get();

        return response()->json(['status' => 'sucesso', 'dados' => $eventos]);
    }

    protected function regrasValidacao(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'data_evento' => ['required', 'date'],
            'localizacao' => ['nullable', 'string', 'max:255'],
            'responsavel_id' => ['nullable', 'exists:usuarios,id'],
            'tipo' => ['nullable', 'string', 'max:50'],
            'vagas' => ['nullable', 'integer'],
        ];
    }
}
