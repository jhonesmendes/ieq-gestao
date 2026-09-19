<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('reunioes_celula')) {
            return;
        }

        Schema::create('reunioes_celula', function (Blueprint $table) {
            $table->id();
            $table->foreignId('celula_id')->constrained('celulas')->cascadeOnDelete();
            $table->date('data_reuniao');
            $table->text('foto_url')->nullable();
            $table->text('observacoes')->nullable();
            $table->integer('total_presentes')->default(0);
            $table->integer('total_visitantes')->default(0);
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reunioes_celula');
    }
};
