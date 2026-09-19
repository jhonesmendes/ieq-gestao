<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\IgrejaRecursoController;
use App\Models\ConversaoIgreja;

class ConversaoIgrejaController extends IgrejaRecursoController
{
    protected function model(): string
    {
        return ConversaoIgreja::class;
    }

    protected function regrasValidacao(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'data_conversao' => ['required', 'date'],
            'obs' => ['nullable', 'string'],
        ];
    }
}
