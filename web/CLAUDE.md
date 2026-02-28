# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `bun` as the package manager (not npm/yarn/pnpm).

```bash
bun run dev          # Start development server
bun run build        # Production build
bun run preview      # Preview production build
bun run check        # Type-check with svelte-check
bun run lint         # Check formatting (prettier) and lint (eslint)
bun run format       # Auto-format all files
```

There are no tests in this project.

## Architecture

This is a **SvelteKit 5** frontend app using **Svelte 5 runes** (`$state`, `$props`, `$derived`), **TypeScript**, and **TailwindCSS v4**.

### Route Structure

All application pages live under `src/routes/friday/`. The root `+layout.svelte` at this level renders a collapsible sidebar + header shell, with `<main>` content rendered via `{@render children()}`.

Key route groups:

- `/friday/accounts` — lists accounts grouped by type (bank, investment, cash, benefict)
- `/friday/accounts/[id]/bank` — bank account detail with cards and transactions table
- `/friday/accounts/[id]/investment` — investment account detail
- `/friday/accounts/[id]/+layout.svelte` — shared header/tabs for account detail pages
- `/friday/transaction-attributes/` — tabbed layout for transaction metadata management
  - `/transaction-tags` — category/subcategory tag management
  - `/payment-methods` — payment method management
  - `/currencies` — currency management (fiat/crypto)
- `/friday/dashboard`, `/friday/budget`, `/friday/goals`, `/friday/events`, `/friday/config` — placeholder pages

### Component Patterns

**Page-local components** live in `_components/` subdirectories next to their page (e.g., `accounts/_components/AccountCard.svelte`). Modal components live directly alongside the page that uses them (e.g., `CurrencyModal.svelte` next to `currencies/+page.svelte`).

**Shared UI components** in `src/lib/components/ui/`:

- `Table.svelte` — generic typed table; accepts `data`, `columns: Column<T>[]`, `rowKey`, and an optional `cell` snippet for custom cell rendering
- `Modal.svelte` — dialog shell with title, close button, Cancel/Salvar footer; body passed as a `body` snippet
- `Tabs.svelte` — pill-style tab bar driven by route `{label, route}` pairs, highlights active tab via `page.url.pathname`

**Modal pattern**: Create a domain-specific modal component (e.g., `CurrencyModal.svelte`) that wraps `Modal.svelte` with a `body` snippet. The parent page holds `open` state and a `handleSave` callback.

### Types

`src/lib/types/`:

- `account.ts` — `Account`, `AccountType`, `CardInfo`
- `transaction.ts` — `Transaction`

### Utilities

`src/lib/utils/date.ts` — `parsePythonDate`, `getDia`, `getMesAno` for parsing ISO/Python date strings into Portuguese-formatted parts.

### Styling Conventions

TailwindCSS v4 with custom color tokens used throughout: `friday-blue`, `friday-orange`, `friday-red`, `secondary`, `tertiary`, `success`, `failed`. Dark background (`#0d0d0f`) in the main content area. Glassmorphism via `bg-secondary/30`, `border-white/10`.

### Data

All data is currently **hardcoded as local constants** inside page components — no API calls or stores yet. The active branch (`11-connect-api-transactions-tags`) is where API integration is being developed.

# Friday Night API — Contexto para Integração Frontend

## Visão Geral

- **Framework**: FastAPI (Python)
- **Autenticação**: Supabase Auth (JWT Bearer Token)
- **Base URL**: `http://localhost:8000`
- **Prefixo global**: `/api/v1`
- **CORS**: `http://localhost:5173` (Vite dev server)
- **Paginação**: `fastapi-pagination` (todos os endpoints de listagem)

---

## Autenticação

Todas as rotas protegidas exigem header:

```
Authorization: Bearer <access_token>
```

O `access_token` é retornado pelo endpoint de login e é um JWT do Supabase.

---

## Formato de Erros

### Erros da aplicação (`FridayNightException`)

```json
{
	"error": "NomeDoErro",
	"message": "Descrição do problema"
}
```

### Erros de autenticação Supabase

```json
{
	"message": "Error de validação",
	"detail": "..."
}
```

### Erros HTTP padrão (401, 403, 404)

```json
{
	"detail": "Mensagem de erro"
}
```

---

## Formato de Paginação

