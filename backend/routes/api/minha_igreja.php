<?php

use App\Http\Controllers\Api\MinhaIgrejaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/minha-igreja', [MinhaIgrejaController::class, 'index']);
