<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presenca extends Model
{
    protected $table = 'presencas';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'membro_id', 'celula_id', 'data_presenca', 'presente', 'visitante', 'reuniao_id',
    ];

    protected function casts(): array
    {
        return [
            'presente' => 'boolean',
            'visitante' => 'boolean',
            'data_presenca' => 'date',
        ];
    }

    public function membro()
    {
        return $this->belongsTo(Membro::class, 'membro_id');
    }

    public function celula()
    {
        return $this->belongsTo(Celula::class, 'celula_id');
    }
}
