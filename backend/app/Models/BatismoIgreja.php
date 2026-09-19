<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatismoIgreja extends Model
{
    protected $table = 'batismos_igreja';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = ['igreja_id', 'nome', 'data_batismo', 'ministro', 'localizacao', 'obs'];

    public function igreja()
    {
        return $this->belongsTo(Igreja::class, 'igreja_id');
    }
}
