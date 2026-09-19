<?php

use App\Http\Controllers\Api\CelulaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/celulas', [CelulaController::class, 'index']);
    Route::get('/celulas/lideres', [CelulaController::class, 'lideres']);
    Route::get('/celulas/lideres-treinamento', [CelulaController::class, 'lideresTreinamento']);
    Route::get('/celulas/{celula}', [CelulaController::class, 'show']);
    Route::post('/celulas', [CelulaController::class, 'store']);
    Route::put('/celulas/{celula}', [CelulaController::class, 'update']);
    Route::delete('/celulas/{celula}', [CelulaController::class, 'destroy']);
});
