<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\IgrejaRecursoController;
use App\Models\ReconciliacaoIgreja;

class ReconciliacaoIgrejaController extends IgrejaRecursoController
{
    protected function model(): string
    {
        return ReconciliacaoIgreja::class;
    }

    protected function regrasValidacao(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'data_reconciliacao' => ['required', 'date'],
            'obs' => ['nullable', 'string'],
        ];
    }
}
