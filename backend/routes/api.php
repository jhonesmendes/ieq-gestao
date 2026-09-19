<?php

use Illuminate\Support\Facades\Route;

// Fase 0: autenticação. Fase 1: núcleo (células/membros/presença/
// visitantes/igrejas). Fase 2: eventos, cursos, usuários admin,
// sub-recursos de igreja e fila de aprovação de cadastros.
require __DIR__.'/api/auth.php';
require __DIR__.'/api/celulas.php';
require __DIR__.'/api/membros.php';
require __DIR__.'/api/presenca.php';
require __DIR__.'/api/visitantes.php';
require __DIR__.'/api/igrejas.php';
require __DIR__.'/api/eventos.php';
require __DIR__.'/api/cursos.php';
require __DIR__.'/api/usuarios.php';
require __DIR__.'/api/igreja_recursos.php';
require __DIR__.'/api/dashboard.php';
require __DIR__.'/api/minha_igreja.php';
