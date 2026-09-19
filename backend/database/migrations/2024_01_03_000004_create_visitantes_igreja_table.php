<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('visitantes_igreja')) {
            return;
        }

        Schema::create('visitantes_igreja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('igreja_id')->constrained('igrejas')->cascadeOnDelete();
            $table->string('nome');
            $table->string('telefone', 50)->nullable();
            $table->string('email')->nullable();
            $table->date('data_visita');
            $table->text('obs')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitantes_igreja');
    }
};
