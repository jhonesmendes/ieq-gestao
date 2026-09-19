<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CadastroPendente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

/**
 * Fluxo Google OAuth, réplica de config/google_oauth.php +
 * pages/callback_google.php do projeto PHP original:
 * - e-mail do Google já existe em `usuarios` → vincula google_id e loga.
 * - e-mail novo → cria um registro em `cadastros_pendentes` aguardando
 *   aprovação do admin (não cria a conta automaticamente).
 * Socialite não faz nada disso sozinho — essa é a parte que precisa
 * ser escrita à mão, mesmo usando o pacote para o handshake OAuth.
 */
class GoogleAuthController extends Controller
{
    public function redirecionar()
    {
        return Socialite::driver('google')->stateless(false)->redirect();
    }

    public function callback(Request $request)
    {
        $googleUser = Socialite::driver('google')->user();

        $usuario = Usuario::where('google_id', $googleUser->getId())->first()
            ?? Usuario::where('email', $googleUser->getEmail())->first();

        if ($usuario) {
            // Conta existente: garante o vínculo do google_id e loga.
            if (! $usuario->google_id) {
                $usuario->update(['google_id' => $googleUser->getId()]);
            }

            if ($usuario->status_aprovacao !== 'aprovado') {
                return $this->redirecionarFrontend('cadastro-pendente');
            }

            $request->session()->regenerate();
            Auth::login($usuario);

            return $this->redirecionarFrontend('dashboard');
        }

        // E-mail novo: fila de aprovação, não cria conta sozinho.
        CadastroPendente::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'nome' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'foto_url' => $googleUser->getAvatar(),
                'status' => 'pendente',
            ]
        );

        return $this->redirecionarFrontend('cadastro-pendente');
    }

    private function redirecionarFrontend(string $rota)
    {
        return redirect(config('app.frontend_url')."/{$rota}");
    }
}
