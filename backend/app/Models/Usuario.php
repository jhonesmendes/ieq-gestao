<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Mapeia a tabela `usuarios` (não `users` — schema real do IEQ). Réplica
 * de config/permissoes.php do projeto PHP original: hierarquia de papel
 * fixa + lista de módulos liberados em JSON por usuário, com override
 * forçado para líder/gestor_igreja (sempre restritos ao app simplificado,
 * não importa o que esteja salvo em `permissoes`).
 */
class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';

    // Schema usa criado_em/atualizado_em, não created_at/updated_at.
    const CREATED_AT = 'criado_em';
    const UPDATED_AT = 'atualizado_em';

    protected $fillable = [
        'nome', 'email', 'senha', 'telefone', 'foto_url',
        'google_id', 'funcao', 'status_aprovacao', 'permissoes',
    ];

    protected $hidden = ['senha'];

    protected function casts(): array
    {
        return [
            'permissoes' => 'array',
        ];
    }

    // Sanctum/Auth usam getAuthPassword() — nossa coluna é `senha`, não `password`.
    public function getAuthPassword()
    {
        return $this->senha;
    }

    // --- Hierarquia de papel (ver config/permissoes.php::tem_permissao) ---

    private const NIVEL_HIERARQUIA = [
        'admin' => 5,
        'pastor' => 4,
        'supervisor' => 3,
        'lider' => 2,
        'lider_treinamento' => 2,
        'membro' => 1,
    ];

    public function nivelHierarquia(): int
    {
        return self::NIVEL_HIERARQUIA[$this->funcao] ?? 0;
    }

    public function isAdmin(): bool
    {
        return $this->funcao === 'admin';
    }

    public function isPastorOuAcima(): bool
    {
        return $this->nivelHierarquia() >= self::NIVEL_HIERARQUIA['pastor'];
    }

    public function isSupervisorOuAcima(): bool
    {
        return $this->nivelHierarquia() >= self::NIVEL_HIERARQUIA['supervisor'];
    }

    public function isLiderOuAcima(): bool
    {
        return $this->nivelHierarquia() >= self::NIVEL_HIERARQUIA['lider'];
    }

    // "Líder exclusivo" = líder/líder_treinamento, sem ser supervisor+
    // (mesma semântica de is_lider_exclusivo() no PHP original).
    public function isLiderExclusivo(): bool
    {
        return in_array($this->funcao, ['lider', 'lider_treinamento'], true);
    }

    public function isGestorIgrejaExclusivo(): bool
    {
        return $this->funcao === 'gestor_igreja';
    }

    /**
     * Módulos liberados para este usuário. Admin vê tudo; líder e
     * gestor_igreja são SEMPRE forçados para o app simplificado deles,
     * mesmo que a coluna `permissoes` diga outra coisa (paridade exata
     * com get_permissoes_usuario() do PHP original).
     */
    public function modulosPermitidos(): array
    {
        if ($this->isAdmin()) {
            return ['*'];
        }

        if ($this->isLiderExclusivo()) {
            return ['presenca'];
        }

        if ($this->isGestorIgrejaExclusivo()) {
            return ['igreja_app'];
        }

        return $this->permissoes ?? [];
    }

    public function podeAcessarModulo(string $modulo): bool
    {
        $modulos = $this->modulosPermitidos();

        return in_array('*', $modulos, true) || in_array($modulo, $modulos, true);
    }

    // Células onde este usuário é líder principal, 2º líder ou em treinamento.
    public function celulasComoLider()
    {
        return Celula::query()
            ->where('lider_id', $this->id)
            ->orWhere('lider_id_2', $this->id)
            ->orWhere('lider_treinamento_id', $this->id);
    }

    public function membro()
    {
        return $this->hasOne(Membro::class, 'usuario_id');
    }

    // Réplica de obter_igreja_do_gestor(): a igreja onde este usuário está
    // marcado como pastor presidente ou auxiliar (mesmo vínculo usado
    // para gestor_igreja, ver IgrejaController::pastores()).
    public function igrejaGerenciada(): ?Igreja
    {
        return Igreja::where('pastor_presidente_id', $this->id)
            ->orWhere('pastor_auxiliar_id', $this->id)
            ->first();
    }

    // Réplica de usuario_pode_gerenciar_igreja($igreja_id) em
    // config/permissoes.php.
    public function podeGerenciarIgreja(int $igrejaId): bool
    {
        if ($this->isSupervisorOuAcima()) {
            return true;
        }

        if ($this->isGestorIgrejaExclusivo()) {
            $igreja = $this->igrejaGerenciada();

            return $igreja && $igreja->id === $igrejaId;
        }

        return false;
    }
}
