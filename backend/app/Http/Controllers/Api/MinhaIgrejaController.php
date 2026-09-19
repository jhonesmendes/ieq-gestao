<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;

/**
 * Resolve a igreja do gestor_igreja logado (mesma lógica de
 * obter_igreja_do_gestor() no PHP original) — usada pelo app
 * simplificado da igreja para não precisar de um seletor manual.
 */
class MinhaIgrejaController extends Controller
{
    public function index(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        $igreja = $usuario->igrejaGerenciada();

        return response()->json(['status' => 'sucesso', 'dados' => $igreja]);
    }
}
