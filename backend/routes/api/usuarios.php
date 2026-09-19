<?php

use App\Http\Controllers\Api\CadastroPendenteController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy']);
    Route::post('/usuarios/alterar-senha', [UsuarioController::class, 'alterarSenha']);

    Route::get('/cadastros-pendentes', [CadastroPendenteController::class, 'index']);
    Route::post('/cadastros-pendentes/{cadastroPendente}/aprovar', [CadastroPendenteController::class, 'aprovar']);
    Route::post('/cadastros-pendentes/{cadastroPendente}/rejeitar', [CadastroPendenteController::class, 'rejeitar']);
});
