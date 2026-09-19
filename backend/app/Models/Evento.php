<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
    protected $table = 'eventos';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'nome', 'descricao', 'data_evento', 'localizacao', 'responsavel_id', 'tipo', 'vagas',
    ];

    protected function casts(): array
    {
        return ['data_evento' => 'datetime'];
    }

    public function responsavel()
    {
        return $this->belongsTo(Usuario::class, 'responsavel_id');
    }
}
