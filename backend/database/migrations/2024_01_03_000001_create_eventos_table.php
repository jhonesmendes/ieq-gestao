<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('eventos')) {
            return;
        }

        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->text('nome');
            $table->text('descricao')->nullable();
            $table->dateTime('data_evento');
            $table->text('localizacao')->nullable();
            $table->foreignId('responsavel_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('tipo', 50)->nullable();
            $table->integer('vagas')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};
