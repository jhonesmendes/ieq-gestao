<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Este backend é só API — não existe rota `login` (Blade) para
        // redirecionar. Sem isso, qualquer requisição não-autenticada
        // sem "Accept: application/json" derruba a aplicação com 500
        // (RouteNotFoundException) em vez de simplesmente responder 401.
        Authenticate::redirectUsing(fn () => null);
    }
}