Todos os endpoints `GET` de listagem retornam:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 50,
  "pages": 2
}
```

Query params de paginação: `?page=1&size=50`

---

## Endpoints

### AUTH — `/api/v1/auth`

#### `POST /api/v1/auth/signup` — Cadastro

**Body:**

```json
{
	"email": "user@email.com",
	"password": "senha123",
	"first_name": "João",
	"last_name": "Silva"
}
```

**Response:**

```json
{
  "message": "Usuário criado. Verifique o e-mail se necessário",
  "user": { ...supabase_user_object }
}
```

#### `POST /api/v1/auth/login` — Login

**Body:**

```json
{
	"email": "user@email.com",
	"password": "senha123"
}
```

**Response:**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { ...supabase_user_object }
}
```

---

### USERS — `/api/v1/users` 🔒

#### `GET /api/v1/users/me` — Dados do usuário logado

**Response:**

```json
{
	"id": "uuid",
	"email": "user@email.com",
	"first_name": "João",
	"last_name": "Silva",
	"username": null,
	"avatar_url": null,
	"language": "pt-br",
	"is_premium": false,
	"is_active": true,
	"role": "user",
	"telegram_id": null,
	"created_at": "2024-01-01T00:00:00Z"
}
```

#### `PATCH /api/v1/users/me` — Atualizar perfil

**Body (todos opcionais):**

```json
{
	"first_name": "João",
	"last_name": "Silva",
	"avatar_url": "https://...",
	"language": "pt-br"
}
```

#### `DELETE /api/v1/users/me` — Deletar conta

**Response:** `204 No Content`

---

### FINANCIAL INSTITUTIONS — `/api/v1/finance/financial-institutions`

> **Não requer autenticação** nas rotas de leitura/criação (dados globais do sistema)

#### `POST /api/v1/finance/financial-institutions`

**Body:**

```json
{
	"name": "Nubank",
	"type": "fintech",
	"icon_url": "https://..."
}
```

**Response:**

```json
{
	"id": "uuid",
	"name": "Nubank",
	"type": "fintech",
	"icon_url": "https://...",
	"created_at": "2024-01-01T00:00:00Z"
}
```

#### `GET /api/v1/finance/financial-institutions` — Listar

**Query params:** `?type=bank` (opcional), `?page=1&size=50`

**Enum `type`:** `bank` | `fintech` | `broker` | `exchange` | `wallet`

---

### CURRENCIES — `/api/v1/finance/currencies` 🔒

> Dados globais (moedas/criptomoedas do sistema)

#### `POST /api/v1/finance/currencies`

**Body:**

```json
{
	"label": "Real Brasileiro",
	"symbol": "BRL",
	"type": "fiat"
}
```

**Response:**

```json
{
	"id": "uuid",
	"label": "Real Brasileiro",
	"symbol": "BRL",
	"type": "fiat",
	"created_at": "2024-01-01T00:00:00Z",
	"updated_at": "2024-01-01T00:00:00Z"
}
```

**Enum `type`:** `fiat` | `cripto`

---

### ACCOUNTS — `/api/v1/finance/accounts` 🔒

#### `POST /api/v1/finance/accounts`

**Body:**

```json
{
	"financial_institution_id": "uuid",
	"status": "activate",
	"type": "bank",
	"subtype": "corrente"
}
```

**Response:**

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"financial_institution_id": "uuid",
	"status": "activate",
	"type": "bank",
	"subtype": "corrente",
	"created_at": "...",
	"updated_at": "..."
}
```

**Enum `status`:** `activate` | `deactivate`

**Enum `type`:** `bank` | `investment` | `cash` | `benefit`

#### `GET /api/v1/finance/accounts` — Listar contas do usuário

**Query params (todos opcionais):**

- `financial_institution_id=uuid`
- `status=activate`
- `type=bank`
- `page=1&size=50`

---

### CATEGORIES — `/api/v1/finance/categories` 🔒

#### `POST /api/v1/finance/categories`

**Body:**

```json
{
	"label": "Alimentação",
	"type": "outcome"
}
```

**Response:**

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"label": "Alimentação",
	"type": "outcome",
	"created_at": "...",
	"updated_at": "..."
}
```

**Enum `type`:** `outcome` | `income`

#### `GET /api/v1/finance/categories/{id_category}` — Buscar por ID

#### `GET /api/v1/finance/categories` — Listar (paginado)

---

### SUBCATEGORIES — `/api/v1/finance/subcategories` 🔒

#### `POST /api/v1/finance/subcategories`

**Body:**

```json
{
	"category_id": "uuid",
	"label": "Restaurante"
}
```

**Response:**

```json
{
	"id": "uuid",
	"created_at": "...",
	"updated_at": "..."
}
```

#### `GET /api/v1/finance/subcategories/{subcategory_id}` — Buscar por ID

#### `GET /api/v1/finance/subcategories/list/{category_id}` — Listar por categoria (paginado)

---

