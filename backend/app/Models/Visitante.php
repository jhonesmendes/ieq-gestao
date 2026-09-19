<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitante extends Model
{
    protected $table = 'visitantes';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'nome', 'telefone', 'email', 'celula_id', 'data_visita', 'status', 'observacoes',
    ];

    public function celula()
    {
        return $this->belongsTo(Celula::class, 'celula_id');
    }
}
