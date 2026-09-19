<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CadastroPendente extends Model
{
    protected $table = 'cadastros_pendentes';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'nome', 'email', 'google_id', 'foto_url', 'status', 'motivo_rejeicao',
    ];
}
