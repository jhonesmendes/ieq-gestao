<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Celula;
use App\Models\Membro;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MembroController extends Controller
{
    public function index(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        $query = Membro::query()->with(['usuario:id,nome,email,telefone,funcao', 'celula:id,nome']);

        if ($celulaId = $request->query('celula_id')) {
            $query->where('celula_id', $celulaId);
        }

        // Líder exclusivo só vê membros das próprias células (mesma
        // restrição de listar_membros() no PHP original).
        if ($usuario->isLiderExclusivo()) {
            $query->whereIn('celula_id', $usuario->celulasComoLider()->pluck('id'));
        } elseif ($usuario->funcao === 'supervisor') {
            $query->whereIn('celula_id', Celula::where('supervisor_id', $usuario->id)->pluck('id'));
        }

        $membros = $query->orderBy('id', 'desc')->get()->map(fn (Membro $m) => $this->apresentar($m));

        return response()->json(['status' => 'sucesso', 'dados' => $membros]);
    }

    public function show(Membro $membro)
    {
        $membro->load(['usuario:id,nome,email,telefone,funcao', 'celula:id,nome']);

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($membro)]);
    }

    /**
     * Cria o usuário (senha padrão, igual ao fluxo atual) + o registro de
     * membro numa transação — réplica do fluxo de 2 chamadas
     * (registrar → criar_membro) que o front PHP fazia manualmente.
     */
    public function store(Request $request)
    {
        /** @var Usuario $usuarioLogado */
        $usuarioLogado = $request->user();

        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:usuarios,email'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'celula_id' => ['required', 'exists:celulas,id'],
            'funcao' => ['nullable', 'string', 'in:membro,lider,visitante'],
            'status' => ['nullable', 'string', 'in:ativo,inativo'],
            'data_conversao' => ['nullable', 'date'],
            'data_batismo' => ['nullable', 'date'],
            'data_nasc' => ['nullable', 'date'],
        ]);

        $this->garantirPermissaoNaCelula($usuarioLogado, $dados['celula_id']);

        $membro = DB::transaction(function () use ($dados) {
            $usuario = Usuario::create([
                'nome' => $dados['nome'],
                'email' => $dados['email'] ?? strtolower(str_replace(' ', '.', $dados['nome'])).'.'.uniqid().'@ieq.local',
                'senha' => Hash::make('123456'), // senha padrão — mesmo comportamento do PHP original
                'telefone' => $dados['telefone'] ?? null,
                'funcao' => $dados['funcao'] ?? 'membro',
                'status_aprovacao' => 'aprovado',
            ]);

            return Membro::create([
                'usuario_id' => $usuario->id,
                'celula_id' => $dados['celula_id'],
                'status' => $dados['status'] ?? 'ativo',
                'data_conversao' => $dados['data_conversao'] ?? null,
                'data_batismo' => $dados['data_batismo'] ?? null,
                'data_nasc' => $dados['data_nasc'] ?? null,
            ]);
        });

        $membro->load(['usuario:id,nome,email,telefone,funcao', 'celula:id,nome']);

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($membro)], 201);
    }

    public function update(Request $request, Membro $membro)
    {
        /** @var Usuario $usuarioLogado */
        $usuarioLogado = $request->user();
        $this->garantirPermissaoNaCelula($usuarioLogado, $membro->celula_id);

        $dados = $request->validate([
            'nome' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'unique:usuarios,email,'.$membro->usuario_id],
            'telefone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'celula_id' => ['sometimes', 'exists:celulas,id'],
            'status' => ['sometimes', 'string', 'in:ativo,inativo'],
            'data_conversao' => ['sometimes', 'nullable', 'date'],
            'data_batismo' => ['sometimes', 'nullable', 'date'],
            'data_nasc' => ['sometimes', 'nullable', 'date'],
        ]);

        // Líder exclusivo não pode transferir o membro para outra célula
        // (mesma trava do PHP original).
        if ($usuarioLogado->isLiderExclusivo() && isset($dados['celula_id']) && $dados['celula_id'] != $membro->celula_id) {
            throw ValidationException::withMessages(['celula_id' => 'Você não pode transferir membros para outra célula.']);
        }

        $membro->usuario->update(array_intersect_key($dados, array_flip(['nome', 'email', 'telefone'])));
        $membro->update(array_intersect_key($dados, array_flip(['celula_id', 'status', 'data_conversao', 'data_batismo', 'data_nasc'])));

        $membro->load(['usuario:id,nome,email,telefone,funcao', 'celula:id,nome']);

        return response()->json(['status' => 'sucesso', 'dados' => $this->apresentar($membro)]);
    }

    /**
     * "Excluir" aqui é remover o membro desta célula, não apagar a pessoa
     * do sistema — um delete físico falharia de qualquer forma por causa
     * do histórico de presença (FK de presencas.membro_id), e apagar esse
     * histórico junto não é o que se quer. Some da lista da célula mas o
     * cadastro (usuário + presenças antigas) continua intacto.
     */
    public function destroy(Request $request, Membro $membro)
    {
        /** @var Usuario $usuarioLogado */
        $usuarioLogado = $request->user();
        $this->garantirPermissaoNaCelula($usuarioLogado, $membro->celula_id);

        $membro->update(['celula_id' => null, 'status' => 'inativo']);

        return response()->json(['status' => 'sucesso']);
    }

    private function garantirPermissaoNaCelula(Usuario $usuario, int $celulaId): void
    {
        if ($usuario->isPastorOuAcima()) {
            return;
        }

        if ($usuario->isLiderExclusivo() && ! $usuario->celulasComoLider()->where('id', $celulaId)->exists()) {
            throw ValidationException::withMessages(['celula_id' => 'Você só pode gerenciar membros da sua própria célula.']);
        }
    }

    private function apresentar(Membro $m): array
    {
        return [
            'id' => $m->id,
            'nome' => $m->usuario?->nome,
            'email' => $m->usuario?->email,
            'telefone' => $m->usuario?->telefone,
            'funcao' => $m->usuario?->funcao,
            'celula_id' => $m->celula_id,
            'celula_nome' => $m->celula?->nome,
            'status' => $m->status,
            'data_conversao' => $m->data_conversao,
            'data_batismo' => $m->data_batismo,
            'data_nasc' => $m->data_nasc,
        ];
    }
}