### TAGS — `/api/v1/finance/tags` 🔒

> Tags combinam categoria + subcategoria para classificar transações.

#### `POST /api/v1/finance/tags`

**Body:**

```json
{
	"category_id": "uuid",
	"subcategory_id": "uuid",
	"active": true
}
```

**Response:**

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"category_id": "uuid",
	"subcategory_id": "uuid",
	"active": true,
	"created_at": "...",
	"updated_at": "..."
}
```

#### `GET /api/v1/finance/tags/{tag_id}` — Buscar por ID

#### `GET /api/v1/finance/tags` — Listar (paginado)

**Query params:** `?active=true` (default: `false`)

#### `PATCH /api/v1/finance/tags/{tag_id}/activate` — Ativar tag

#### `PATCH /api/v1/finance/tags/{tag_id}/deactivate` — Desativar tag

---

### PAYMENT METHODS — `/api/v1/finance/payment-methods` 🔒

#### `POST /api/v1/finance/payment-methods`

**Body:**

```json
{
	"label": "Cartão Nubank",
	"active": true
}
```

**Response:**

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"label": "Cartão Nubank",
	"active": true,
	"created_at": "...",
	"updated_at": "..."
}
```

#### `GET /api/v1/finance/payment-methods/{payment_method_id}` — Buscar por ID

#### `GET /api/v1/finance/payment-methods` — Listar (paginado)

**Query params:** `?active=true` (opcional, sem valor = retorna todos)

#### `PATCH /api/v1/finance/payment-methods/{payment_method_id}/activate`

#### `PATCH /api/v1/finance/payment-methods/{payment_method_id}/deactivate`

---

### TRANSACTIONS — `/api/v1/finance/transactions` 🔒

#### `POST /api/v1/finance/transactions`

**Body:**

```json
{
	"account_id": "uuid",
	"tag_id": "uuid",
	"payment_method_id": "uuid",
	"currency_id": "uuid",
	"value": "150.50",
	"description": "Almoço",
	"date_transaction": "2024-01-15T12:00:00Z"
}
```

> `description` e `date_transaction` são opcionais.

**Response:**

```json
{
	"id": "uuid",
	"account_id": "uuid",
	"tag_id": "uuid",
	"payment_method_id": "uuid",
	"currency_id": "uuid",
	"value": "150.50",
	"description": "Almoço",
	"date_transaction": "2024-01-15T12:00:00-03:00",
	"created_at": "...",
	"updated_at": "..."
}
```

---

### HOLDINGS — `/api/v1/finance/holdings` 🔒

> Holdings representam ativos financeiros vinculados a uma transação.

#### `POST /api/v1/finance/holdings`

**Body:**

```json
{
	"transaction_id": "uuid",
	"symbol": "BTC",
	"asset_type": "cripto",
	"quantity": "0.005000",
	"price": "280000.000000"
}
```

**Response:**

```json
{
	"id": "uuid",
	"transaction_id": "uuid",
	"symbol": "BTC",
	"asset_type": "cripto",
	"quantity": "0.005000",
	"price": "280000.000000",
	"created_at": "...",
	"updated_at": "..."
}
```

**Enum `asset_type`:** `cripto` | `stock` | `etf` | `bond`

---

## Fluxo típico de uso

```
1. POST /auth/signup  ou  POST /auth/login
   → Salvar access_token

2. GET /users/me
   → Carregar dados do usuário

3. GET /finance/financial-institutions
   → Listar bancos disponíveis

4. POST /finance/accounts
   → Criar conta vinculada a uma instituição

5. POST /finance/categories  →  POST /finance/subcategories
   →  POST /finance/tags
   → Criar hierarquia de classificação

6. POST /finance/payment-methods
   → Cadastrar formas de pagamento

7. GET /finance/currencies  (ou POST para criar)
   → Obter moeda (ex: BRL)

8. POST /finance/transactions
   → Registrar transação com account, tag, payment_method, currency

9. POST /finance/holdings  (opcional)
   → Vincular ativo à transação (para investimentos)
```

---

## Notas importantes

- **Datas**: Todos os campos de data são retornados no timezone local (conversão automática via `to_local()`)
- **Valores monetários**: Serializados como string com até 28 dígitos e 6 casas decimais (`Decimal`)
- **IDs**: Todos são UUIDs v7 (ordenáveis por tempo)
- **Unicidade**: Categoria (user+label+type), Tag (user+category+subcategory), Conta (user+institution+type+subtype), Currency (label+symbol), Instituição (name+type)
- **Token expirado**: API retorna `401` com `{"detail": "Sessão expirada"}` — redirecionar para login
