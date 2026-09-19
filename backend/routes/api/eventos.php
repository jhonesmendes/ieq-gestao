<?php

use App\Http\Controllers\Api\EventoController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/eventos', [EventoController::class, 'index']);
    Route::get('/eventos/proximos', [EventoController::class, 'proximos']);
    Route::get('/eventos/{evento}', [EventoController::class, 'show']);
    Route::post('/eventos', [EventoController::class, 'store']);
    Route::put('/eventos/{evento}', [EventoController::class, 'update']);
    Route::delete('/eventos/{evento}', [EventoController::class, 'destroy']);
});
