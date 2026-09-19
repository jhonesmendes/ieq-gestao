<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cursos')) {
            return;
        }

        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->text('nome');
            $table->text('descricao')->nullable();
            $table->foreignId('professor_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->text('localizacao')->nullable();
            $table->integer('vagas')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
