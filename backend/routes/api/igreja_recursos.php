<?php

use App\Http\Controllers\Api\BatismoIgrejaController;
use App\Http\Controllers\Api\ConversaoIgrejaController;
use App\Http\Controllers\Api\EventoIgrejaController;
use App\Http\Controllers\Api\ReconciliacaoIgrejaController;
use App\Http\Controllers\Api\VisitanteIgrejaController;
use Illuminate\Support\Facades\Route;

// Sub-recursos de uma igreja (eventos/visitantes/conversões/reconciliação/
// batismos) — só criar/listar/deletar, igual ao PHP original. Cada um
// gated por Usuario::podeGerenciarIgreja() dentro do controller base
// (App\Http\Controllers\Api\Concerns\IgrejaRecursoController).
Route::middleware('auth:sanctum')->group(function () {
    // Leitura livre da agenda — precisa vir antes de index() no registro de
    // rotas por ser mais específica, embora aqui não haja conflito de path.
    Route::get('/igrejas-eventos/proximos', [EventoIgrejaController::class, 'proximos']);
    Route::get('/igrejas-eventos', [EventoIgrejaController::class, 'index']);
    Route::post('/igrejas-eventos', [EventoIgrejaController::class, 'store']);
    Route::delete('/igrejas-eventos/{id}', [EventoIgrejaController::class, 'destroy']);

    Route::get('/igrejas-visitantes', [VisitanteIgrejaController::class, 'index']);
    Route::post('/igrejas-visitantes', [VisitanteIgrejaController::class, 'store']);
    Route::delete('/igrejas-visitantes/{id}', [VisitanteIgrejaController::class, 'destroy']);

    Route::get('/igrejas-conversoes', [ConversaoIgrejaController::class, 'index']);
    Route::post('/igrejas-conversoes', [ConversaoIgrejaController::class, 'store']);
    Route::delete('/igrejas-conversoes/{id}', [ConversaoIgrejaController::class, 'destroy']);

    Route::get('/igrejas-reconciliacao', [ReconciliacaoIgrejaController::class, 'index']);
    Route::post('/igrejas-reconciliacao', [ReconciliacaoIgrejaController::class, 'store']);
    Route::delete('/igrejas-reconciliacao/{id}', [ReconciliacaoIgrejaController::class, 'destroy']);

    Route::get('/igrejas-batismos', [BatismoIgrejaController::class, 'index']);
    Route::post('/igrejas-batismos', [BatismoIgrejaController::class, 'store']);
    Route::delete('/igrejas-batismos/{id}', [BatismoIgrejaController::class, 'destroy']);
});
