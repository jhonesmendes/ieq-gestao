<?php

use App\Http\Controllers\Api\VisitanteController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/visitantes', [VisitanteController::class, 'index']);
    Route::get('/visitantes/{visitante}', [VisitanteController::class, 'show']);
    Route::post('/visitantes', [VisitanteController::class, 'store']);
    Route::put('/visitantes/{visitante}', [VisitanteController::class, 'update']);
    Route::delete('/visitantes/{visitante}', [VisitanteController::class, 'destroy']);
});
