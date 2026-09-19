<?php

use App\Http\Controllers\Api\MembroController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/membros', [MembroController::class, 'index']);
    Route::get('/membros/{membro}', [MembroController::class, 'show']);
    Route::post('/membros', [MembroController::class, 'store']);
    Route::put('/membros/{membro}', [MembroController::class, 'update']);
    Route::delete('/membros/{membro}', [MembroController::class, 'destroy']);
});
