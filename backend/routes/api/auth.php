<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use Illuminate\Support\Facades\Route;

// Rotas públicas com rate limiting nativo do Laravel (substitui a tabela
// `rate_limiting` custom do PHP original — mesmo objetivo, menos código).
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/registrar', [AuthController::class, 'registrar']);
    Route::post('/recuperar-senha', [AuthController::class, 'solicitarRecuperacaoSenha']);
});

Route::get('/recuperar-senha/validar', [AuthController::class, 'validarTokenRecuperacao']);
Route::post('/redefinir-senha', [AuthController::class, 'redefinirSenha']);

Route::get('/auth/google/redirecionar', [GoogleAuthController::class, 'redirecionar']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
