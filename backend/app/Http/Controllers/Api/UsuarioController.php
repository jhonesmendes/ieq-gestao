<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Admin-only: CRUD de usuários + editor de permissões granular. Réplica
 * de listar_usuarios/criar_usuario/atualizar_usuario/deletar_usuario em
 * api/index.php — todos exigiam admin no PHP original.
 */
class UsuarioController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(function (Request $request, \Closure $next) {
                abort_unless($request->user()->isAdmin(), 403, 'Apenas administradores podem gerenciar usuários.');

                return $next($request);
            }, except: ['alterarSenha']),
        ];
    }

    public function index()
    {
        $usuarios = Usuario::orderBy('nome')->get()->map(fn (Usuario $u) => $this->apresentar($u));

        return response()->json(['status' => 'sucesso', 'dados' => $usuarios]);
    }

    public function store(Request $request)
    {
        $dados = $this->validarDados($request);

        $usuario = Usuario::create([
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'senha' => Hash::make($dados['senha']),
            'telefone' => $dados['telefone'] ?? null,
            'funcao' => $dados['funcao'],
            'permissoes' => $dados['permissoes'] ?? null,
            'status_aprovacao' => 'aprovado',
        ]);

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($usuario)], 201);
    }

    public function update(Request $request, Usuario $usuario)
    {
        $dados = $this->validarDados($request, atualizando: true, usuarioId: $usuario->id);

        if (! empty($dados['senha'])) {
            $usuario->senha = Hash::make($dados['senha']);
        }

        $usuario->fill(array_intersect_key($dados, array_flip(['nome', 'email', 'telefone', 'funcao', 'permissoes'])));
        $usuario->save();

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($usuario)]);
    }

    public function destroy(Request $request, Usuario $usuario)
    {
        if ($usuario->id === $request->user()->id) {
            throw ValidationException::withMessages(['id' => 'Você não pode excluir sua própria conta.']);
        }

        $usuario->delete();

        return response()->json(['status' => 'sucesso']);
    }

    public function alterarSenha(Request $request)
    {
        $dados = $request->validate([
            'senha_atual' => ['required', 'string'],
            'senha_nova' => ['required', 'string', 'min:6'],
        ]);

        $usuario = $request->user();

        if (! Hash::check($dados['senha_atual'], $usuario->senha)) {
            throw ValidationException::withMessages(['senha_atual' => 'Senha atual incorreta.']);
        }

        $usuario->update(['senha' => Hash::make($dados['senha_nova'])]);

        return response()->json(['status' => 'sucesso', 'mensagem' => 'Senha alterada com sucesso.']);
    }

    private function validarDados(Request $request, bool $atualizando = false, ?int $usuarioId = null): array
    {
        $regra = $atualizando ? 'sometimes' : 'required';

        $dados = $request->validate([
            'nome' => [$regra, 'string', 'max:255'],
            'email' => [$regra, 'email', Rule::unique('usuarios', 'email')->ignore($usuarioId)],
            'senha' => [$atualizando ? 'nullable' : 'required', 'string', 'min:6'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'funcao' => [$regra, 'string', Rule::in(['admin', 'pastor', 'supervisor', 'lider', 'lider_treinamento', 'gestor_igreja', 'membro'])],
            'permissoes' => ['nullable', 'array'],
        ]);

        return $dados;
    }

    private function apresentar(Usuario $u): array
    {
        return [
            'id' => $u->id,
            'nome' => $u->nome,
            'email' => $u->email,
            'telefone' => $u->telefone,
            'funcao' => $u->funcao,
            'permissoes' => $u->permissoes,
            'modulos_permitidos' => $u->modulosPermitidos(),
        ];
    }
}
