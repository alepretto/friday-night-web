# Friday Night Web

Frontend do **Friday Night** — assistente pessoal de finanças, construído com **SvelteKit 5**, **TypeScript** e **TailwindCSS v4**.

## Stack

- SvelteKit 2 + Svelte 5 (runes)
- TypeScript
- TailwindCSS v4
- bun

## Como executar

### Desenvolvimento local

```bash
bun install       # instalar dependências
bun run dev       # dev server em http://localhost:5173
```

Requer a API rodando em `http://localhost:8000` (ver `friday-night-api/`).

### Docker

```bash
docker build -t friday-night-web .
docker run -e API_BASE_URL=http://localhost:8000/api/v1 -p 3000:3000 friday-night-web
```

Ou via docker-compose na raiz do monorepo:

```bash
docker compose up web
```

## Variáveis de ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `API_BASE_URL` | URL base da API (server-side) | `http://localhost:8000/api/v1` |
| `PORT` | Porta do servidor de produção | `3000` |

## Comandos

```bash
bun run dev       # dev server
bun run build     # build de produção
bun run preview   # preview do build
bun run check     # type-check com svelte-check
bun run lint      # prettier + eslint
bun run format    # auto-format
```

Não há testes neste projeto.

## Estrutura de rotas

Todas as páginas ficam em `src/routes/friday/`:

```text
friday/
  +layout.svelte              # shell com sidebar colapsável + header
  accounts/
    +page.svelte              # lista de contas agrupadas por tipo
    +page.server.ts
    _components/              # AccountCard, AccountLogo, AccountModal
    [id]/
      +layout.svelte          # header da conta (logo + tabs)
      +layout.server.ts       # carrega conta e instituição
      bank/
        +page.svelte          # detalhe de conta bancária (cartões + transações)
        +page.server.ts       # stream de transações, cartões, tags, payment methods
        CardModal.svelte
        _components/          # CardsTable, TableTransactions
      investment/
        +page.svelte          # detalhe de conta de investimento
  transaction-attributes/
    +layout.svelte            # tabs: Tags / Métodos de Pagamento / Moedas
    transaction-tags/         # gerenciamento de categorias e tags
    payment-methods/          # gerenciamento de formas de pagamento
    currencies/               # gerenciamento de moedas
  dashboard/                  # placeholder
  budget/                     # placeholder
  goals/                      # placeholder
  events/                     # placeholder
  config/                     # placeholder
```

## Componentes compartilhados

`src/lib/components/ui/`:

| Componente             | Descrição                                                                    |
| ---------------------- | ---------------------------------------------------------------------------- |
| `Table.svelte`         | Tabela genérica tipada — recebe `data`, `columns`, `rowKey` e `cell` snippet |
| `Modal.svelte`         | Shell de dialog com título, botões Cancel/Salvar e slot `body`               |
| `Tabs.svelte`          | Barra de abas pill-style com highlight por pathname                          |
| `Toast.svelte`         | Notificação temporária de sucesso/erro                                       |
| `ConfirmDialog.svelte` | Dialog de confirmação para ações destrutivas                                 |

**Padrão de modal**: componente específico de domínio (ex: `CardModal.svelte`) que encapsula `Modal.svelte` com um snippet `body`. O estado `open` fica no pai.

## Tipos

`src/lib/types/`:

| Arquivo          | Tipos exportados                                      |
| ---------------- | ----------------------------------------------------- |
| `account.ts`     | `Account`, `AccountType`, `AccountStatus`, `CardInfo` |
| `transaction.ts` | `Transaction`                                         |

## Utilitários

`src/lib/utils/date.ts` — `parsePythonDate`, `getDia`, `getMesAno` para formatar datas ISO em português.

`src/lib/server/api.ts` — `apiFetch(path, token, options?)` para chamadas à API com autenticação.

## Convenções

- **Runes Svelte 5**: `$state`, `$derived`, `$effect`, `$props` — sem `writable` ou `$:` legado
- **Dados do servidor**: `+page.server.ts` usa `streamed` para não bloquear a renderização; o componente resolve a Promise via `$effect`
- **Ações de formulário**: envio via `fetch('?/actionName', { method: 'POST', body: formData })` + `deserialize` + `invalidateAll()`
- **Componentes locais**: ficam em `_components/` ao lado da página; modais ficam diretamente ao lado da página que os usa
- **Estilo**: TailwindCSS v4 com tokens customizados `friday-blue`, `friday-orange`, `friday-red`, `secondary`, `tertiary`, `success`, `failed`. Tema escuro com glassmorphism via `bg-secondary/30 border-white/10`
- **Navegação**: spinner global em `friday/+layout.svelte` durante navegação para rotas de detalhe de conta (`/friday/accounts/`)
