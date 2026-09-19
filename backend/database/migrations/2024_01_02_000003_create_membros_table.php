<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('membros')) {
            return;
        }

        Schema::create('membros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('celula_id')->nullable()->constrained('celulas')->nullOnDelete();
            $table->date('data_conversao')->nullable();
            $table->date('data_batismo')->nullable();
            $table->string('status', 30)->default('ativo');
            $table->text('endereco')->nullable();
            $table->string('bairro', 150)->nullable();
            $table->string('cidade', 150)->nullable();
            $table->string('cep', 20)->nullable();
            $table->date('data_nasc')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membros');
    }
};
