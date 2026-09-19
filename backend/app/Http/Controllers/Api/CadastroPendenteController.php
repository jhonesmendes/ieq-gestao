<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CadastroPendente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Fila de cadastros pendentes (Google sign-ups sem e-mail correspondente
 * em `usuarios`) — réplica de listar/aprovar/rejeitar_cadastro_pendente,
 * admin-only no PHP original.
 */
class CadastroPendenteController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(function (Request $request, \Closure $next) {
                abort_unless($request->user()->isAdmin(), 403, 'Apenas administradores podem gerenciar cadastros pendentes.');

                return $next($request);
            }),
        ];
    }

    public function index()
    {
        $pendentes = CadastroPendente::where('status', 'pendente')->orderBy('criado_em')->get();

        return response()->json(['status' => 'sucesso', 'dados' => $pendentes]);
    }

    public function aprovar(Request $request, CadastroPendente $cadastroPendente)
    {
        $dados = $request->validate([
            'funcao' => ['required', 'string', 'in:admin,pastor,supervisor,lider,lider_treinamento,gestor_igreja,membro'],
        ]);

        $usuario = Usuario::create([
            'nome' => $cadastroPendente->nome,
            'email' => $cadastroPendente->email,
            'senha' => Hash::make(Str::random(32)), // login continua só via Google
            'google_id' => $cadastroPendente->google_id,
            'foto_url' => $cadastroPendente->foto_url,
            'funcao' => $dados['funcao'],
            'status_aprovacao' => 'aprovado',
        ]);

        $cadastroPendente->update(['status' => 'aprovado']);

        return response()->json(['status' => 'sucesso', 'dados' => $usuario]);
    }

    public function rejeitar(Request $request, CadastroPendente $cadastroPendente)
    {
        $dados = $request->validate(['motivo' => ['nullable', 'string']]);

        $cadastroPendente->update([
            'status' => 'rejeitado',
            'motivo_rejeicao' => $dados['motivo'] ?? null,
        ]);

        return response()->json(['status' => 'sucesso']);
    }
}
