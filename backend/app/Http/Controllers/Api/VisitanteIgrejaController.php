<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\IgrejaRecursoController;
use App\Models\VisitanteIgreja;

class VisitanteIgrejaController extends IgrejaRecursoController
{
    protected function model(): string
    {
        return VisitanteIgreja::class;
    }

    protected function regrasValidacao(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'data_visita' => ['required', 'date'],
            'obs' => ['nullable', 'string'],
        ];
    }
}
