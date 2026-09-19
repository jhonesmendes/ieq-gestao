<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecuperacaoSenha;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Auth por sessão/cookie (Sanctum SPA), equivalente às ações
 * login/registrar/solicitar_recuperacao_senha/redefinir_senha de
 * api/index.php no projeto PHP original. Rate limiting usa o throttle
 * nativo do Laravel em vez da tabela `rate_limiting` custom.
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $dados = $request->validate([
            'email' => ['required', 'email'],
            'senha' => ['required', 'string'],
        ]);

        $usuario = Usuario::where('email', $dados['email'])->first();

        if (! $usuario || ! Hash::check($dados['senha'], $usuario->senha)) {
            throw ValidationException::withMessages([
                'email' => 'E-mail ou senha inválidos.',
            ]);
        }

        if ($usuario->status_aprovacao !== 'aprovado') {
            throw ValidationException::withMessages([
                'email' => 'Seu cadastro ainda está aguardando aprovação.',
            ]);
        }

        $request->session()->regenerate();
        Auth::login($usuario);

        return response()->json([
            'status' => 'sucesso',
            'dados' => $this->apresentarUsuario($usuario),
        ]);
    }

    public function registrar(Request $request)
    {
        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:usuarios,email'],
            'senha' => ['required', 'string', 'min:6'],
            'telefone' => ['nullable', 'string', 'max:50'],
        ]);

        $usuario = Usuario::create([
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'senha' => Hash::make($dados['senha']),
            'telefone' => $dados['telefone'] ?? null,
            'funcao' => 'membro',
            'status_aprovacao' => 'aprovado',
        ]);

        $request->session()->regenerate();
        Auth::login($usuario);

        return response()->json([
            'status' => 'sucesso',
            'dados' => $this->apresentarUsuario($usuario),
        ], 201);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['status' => 'sucesso']);
    }

    public function me(Request $request)
    {
        $usuario = $request->user();

        if (! $usuario) {
            return response()->json(['status' => 'erro', 'mensagem' => 'Não autenticado'], 401);
        }

        return response()->json([
            'status' => 'sucesso',
            'dados' => $this->apresentarUsuario($usuario),
        ]);
    }

    public function solicitarRecuperacaoSenha(Request $request)
    {
        $dados = $request->validate(['email' => ['required', 'email']]);

        $usuario = Usuario::where('email', $dados['email'])->first();

        // Resposta sempre genérica — não revela se o e-mail existe ou não
        // (mesma proteção contra enumeração de usuários do PHP original).
        if ($usuario) {
            RecuperacaoSenha::where('usuario_id', $usuario->id)
                ->where('usado', false)
                ->update(['usado' => true]);

            $token = Str::random(64);

            RecuperacaoSenha::create([
                'usuario_id' => $usuario->id,
                'token' => $token,
                'email' => $usuario->email,
                'expira_em' => now()->addHour(),
                'ip_request' => $request->ip(),
            ]);

            // TODO Fase 1: usar uma Mailable de verdade com o link de reset.
            Mail::raw(
                "Use este link para redefinir sua senha: ".config('app.frontend_url')."/redefinir-senha?token={$token}",
                fn ($m) => $m->to($usuario->email)->subject('Redefinição de senha — IEQ Gestão')
            );
        }

        return response()->json([
            'status' => 'sucesso',
            'mensagem' => 'Se o e-mail existir, enviamos um link de redefinição.',
        ]);
    }

    public function validarTokenRecuperacao(Request $request)
    {
        $token = $request->query('token');
        $registro = RecuperacaoSenha::where('token', $token)->first();

        if (! $registro) {
            return response()->json(['status' => 'erro', 'motivo' => 'nao_encontrado'], 404);
        }
        if ($registro->usado) {
            return response()->json(['status' => 'erro', 'motivo' => 'usado'], 410);
        }
        if ($registro->expirado()) {
            return response()->json(['status' => 'erro', 'motivo' => 'expirado'], 410);
        }

        return response()->json(['status' => 'sucesso']);
    }

    public function redefinirSenha(Request $request)
    {
        $dados = $request->validate([
            'token' => ['required', 'string'],
            'senha' => ['required', 'string', 'min:6'],
        ]);

        $registro = RecuperacaoSenha::where('token', $dados['token'])->first();

        if (! $registro || $registro->usado || $registro->expirado()) {
            return response()->json(['status' => 'erro', 'mensagem' => 'Token inválido ou expirado.'], 422);
        }

        $registro->usuario->update(['senha' => Hash::make($dados['senha'])]);
        $registro->update(['usado' => true, 'usado_em' => now()]);

        return response()->json(['status' => 'sucesso', 'mensagem' => 'Senha redefinida com sucesso.']);
    }

    private function apresentarUsuario(Usuario $usuario): array
    {
        return [
            'id' => $usuario->id,
            'nome' => $usuario->nome,
            'email' => $usuario->email,
            'funcao' => $usuario->funcao,
            'foto_url' => $usuario->foto_url,
            'modulos_permitidos' => $usuario->modulosPermitidos(),
        ];
    }
}
