<script lang="ts">
	import { ReceiptIcon, PlusIcon } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import CardsTable from './_components/CardsTable.svelte';
	import TableTransactions from './_components/TableTransactions.svelte';
	import CardModal from './CardModal.svelte';
	import TransactionModal from './TransactionModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import { showToast } from '$lib/toast.svelte';
	import { useStreamedData } from '$lib/utils/streamed-data.svelte';
	import { submitAction } from '$lib/utils/form-action';
	import type { CardInfo } from '$lib/types/account';
	import type { Transaction } from '$lib/types/transaction';

	interface Props {
		data: {
			streamed: Promise<{
				transactions: Transaction[];
				cards: CardInfo[];
				availableTags: {
					id: string;
					categoryId: string;
					subcategoryId: string;
					categoryLabel: string;
					subcategoryLabel: string;
					type: 'outcome' | 'income';
				}[];
				availablePaymentMethods: { id: string; label: string }[];
				availableCurrencies: { id: string; symbol: string; label: string }[];
				defaultCurrencyId: string;
				pagination: { page: number; pages: number; total: number };
			}>;
		};
	}

	let { data }: Props = $props();
	const streamed = useStreamedData(() => data.streamed);
	const transactions = $derived<Transaction[]>(streamed.data?.transactions ?? []);
	const cards = $derived<CardInfo[]>(streamed.data?.cards ?? []);
	const availableTags = $derived(streamed.data?.availableTags ?? []);
	const availablePaymentMethods = $derived(streamed.data?.availablePaymentMethods ?? []);
	const availableCurrencies = $derived(streamed.data?.availableCurrencies ?? []);
	const defaultCurrencyId = $derived(streamed.data?.defaultCurrencyId ?? '');
	const pagination = $derived(streamed.data?.pagination ?? { page: 1, pages: 1, total: 0 });

	// Date filters (triggers server reload)
	let dateStart = $state(page.url.searchParams.get('date_start') ?? '');
	let dateEnd = $state(page.url.searchParams.get('date_end') ?? '');

	function applyDateFilters() {
		const params = new SvelteURLSearchParams();
		if (dateStart) params.set('date_start', dateStart);
		if (dateEnd) params.set('date_end', dateEnd);
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- query-only navigation
		goto(`?${params.toString()}`);
	}

	function clearFilters() {
		dateStart = '';
		dateEnd = '';
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- query-only navigation
		goto('?');
	}

	// Client-side filters
	let filterCategory = $state('');
	let filterType = $state('');
	let filterPaymentMethod = $state('');

	const categories = $derived([...new Set(transactions.map((t) => t.category))].sort());
	const paymentMethods = $derived([...new Set(transactions.map((t) => t.paymentMethod))].sort());

	const filteredTransactions = $derived(
		transactions.filter((t) => {
			if (filterCategory && t.category !== filterCategory) return false;
			if (filterType && t.type !== filterType) return false;
			if (filterPaymentMethod && t.paymentMethod !== filterPaymentMethod) return false;
			return true;
		})
	);

	// Card modal
	let cardModalOpen = $state(false);
	let savingCard = $state(false);

	async function handleSaveCard(cardData: {
		label: string;
		flag: string;
		close_day: number;
		due_day: number;
		limit: number;
	}) {
		savingCard = true;

		const { success, error } = await submitAction('createCard', {
			label: cardData.label,
			flag: cardData.flag,
			close_day: String(cardData.close_day),
			due_day: String(cardData.due_day),
			limit: String(cardData.limit)
		});
		savingCard = false;

		if (success) {
			cardModalOpen = false;
			showToast('Cartão criado com sucesso!', 'success');
		} else {
			showToast(error ?? 'Erro ao criar cartão', 'error');
		}
	}

	// Transaction modal
	let transactionModalOpen = $state(false);
	let savingTransaction = $state(false);
	let editingTransaction = $state<Transaction | null>(null);

	function openNewTransaction() {
		editingTransaction = null;
		transactionModalOpen = true;
	}

	function openEditTransaction(tx: Transaction) {
		editingTransaction = tx;
		transactionModalOpen = true;
	}

	async function handleSaveTransaction(txData: {
		id?: string;
		tagId: string;
		paymentMethodId: string;
		cardId: string;
		currencyId: string;
		value: string;
		description: string;
		dateTransaction: string;
	}) {
		savingTransaction = true;

		const action = txData.id ? 'updateTransaction' : 'createTransaction';
		const { success, error } = await submitAction(action, {
			id: txData.id ?? '',
			tagId: txData.tagId,
			paymentMethodId: txData.paymentMethodId,
			cardId: txData.cardId,
			value: txData.value,
			description: txData.description,
			dateTransaction: txData.dateTransaction,
			currencyId: txData.currencyId
		});
		savingTransaction = false;

		if (success) {
			transactionModalOpen = false;
			showToast(
				txData.id ? 'Transação atualizada com sucesso!' : 'Transação criada com sucesso!',
				'success'
			);
		} else {
			showToast(error ?? 'Erro ao salvar transação', 'error');
		}
	}

	// Transaction deletion
	let confirmDeleteOpen = $state(false);
	let transactionToDelete = $state<Transaction | null>(null);
	let deletingTransaction = $state(false);

	function confirmDeleteTransaction(tx: Transaction) {
		transactionToDelete = tx;
		confirmDeleteOpen = true;
	}

	async function handleDeleteTransaction() {
		if (!transactionToDelete) return;

		deletingTransaction = true;
		const { success, error } = await submitAction('deleteTransaction', {
			transactionId: transactionToDelete.id
		});
		deletingTransaction = false;

		if (success) {
			confirmDeleteOpen = false;
			showToast('Transação deletada com sucesso!', 'success');
		} else {
			showToast(error ?? 'Erro ao deletar transação', 'error');
		}
	}

	// Delete card
	async function handleDeleteCard(cardId: string) {
		const { success, error } = await submitAction('deleteCard', { cardId });

		if (success) {
			showToast('Cartão deletado com sucesso!', 'success');
		} else {
			showToast(error ?? 'Erro ao deletar cartão', 'error');
		}
	}

	const inputClass =
		'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white outline-none transition focus:border-friday-blue/30 focus:bg-white/[0.06]';
