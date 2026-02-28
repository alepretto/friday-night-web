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
