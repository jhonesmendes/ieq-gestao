<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum SPA (cookie-based) auth — o React roda em outra origem
        // (Vite dev server / build estático) mas no mesmo domínio de topo,
        // então usamos cookies httpOnly em vez de token Bearer. Isso replica
        // o comportamento do PHP atual (sessão nativa) e mantém o app
        // mobile Capacitor funcionando sem mudança (mesma origem, mesmo cookie).
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Backend 100% API (sem Blade/rota `login`) — sem isso, o handler
        // padrão do Laravel tenta redirecionar requisições não-autenticadas
        // para route('login') quando o header Accept não pede JSON
        // explicitamente, e quebra com 500 (RouteNotFoundException) em vez
        // de simplesmente responder 401.
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return response()->json(['status' => 'erro', 'mensagem' => 'Não autenticado.'], 401);
        });
    })->create();