</script>

<CardModal
	open={cardModalOpen}
	saving={savingCard}
	onclose={() => (cardModalOpen = false)}
	onsave={handleSaveCard}
/>

<TransactionModal
	open={transactionModalOpen}
	saving={savingTransaction}
	transaction={editingTransaction}
	onclose={() => (transactionModalOpen = false)}
	onsave={handleSaveTransaction}
	tags={availableTags}
	paymentMethods={availablePaymentMethods}
	cards={cards.map((c) => ({ id: c.id, label: c.label }))}
	currencies={availableCurrencies}
	{defaultCurrencyId}
/>

<ConfirmDialog
	open={confirmDeleteOpen}
	loading={deletingTransaction}
	title="Deletar Transação"
	message="Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita."
	onclose={() => (confirmDeleteOpen = false)}
	onconfirm={handleDeleteTransaction}
/>

{#if streamed.isLoading}
	<LoadingSpinner message="Carregando conta..." />
{:else}
	<div class="flex flex-col gap-6 text-white">
		<!-- Cartões -->
		<div class="flex flex-col gap-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
						<ReceiptIcon size={16} class="text-white/40" />
					</div>
					<h2 class="text-sm font-semibold uppercase tracking-wider text-white/60">Cartões</h2>
					<span class="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/40">{cards.length}</span>
				</div>
				<button
					onclick={() => (cardModalOpen = true)}
					disabled={savingCard}
					class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-50"
				>
					<PlusIcon size={12} />
					Novo Cartão
				</button>
			</div>

			{#if cards.length === 0}
				<div class="rounded-xl border border-white/8 bg-white/[0.03] px-6 py-8 text-center">
					<p class="text-sm text-white/30">Nenhum cartão cadastrado</p>
				</div>
			{:else}
				<CardsTable cardsInfo={cards} ondelete={handleDeleteCard} />
			{/if}
		</div>

		<!-- Transações -->
		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<h2 class="text-sm font-semibold uppercase tracking-wider text-white/60">Transações</h2>
				<button
					onclick={openNewTransaction}
					disabled={savingTransaction}
					class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-friday-blue/20 bg-friday-blue/15 px-3 py-1.5 text-xs font-semibold text-friday-blue transition hover:bg-friday-blue/25 disabled:opacity-50"
				>
					<PlusIcon size={12} />
					Nova Transação
				</button>
			</div>

			<!-- Filtros -->
			<div class="rounded-xl border border-white/8 bg-white/[0.03] p-4">
				<div class="flex flex-col gap-4">
					<!-- Filtros de data (server-side) -->
					<div class="flex items-end gap-3">
						<div class="flex flex-col gap-1">
							<label class="text-[10px] font-semibold uppercase tracking-widest text-white/35" for="date-start">
								Data início
							</label>
							<input bind:value={dateStart} class={inputClass} id="date-start" type="date" />
						</div>
						<div class="flex flex-col gap-1">
							<label class="text-[10px] font-semibold uppercase tracking-widest text-white/35" for="date-end">
								Data fim
							</label>
							<input bind:value={dateEnd} class={inputClass} id="date-end" type="date" />
						</div>
						<button
							onclick={applyDateFilters}
							class="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
						>
							Filtrar
						</button>
						{#if dateStart || dateEnd}
							<button
								onclick={clearFilters}
								class="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-xs text-white/40 transition hover:text-white/70"
							>
								Limpar
							</button>
						{/if}
					</div>

					<!-- Filtros client-side -->
					<div class="grid grid-cols-3 gap-3">
						<div class="flex flex-col gap-1">
							<label class="text-[10px] font-semibold uppercase tracking-widest text-white/35" for="filter-category">
								Categoria
							</label>
							<select bind:value={filterCategory} class={inputClass} id="filter-category">
								<option class="bg-[#1a1a1f] text-white" value="">Todas</option>
								{#each categories as cat (cat)}
									<option class="bg-[#1a1a1f] text-white" value={cat}>{cat}</option>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-1">
							<label class="text-[10px] font-semibold uppercase tracking-widest text-white/35" for="filter-type">
								Tipo
							</label>
							<select bind:value={filterType} class={inputClass} id="filter-type">
								<option class="bg-[#1a1a1f] text-white" value="">Todos</option>
								<option class="bg-[#1a1a1f] text-white" value="outcome">Saída</option>
								<option class="bg-[#1a1a1f] text-white" value="income">Entrada</option>
							</select>
						</div>
						<div class="flex flex-col gap-1">
							<label class="text-[10px] font-semibold uppercase tracking-widest text-white/35" for="filter-pm">
								Pagamento
							</label>
							<select bind:value={filterPaymentMethod} class={inputClass} id="filter-pm">
								<option class="bg-[#1a1a1f] text-white" value="">Todos</option>
								{#each paymentMethods as pm (pm)}
									<option class="bg-[#1a1a1f] text-white" value={pm}>{pm}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			</div>

			<!-- Tabela -->
			{#if filteredTransactions.length === 0}
				<div class="rounded-xl border border-white/8 bg-white/[0.03] py-12 text-center">
					<p class="text-sm text-white/30">Nenhuma transação encontrada</p>
				</div>
			{:else}
				<TableTransactions
					transactions={filteredTransactions}
					onedit={openEditTransaction}
					ondelete={confirmDeleteTransaction}
				/>
				<Pagination currentPage={pagination.page} totalPages={pagination.pages} preserveParams />
			{/if}
		</div>
	</div>
{/if}
