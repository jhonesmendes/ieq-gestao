<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('celulas')) {
            return;
        }

        Schema::create('celulas', function (Blueprint $table) {
            $table->id();
            $table->text('nome');
            $table->foreignId('igreja_id')->nullable()->constrained('igrejas')->nullOnDelete();
            $table->text('localizacao')->nullable();
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->foreignId('lider_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('lider_id_2')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('lider_treinamento_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('tipo', 50)->default('celula');
            $table->string('dia_semana', 50)->nullable();
            $table->string('hora', 20)->nullable();
            $table->text('endereco')->nullable();
            $table->string('bairro', 150)->nullable();
            $table->string('cidade', 150)->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('celulas');
    }
};
