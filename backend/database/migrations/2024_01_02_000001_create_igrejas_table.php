<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('igrejas')) {
            return;
        }

        Schema::create('igrejas', function (Blueprint $table) {
            $table->id();
            $table->text('nome');
            $table->text('endereco')->nullable();
            $table->string('bairro', 150)->nullable();
            $table->string('cidade', 150)->nullable();
            $table->string('telefone', 50)->nullable();
            $table->string('email')->nullable();
            $table->foreignId('pastor_presidente_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->foreignId('pastor_auxiliar_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('igrejas');
    }
};
