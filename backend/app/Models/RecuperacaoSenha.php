<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecuperacaoSenha extends Model
{
    protected $table = 'recuperacao_senha';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'usuario_id', 'token', 'email', 'usado', 'expira_em', 'usado_em', 'ip_request',
    ];

    protected function casts(): array
    {
        return [
            'usado' => 'boolean',
            'expira_em' => 'datetime',
            'usado_em' => 'datetime',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function expirado(): bool
    {
        return $this->expira_em->isPast();
    }
}
