<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $table = 'cursos';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'nome', 'descricao', 'professor_id', 'data_inicio', 'data_fim', 'localizacao', 'vagas',
    ];

    public function professor()
    {
        return $this->belongsTo(Usuario::class, 'professor_id');
    }
}
