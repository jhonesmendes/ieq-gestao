<?php

namespace App\Policies;

use App\Models\Celula;
use App\Models\Usuario;

/**
 * Réplica de pode_editar_celula()/pode_ver_celula() em
 * config/permissoes.php do projeto PHP original.
 */
class CelulaPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return true;
    }

    public function view(Usuario $usuario, Celula $celula): bool
    {
        if ($usuario->isSupervisorOuAcima()) {
            return $usuario->isPastorOuAcima() || $celula->supervisor_id === $usuario->id;
        }

        if ($usuario->isLiderExclusivo()) {
            return $celula->temComoLider($usuario->id);
        }

        // Membro comum: só se pertence à célula.
        return $celula->membros()->where('usuario_id', $usuario->id)->exists();
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->isSupervisorOuAcima();
    }

    public function update(Usuario $usuario, Celula $celula): bool
    {
        if ($usuario->isPastorOuAcima()) {
            return true;
        }

        if ($usuario->funcao === 'supervisor') {
            return $celula->supervisor_id === $usuario->id;
        }

        if ($usuario->isLiderExclusivo()) {
            return $celula->temComoLider($usuario->id);
        }

        return false;
    }

    public function delete(Usuario $usuario, Celula $celula): bool
    {
        if ($usuario->isPastorOuAcima()) {
            return true;
        }

        if ($usuario->funcao === 'supervisor') {
            return $celula->supervisor_id === $usuario->id;
        }

        return false;
    }
}
