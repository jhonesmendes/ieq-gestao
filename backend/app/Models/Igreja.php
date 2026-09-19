<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Igreja extends Model
{
    protected $table = 'igrejas';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'nome', 'endereco', 'bairro', 'cidade', 'telefone', 'email',
        'pastor_presidente_id', 'pastor_auxiliar_id',
    ];

    public function pastorPresidente()
    {
        return $this->belongsTo(Usuario::class, 'pastor_presidente_id');
    }

    public function pastorAuxiliar()
    {
        return $this->belongsTo(Usuario::class, 'pastor_auxiliar_id');
    }

    public function celulas()
    {
        return $this->hasMany(Celula::class, 'igreja_id');
    }
}
