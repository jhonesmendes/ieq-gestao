<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Documenta o schema real de `usuarios` (produção). Guardado com
 * hasTable() porque, em dev, essa tabela já existe numa cópia de backup
 * real — nunca recriar; em um banco novo (ex: CI), cria do zero.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('usuarios')) {
            return;
        }

        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->text('nome');
            $table->string('email')->unique();
            $table->text('senha');
            $table->string('telefone', 50)->nullable();
            $table->text('foto_url')->nullable();
            $table->string('google_id')->nullable();
            $table->string('funcao', 50)->default('membro');
            $table->string('status_aprovacao', 50)->default('aprovado');
            // Lista de módulos liberados (JSON), só usada para papéis fora
            // da hierarquia fixa — ver App\Services\PermissaoService.
            $table->text('permissoes')->nullable();
            $table->timestamp('criado_em')->useCurrent();
            $table->timestamp('atualizado_em')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
