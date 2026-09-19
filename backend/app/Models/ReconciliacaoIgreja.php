<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReconciliacaoIgreja extends Model
{
    protected $table = 'reconciliacao_igreja';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = ['igreja_id', 'nome', 'data_reconciliacao', 'obs'];

    public function igreja()
    {
        return $this->belongsTo(Igreja::class, 'igreja_id');
    }
}
