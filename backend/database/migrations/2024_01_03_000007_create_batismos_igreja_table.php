<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('batismos_igreja')) {
            return;
        }

        Schema::create('batismos_igreja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('igreja_id')->constrained('igrejas')->cascadeOnDelete();
            $table->string('nome');
            $table->date('data_batismo');
            $table->string('ministro')->nullable();
            $table->string('localizacao')->nullable();
            $table->text('obs')->nullable();
            $table->timestamp('criado_em')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batismos_igreja');
    }
};
