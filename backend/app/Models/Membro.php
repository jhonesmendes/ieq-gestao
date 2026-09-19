<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Membro extends Model
{
    protected $table = 'membros';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'usuario_id', 'celula_id', 'data_conversao', 'data_batismo',
        'status', 'endereco', 'bairro', 'cidade', 'cep', 'data_nasc',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function celula()
    {
        return $this->belongsTo(Celula::class, 'celula_id');
    }

    public function presencas()
    {
        return $this->hasMany(Presenca::class, 'membro_id');
    }
}
