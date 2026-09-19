<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('reconciliacao_igreja')) {
            return;
        }

        Schema::create('reconciliacao_igreja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('igreja_id')->constrained('igrejas')->cascadeOnDelete();
            $table->string('nome');
            $table->date('data_reconciliacao');
            $table->text('obs')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reconciliacao_igreja');
    }
};
