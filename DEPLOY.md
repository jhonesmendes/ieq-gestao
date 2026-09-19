# Fase 6 — Corte de produção (Laravel + React no aaPanel)

Este passo a passo assume o mesmo domínio que o PHP atual usa
(`www.ieqroo.com.br`) e o mesmo banco MySQL de produção
(`jhones09_eie64z`) — sem exportar/importar dados, só trocar o backend
que aponta pra ele.

Eu não tenho acesso ao aaPanel nem às credenciais reais — os passos
abaixo precisam ser executados por você (ou meu apoio remoto via
comandos que você roda e me cola o resultado).

## 0. Pré-requisitos no aaPanel

- PHP 8.2+ com as extensões: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`,
  `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `gd` (para Intervention Image
  e PhpSpreadsheet).
- Composer disponível via SSH (ou terminal do aaPanel).
- Node.js 18+ disponível só para o build do frontend (pode ser feito
  localmente, aqui na sua máquina, e só enviar o resultado — não precisa
  Node no servidor).

## 1. Criar um novo site no aaPanel (deploy lado a lado)

Para não arriscar o `ieq/` atual, crie um **subdomínio de teste primeiro**,
por exemplo `beta.ieqroo.com.br`, apontando para uma nova pasta
(ex: `/www/wwwroot/ieq-v2`). Só depois de validar tudo nesse subdomínio é
que trocamos o domínio principal.

- Document root do site: `/www/wwwroot/ieq-v2/backend/public`
- PHP: mesma versão usada pelo `ieq/` atual.

## 2. Enviar o código

Envie as pastas `backend/` e `frontend/` (sem `node_modules/`,
`vendor/`, `.env`) para `/www/wwwroot/ieq-v2/` no servidor, via Git,
FTP ou o gerenciador de arquivos do aaPanel.

## 3. Backend — instalar e configurar

No terminal do aaPanel (dentro de `backend/`):

```bash
composer install --no-dev --optimize-autoloader
cp .env.production.example .env
```

Edite o `.env` recém-criado e preencha:
- `DB_USERNAME` / `DB_PASSWORD` — as mesmas credenciais reais que estão
  em `ieq/.env` (`DB_USER`/`DB_PASS`) hoje.
- `APP_URL` / `SANCTUM_STATEFUL_DOMAINS` / `SESSION_DOMAIN` /
  `GOOGLE_REDIRECT_URI` — troque `www.ieqroo.com.br` pelo domínio real que
  você for usar nesse teste (ex: `beta.ieqroo.com.br`).

Depois:

```bash
php artisan key:generate
php artisan storage:link
chmod -R 775 storage bootstrap/cache
```

**Não rode `php artisan migrate`** — o banco já existe e tem os dados
reais; as migrations deste projeto só documentam o schema (guardadas
com `if (Schema::hasTable(...)) return;`) e não devem recriar nada.

## 4. Frontend — build e publicação

Na sua máquina (não precisa ser no servidor):

```bash
cd frontend
npm run build
```

Isso gera `frontend/dist/`. Copie **o conteúdo** dessa pasta (não a
pasta em si) para dentro de `backend/public/` no servidor — os arquivos
`index.html` e `assets/` do React devem ficar ao lado do `index.php`
que já existe lá.

A rota coringa em `routes/web.php` (já preparada) serve esse
`index.html` para qualquer URL que não seja `/api`, `/sanctum` ou
`/storage`, então o React Router funciona mesmo em recarregar página
(F5) ou link direto.

## 5. Google OAuth (se for usar login com Google)

No Google Cloud Console, na tela de credenciais OAuth do projeto,
adicione a nova Redirect URI:
`https://beta.ieqroo.com.br/api/auth/google/callback`
(troque pelo domínio final quando migrar de vez).

## 6. Testar no subdomínio antes de qualquer coisa

Checklist mínimo, com um usuário de teste (nunca o admin real numa
primeira rodada):

- [ ] Login funciona (`/api/login` retorna cookie de sessão).
- [ ] Dashboard carrega dados reais.
- [ ] Lançar uma reunião com foto em Presença e conferir que a foto
      aparece na Galeria.
- [ ] Exportar relatório de presença em Excel e abrir o arquivo.
- [ ] Login como líder e confirmar que só vê a própria célula.
- [ ] Fluxo de aprovação de cadastro Google (se configurado).
- [ ] Abrir o `beta.ieqroo.com.br` dentro do app mobile Capacitor
      (mudar temporariamente a `url` em `ieq-mobile/capacitor.config.json`
      para o subdomínio de teste, rebuild do app) e repetir login +
      lançar presença dentro da WebView.

## 7. Corte final (só depois do checklist acima 100% ok)

1. Repita os passos 2–5 apontando para o domínio de produção real
   (`www.ieqroo.com.br`), com o `.env` de produção definitivo.
2. Mantenha o `ieq/` (PHP atual) no ar em paralelo por uma janela de
   verificação (ex: alguns dias), sem apagar nada.
3. Só depois de confirmar que está tudo estável, mova o document root
   do domínio principal no aaPanel para `ieq-v2/backend/public` e
   desative o site do `ieq/` antigo (sem deletar os arquivos ainda).
4. Restaure a `url` do `ieq-mobile/capacitor.config.json` para o
   domínio principal definitivo e gere o build final do app mobile.

## Observações de segurança

- Nunca commitar `.env` com credenciais reais.
- `APP_DEBUG=false` é obrigatório em produção (evita vazar stack trace
  com dados sensíveis em erros).
- Gere um `APP_KEY` novo para o ambiente de produção (`php artisan
  key:generate`), não reaproveite o de desenvolvimento local.
