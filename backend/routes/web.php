<?php

use Illuminate\Support\Facades\Route;

// Produção: o build do React (frontend/dist) é copiado para public/, e esta
// rota "coringa" devolve o index.html dele para qualquer caminho que não seja
// api/sanctum/storage — necessário para o React Router funcionar ao recarregar
// a página (F5) ou acessar direto uma URL como /celulas, não só navegando pela SPA.
Route::get('/{any}', function () {
    $index = public_path('index.html');

    if (!file_exists($index)) {
        return response('Frontend não publicado em public/. Rode o build do React e copie dist/ para public/.', 500);
    }

    return response()->file($index);
})->where('any', '^(?!api|sanctum|storage).*$');
