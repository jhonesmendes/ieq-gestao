<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('recuperacao_senha')) {
            return;
        }

        Schema::create('recuperacao_senha', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('token', 100)->unique();
            $table->string('email');
            $table->boolean('usado')->default(false);
            $table->timestamp('criado_em')->useCurrent();
            $table->dateTime('expira_em');
            $table->dateTime('usado_em')->nullable();
            $table->string('ip_request', 45)->nullable();

            $table->index('token');
            $table->index('expira_em');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recuperacao_senha');
    }
};
