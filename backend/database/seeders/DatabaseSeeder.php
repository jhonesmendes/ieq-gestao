<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Sem seed padrão: em dev usamos uma cópia de um backup real de
     * produção (ver database/ieq_dev_copy.sqlite), não dados fictícios.
     */
    public function run(): void
    {
        //
    }
}
