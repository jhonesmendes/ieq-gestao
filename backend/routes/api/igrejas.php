<?php

use App\Http\Controllers\Api\IgrejaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/igrejas', [IgrejaController::class, 'index']);
    Route::get('/igrejas/pastores', [IgrejaController::class, 'pastores']);
    Route::get('/igrejas/{igreja}/relatorio', [IgrejaController::class, 'relatorio']);
    Route::get('/igrejas/{igreja}', [IgrejaController::class, 'show']);
    Route::post('/igrejas', [IgrejaController::class, 'store']);
    Route::put('/igrejas/{igreja}', [IgrejaController::class, 'update']);
    Route::delete('/igrejas/{igreja}', [IgrejaController::class, 'destroy']);
});
