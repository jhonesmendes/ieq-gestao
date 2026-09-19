<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Celula extends Model
{
    protected $table = 'celulas';

    const CREATED_AT = 'criado_em';
    const UPDATED_AT = null;

    protected $fillable = [
        'nome', 'igreja_id', 'localizacao', 'latitude', 'longitude',
        'lider_id', 'lider_id_2', 'lider_treinamento_id', 'supervisor_id',
        'tipo', 'dia_semana', 'hora', 'endereco', 'bairro', 'cidade',
    ];

    public function igreja()
    {
        return $this->belongsTo(Igreja::class, 'igreja_id');
    }

    public function lider()
    {
        return $this->belongsTo(Usuario::class, 'lider_id');
    }

    public function lider2()
    {
        return $this->belongsTo(Usuario::class, 'lider_id_2');
    }

    public function liderTreinamento()
    {
        return $this->belongsTo(Usuario::class, 'lider_treinamento_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(Usuario::class, 'supervisor_id');
    }

    public function membros()
    {
        return $this->hasMany(Membro::class, 'celula_id');
    }

    public function membrosAtivos()
    {
        return $this->membros()->where('status', 'ativo');
    }

    public function visitantes()
    {
        return $this->hasMany(Visitante::class, 'celula_id');
    }

    public function presencas()
    {
        return $this->hasMany(Presenca::class, 'celula_id');
    }

    public function reunioes()
    {
        return $this->hasMany(ReuniaoCelula::class, 'celula_id');
    }

    // Este usuário lidera essa célula (principal, 2º líder ou em treinamento)?
    public function temComoLider(int $usuarioId): bool
    {
        return in_array($usuarioId, [$this->lider_id, $this->lider_id_2, $this->lider_treinamento_id], true);
    }

    /**
     * Escopo replicando listar_celulas()/get_celulas_visiveis() do PHP
     * original: admin/pastor veem tudo, supervisor vê as que supervisiona,
     * líder vê só as suas.
     */
    public function scopeVisivelPara(Builder $query, Usuario $usuario): Builder
    {
        if ($usuario->isPastorOuAcima()) {
            return $query;
        }

        if ($usuario->funcao === 'supervisor') {
            return $query->where('supervisor_id', $usuario->id);
        }

        if ($usuario->isLiderExclusivo()) {
            return $query->where(function (Builder $q) use ($usuario) {
                $q->where('lider_id', $usuario->id)
                    ->orWhere('lider_id_2', $usuario->id)
                    ->orWhere('lider_treinamento_id', $usuario->id);
            });
        }

        // Membro comum: só a célula onde ele está cadastrado (via membros).
        return $query->whereIn('id', function ($sub) use ($usuario) {
            $sub->select('celula_id')->from('membros')->where('usuario_id', $usuario->id);
        });
    }
}
