<script lang="ts">
	import { ReceiptIcon } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import CardsTable from './_components/CardsTable.svelte';
	import TableTransactions from './_components/TableTransactions.svelte';
	import CardModal from './CardModal.svelte';
	import TransactionModal from './TransactionModal.svelte';
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
				currencyId: string;
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
	const currencyId = $derived(streamed.data?.currencyId ?? '');
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

	async function handleSaveTransaction(txData: {
		tagId: string;
		paymentMethodId: string;
		cardId: string;
		value: string;
		description: string;
		dateTransaction: string;
	}) {
		savingTransaction = true;

		const { success, error } = await submitAction('createTransaction', {
			tagId: txData.tagId,
			paymentMethodId: txData.paymentMethodId,
			cardId: txData.cardId,
			value: txData.value,
			description: txData.description,
			dateTransaction: txData.dateTransaction,
			currencyId
		});
		savingTransaction = false;

		if (success) {
			transactionModalOpen = false;
			showToast('Transação criada com sucesso!', 'success');
		} else {
			showToast(error ?? 'Erro ao criar transação', 'error');
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
	onclose={() => (transactionModalOpen = false)}
	onsave={handleSaveTransaction}
	tags={availableTags}
	paymentMethods={availablePaymentMethods}
	cards={cards.map((c) => ({ id: c.id, label: c.label }))}
/>

{#if streamed.isLoading}
	<LoadingSpinner message="Carregando conta..." />
{:else}
	<main class="flex flex-col gap-5 text-white">
		<div class="grid grid-cols-3 gap-10 pt-5">
			<div class="col-span-1 flex flex-col justify-around gap-5">
				<div
					class="flex justify-between rounded-2xl border border-white/10 bg-secondary/30 px-5 py-6"
				>
					<div class="flex items-center gap-3">
						<ReceiptIcon size={35} />
						<span class="text-xl italic">Cartões</span>
					</div>
					<div class="text-2xl font-bold">{cards.length}</div>
				</div>
			</div>

			<div class="col-span-2 flex flex-col gap-5 p-5">
				<div class="flex items-center justify-between">
					<h1 class="text-3xl font-bold">Cartões</h1>
					<button
						onclick={() => (cardModalOpen = true)}
						disabled={savingCard}
						class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success disabled:opacity-50"
					>
						Novo Cartão
					</button>
				</div>
				<div class="flex h-70">
					{#if cards.length === 0}
						<div class="flex w-full items-center justify-center text-white/50">
							Nenhum cartão cadastrado.
						</div>
					{:else}
						<CardsTable cardsInfo={cards} ondelete={handleDeleteCard} />
					{/if}
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-10">
			<div class="flex justify-between">
				<h1 class="text-3xl font-bold">Transações</h1>
				<button
					onclick={() => (transactionModalOpen = true)}
					disabled={savingTransaction}
					class="cursor-pointer rounded-3xl border border-friday-blue/60 bg-friday-blue/40 px-10 py-3 transition-colors hover:bg-friday-blue disabled:opacity-50"
				>
					Nova Transação
				</button>
			</div>

			<!-- Date filters (server-side) -->
			<div class="flex flex-col gap-6">
				<div class="flex items-end gap-4">
					<div class="flex flex-col gap-1">
						<label class="pl-1 text-sm text-gray-400" for="date-start">Data início</label>
						<input
							bind:value={dateStart}
							class="min-w-44 rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
							id="date-start"
							type="date"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="pl-1 text-sm text-gray-400" for="date-end">Data fim</label>
						<input
							bind:value={dateEnd}
							class="min-w-44 rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
							id="date-end"
							type="date"
						/>
					</div>
					<button
						onclick={applyDateFilters}
						class="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-5 py-2 transition-colors hover:bg-white/20"
					>
						Filtrar
					</button>
					{#if dateStart || dateEnd}
						<button
							onclick={clearFilters}
							class="cursor-pointer rounded-xl border border-white/10 px-5 py-2 text-gray-400 transition-colors hover:bg-white/10"
						>
							Limpar
						</button>
					{/if}
				</div>

				<!-- Client-side filters -->
				<div class="grid grid-cols-3 gap-6">
					<div class="flex flex-col gap-1">
						<label class="pl-1 text-sm text-gray-400" for="filter-category">Categoria</label>
						<select
							bind:value={filterCategory}
							class="w-full min-w-44 rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
							id="filter-category"
						>
							<option class="text-black" value="">Todas</option>
							{#each categories as cat (cat)}
								<option class="text-black" value={cat}>{cat}</option>
							{/each}
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label class="pl-1 text-sm text-gray-400" for="filter-type">Tipo</label>
						<select
							bind:value={filterType}
							class="w-full min-w-44 rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
							id="filter-type"
						>
							<option class="text-black" value="">Todos</option>
							<option class="text-black" value="outcome">Saída</option>
							<option class="text-black" value="income">Entrada</option>
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label class="pl-1 text-sm text-gray-400" for="filter-pm">Pagamento</label>
						<select
							bind:value={filterPaymentMethod}
							class="w-full min-w-44 rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
							id="filter-pm"
						>
							<option class="text-black" value="">Todos</option>
							{#each paymentMethods as pm (pm)}
								<option class="text-black" value={pm}>{pm}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			{#if filteredTransactions.length === 0}
				<div class="py-10 text-center text-white/50">Nenhuma transação encontrada.</div>
			{:else}
				<div class="flex justify-center">
					<TableTransactions transactions={filteredTransactions} />
				</div>

				<Pagination currentPage={pagination.page} totalPages={pagination.pages} preserveParams />
			{/if}
		</div>
	</main>
{/if}
