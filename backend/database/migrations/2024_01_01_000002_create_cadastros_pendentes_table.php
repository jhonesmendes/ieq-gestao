<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cadastros_pendentes')) {
            return;
        }

        Schema::create('cadastros_pendentes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('email')->unique();
            $table->string('google_id')->nullable();
            $table->text('foto_url')->nullable();
            $table->string('status', 50)->default('pendente');
            $table->text('motivo_rejeicao')->nullable();
            $table->timestamp('criado_em')->useCurrent();
            $table->timestamp('atualizado_em')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cadastros_pendentes');
    }
};
