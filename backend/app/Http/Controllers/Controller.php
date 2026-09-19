<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * O skeleton padrão do Laravel 11 deixa essa classe vazia — sem a trait
 * abaixo, qualquer `$this->authorize(...)` nos controllers (usado em
 * CelulaController, por exemplo) quebra com "Call to undefined method".
 */
abstract class Controller
{
    use AuthorizesRequests;
}
