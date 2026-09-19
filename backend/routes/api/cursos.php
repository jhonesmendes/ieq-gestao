<?php

use App\Http\Controllers\Api\CursoController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cursos', [CursoController::class, 'index']);
    Route::get('/cursos/{curso}', [CursoController::class, 'show']);
    Route::post('/cursos', [CursoController::class, 'store']);
    Route::put('/cursos/{curso}', [CursoController::class, 'update']);
    Route::delete('/cursos/{curso}', [CursoController::class, 'destroy']);
});
