<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('visitantes')) {
            return;
        }

        Schema::create('visitantes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('telefone', 20)->nullable();
            $table->string('email')->nullable();
            $table->foreignId('celula_id')->nullable()->constrained('celulas')->nullOnDelete();
            $table->date('data_visita');
            $table->string('status', 30)->default('primeira_visita');
            $table->text('observacoes')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitantes');
    }
};
