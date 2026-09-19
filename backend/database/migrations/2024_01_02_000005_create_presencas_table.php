<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('presencas')) {
            return;
        }

        Schema::create('presencas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membro_id')->constrained('membros')->cascadeOnDelete();
            $table->foreignId('celula_id')->constrained('celulas')->cascadeOnDelete();
            $table->date('data_presenca');
            $table->boolean('presente')->default(true);
            $table->boolean('visitante')->default(false);
            // Sem FK declarada de propósito — mesma decisão do schema original
            // (reuniao_id existe mas não tem constraint formal).
            $table->unsignedBigInteger('reuniao_id')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presencas');
    }
};
