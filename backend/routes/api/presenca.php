<?php

use App\Http\Controllers\Api\PresencaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/presenca/registrar', [PresencaController::class, 'registrarPresenca']);
    Route::post('/presenca/salvar-reuniao', [PresencaController::class, 'salvarReuniao']);
    Route::get('/presenca/reunioes', [PresencaController::class, 'listarReunioes']);
    Route::get('/presenca/estatisticas-celula', [PresencaController::class, 'estatisticasCelula']);
    Route::get('/presenca/relatorio', [PresencaController::class, 'relatorioPresenca']);
    Route::post('/presenca/exportar-excel', [PresencaController::class, 'exportarExcel']);
});
