<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventoIgreja extends Model
{
    protected $table = 'eventos_igreja';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'igreja_id', 'nome', 'descricao', 'data_evento', 'localizacao', 'responsavel_id', 'tipo', 'vagas',
    ];

    public function igreja()
    {
        return $this->belongsTo(Igreja::class, 'igreja_id');
    }
}
