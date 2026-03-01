<script lang="ts">
	import { ReceiptIcon } from 'lucide-svelte';
	import { deserialize } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import CardsTable from './_components/CardsTable.svelte';
	import TableTransactions from './_components/TableTransactions.svelte';
	import CardModal from './CardModal.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import type { CardInfo } from '$lib/types/account';
	import type { Transaction } from '$lib/types/transaction';

	interface Props {
		data: {
			streamed: Promise<{
				transactions: Transaction[];
				cards: CardInfo[];
				pagination: { page: number; pages: number; total: number };
			}>;
		};
	}

	let { data }: Props = $props();

	let isLoading = $state(true);
	let transactions = $state<Transaction[]>([]);
	let cards = $state<CardInfo[]>([]);
	let pagination = $state({ page: 1, pages: 1, total: 0 });

	$effect(() => {
		isLoading = true;
		data.streamed.then(async (result) => {
			if ('unauthorized' in result) {
				await fetch('/login?/logout', { method: 'POST' });
				goto('/login');
				return;
			}
			transactions = result.transactions;
			cards = result.cards;
			pagination = result.pagination;
			isLoading = false;
		});
	});

	// Toast
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let toastTimer: ReturnType<typeof setTimeout>;

	function showToast(message: string, type: 'success' | 'error') {
		clearTimeout(toastTimer);
		toastMessage = message;
		toastType = type;
		toastVisible = true;
		toastTimer = setTimeout(() => (toastVisible = false), 3000);
	}

	// Date filters (triggers server reload)
	let dateStart = $state(page.url.searchParams.get('date_start') ?? '');
	let dateEnd = $state(page.url.searchParams.get('date_end') ?? '');

	function applyDateFilters() {
		const params = new URLSearchParams();
		if (dateStart) params.set('date_start', dateStart);
		if (dateEnd) params.set('date_end', dateEnd);
		goto(`?${params.toString()}`);
	}

	function clearFilters() {
		dateStart = '';
		dateEnd = '';
		goto('?');
	}

	function goToPage(p: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(p));
		goto(`?${params.toString()}`);
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

		const formData = new FormData();
		formData.set('label', cardData.label);
		formData.set('flag', cardData.flag);
		formData.set('close_day', String(cardData.close_day));
		formData.set('due_day', String(cardData.due_day));
		formData.set('limit', String(cardData.limit));

		const res = await fetch('?/createCard', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		savingCard = false;

		if (result.type === 'success') {
			cardModalOpen = false;
			showToast('Cartão criado com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			showToast((result.data?.error as string) ?? 'Erro ao criar cartão', 'error');
		}
	}

	// Delete card
	let deletingCardId = $state<string | null>(null);

	async function handleDeleteCard(cardId: string) {
		deletingCardId = cardId;

		const formData = new FormData();
		formData.set('cardId', cardId);

		const res = await fetch('?/deleteCard', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		deletingCardId = null;

		if (result.type === 'success') {
			showToast('Cartão deletado com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			showToast((result.data?.error as string) ?? 'Erro ao deletar cartão', 'error');
		}
	}
</script>

<Toast message={toastMessage} type={toastType} visible={toastVisible} />

<CardModal
	open={cardModalOpen}
	saving={savingCard}
	onclose={() => (cardModalOpen = false)}
	onsave={handleSaveCard}
/>

{#if isLoading}
	<div class="flex min-h-125 items-center justify-center">
		<div class="flex flex-col items-center gap-4">
			<div class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
			<p class="text-sm text-gray-400">Carregando conta...</p>
		</div>
	</div>
{:else}
	<main class="flex flex-col gap-5 text-white">
		<div class="grid grid-cols-9 gap-15 pt-5">
			<div class="col-span-2 flex flex-col justify-around gap-5">
				<div class="flex justify-between px-3 py-5">
					<div class="flex items-center gap-3">
						<ReceiptIcon size={35} />
						<span class="text-xl italic">Cartões</span>
					</div>
					<div class="text-2xl font-bold">{cards.length}</div>
				</div>
			</div>

			<div class="col-span-7 flex flex-col gap-5 p-5">
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
					class="cursor-pointer rounded-3xl border border-friday-blue/60 bg-friday-blue/40 px-10 py-3 transition-colors hover:bg-friday-blue"
				>
					New Transaction
				</button>
			</div>

			<div class="flex flex-wrap items-end gap-5">
				<!-- Date filters (server-side) -->
				<div class="flex items-end gap-3">
					<div class="flex flex-col gap-1">
						<label class="px-2 text-sm text-gray-400" for="date-start">Data início</label>
						<input
							bind:value={dateStart}
							class="rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
							id="date-start"
							type="date"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="px-2 text-sm text-gray-400" for="date-end">Data fim</label>
						<input
							bind:value={dateEnd}
							class="rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
							id="date-end"
							type="date"
						/>
					</div>
					<button
						onclick={applyDateFilters}
						class="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm transition-colors hover:bg-white/20"
					>
						Filtrar
					</button>
					{#if dateStart || dateEnd}
						<button
							onclick={clearFilters}
							class="cursor-pointer rounded-xl border border-white/10 px-5 py-2 text-sm text-gray-400 transition-colors hover:bg-white/10"
						>
							Limpar
						</button>
					{/if}
				</div>

				<!-- Client-side filters -->
				<div class="flex flex-1 gap-4">
					<div class="flex flex-col gap-1">
						<label class="px-2 text-sm text-gray-400" for="filter-category">Categoria</label>
						<select
							bind:value={filterCategory}
							class="rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
							id="filter-category"
						>
							<option value="">Todas</option>
							{#each categories as cat (cat)}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label class="px-2 text-sm text-gray-400" for="filter-type">Tipo</label>
						<select
							bind:value={filterType}
							class="rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
							id="filter-type"
						>
							<option value="">Todos</option>
							<option value="outcome">Saída</option>
							<option value="income">Entrada</option>
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label class="px-2 text-sm text-gray-400" for="filter-pm">Pagamento</label>
						<select
							bind:value={filterPaymentMethod}
							class="rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
							id="filter-pm"
						>
							<option value="">Todos</option>
							{#each paymentMethods as pm (pm)}
								<option value={pm}>{pm}</option>
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

				{#if pagination.pages > 1}
					<div class="flex items-center justify-center gap-4 pb-5">
						<button
							onclick={() => goToPage(pagination.page - 1)}
							disabled={pagination.page <= 1}
							class="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
						>
							Anterior
						</button>
						<span class="text-sm text-gray-400">
							{pagination.page} / {pagination.pages}
						</span>
						<button
							onclick={() => goToPage(pagination.page + 1)}
							disabled={pagination.page >= pagination.pages}
							class="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
						>
							Próximo
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</main>
{/if}
