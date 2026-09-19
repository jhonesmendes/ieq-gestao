<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\IgrejaRecursoController;
use App\Models\EventoIgreja;

class EventoIgrejaController extends IgrejaRecursoController
{
    protected function model(): string
    {
        return EventoIgreja::class;
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
