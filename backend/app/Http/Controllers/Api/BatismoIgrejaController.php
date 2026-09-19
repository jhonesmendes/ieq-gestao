<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\IgrejaRecursoController;
use App\Models\BatismoIgreja;

class BatismoIgrejaController extends IgrejaRecursoController
{
    protected function model(): string
    {
        return BatismoIgreja::class;
    }

    protected function regrasValidacao(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'data_batismo' => ['required', 'date'],
            'ministro' => ['nullable', 'string', 'max:255'],
            'localizacao' => ['nullable', 'string', 'max:255'],
            'obs' => ['nullable', 'string'],
        ];
    }
}
