<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReuniaoCelula extends Model
{
    protected $table = 'reunioes_celula';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'celula_id', 'data_reuniao', 'foto_url', 'observacoes',
        'total_presentes', 'total_visitantes',
    ];

    public function celula()
    {
        return $this->belongsTo(Celula::class, 'celula_id');
    }
}
