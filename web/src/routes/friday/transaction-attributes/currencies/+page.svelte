<script lang="ts">
	import { SlidersHorizontal } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';
	import CurrencyModal from './CurrencyModal.svelte';
	import EditCurrencyModal from './EditCurrencyModal.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// === Resolve o streamed ===
	let resolvedData = $state<any>(null);
	let isLoading = $state(true);

	$effect(() => {
		isLoading = true;
		Promise.resolve(data.streamed)
			.then(async (result) => {
				if ('unauthorized' in result) {
					await fetch('/login?/logout', { method: 'POST' });
					goto('/login');
					return;
				}
				resolvedData = result;
				isLoading = false;
			})
			.catch((err) => {
				console.error('Erro ao carregar moedas:', err);
				isLoading = false;
			});
	});

	type CurrencyType = 'fiat' | 'crypto';

	interface Currency {
		id: string;
		label: string;
		symbol: string;
		type: CurrencyType;
	}

	const columns: Column<Currency>[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'label', label: 'Label', align: 'center' },
		{ key: 'symbol', label: 'Symbol', align: 'center' },
		{ key: 'type', label: 'Type', align: 'center' },
		{ key: 'actions', label: 'Actions', align: 'center' }
	];

	const typeBadge = {
		fiat: 'bg-friday-blue/50 border-blue-600 text-white',
		crypto: 'bg-failed/60 border border-red-900 text-red-200'
	};

	// Pagination
	const currentPage = $derived(resolvedData?.pagination.page ?? 1);

	function getVisiblePages(current: number, total: number) {
		if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
		const pages: (number | '...')[] = [1, 2, 3];
		if (current > 4) pages.push('...');
		if (current > 3 && current < total - 1) pages.push(current);
		pages.push('...');
		pages.push(total - 1, total);
		return [...new Set(pages)];
	}

	const visiblePages = $derived(getVisiblePages(currentPage, resolvedData?.pagination.pages ?? 1));

	function goToPage(page: number) {
		goto(`?page=${page}`);
	}

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
		toastTimer = setTimeout(() => {
			toastVisible = false;
		}, 3000);
	}

	// Create modal
	let createOpen = $state(false);
	let createSaving = $state(false);
	let createError = $state('');

	async function handleCreate(saveData: { label: string; symbol: string; type: CurrencyType }) {
		createSaving = true;
		createError = '';

		const formData = new FormData();
		formData.set('label', saveData.label);
		formData.set('symbol', saveData.symbol);
		formData.set('type', saveData.type);

		const res = await fetch('?/createCurrency', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		createSaving = false;

		if (result.type === 'success') {
			createOpen = false;
			showToast('Moeda criada com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			createError = (result.data?.error as string) ?? 'Erro desconhecido';
			showToast(createError, 'error');
		}
	}

	// Edit modal
	let editOpen = $state(false);
	let editSaving = $state(false);
	let editCurrency = $state<Currency | null>(null);

	function openEdit(currency: Currency) {
		editCurrency = currency;
		editOpen = true;
	}

	async function handleEdit(saveData: {
		currencyId: string;
		label: string;
		symbol: string;
		type: CurrencyType;
	}) {
		editSaving = true;

		const formData = new FormData();
		formData.set('currencyId', saveData.currencyId);
		formData.set('label', saveData.label);
		formData.set('symbol', saveData.symbol);
		formData.set('type', saveData.type);

		const res = await fetch('?/updateCurrency', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		editSaving = false;

		if (result.type === 'success') {
			editOpen = false;
			showToast('Moeda atualizada com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			const msg = (result.data?.error as string) ?? 'Erro desconhecido';
			showToast(msg, 'error');
		}
	}
</script>

<Toast message={toastMessage} type={toastType} visible={toastVisible} />

{#if isLoading}
	<div class="flex min-h-125 items-center justify-center py-20">
		<div class="flex flex-col items-center gap-4">
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"
			></div>
			<p class="text-sm text-gray-400">Carregando moedas...</p>
		</div>
	</div>
{:else}
	<CurrencyModal
		open={createOpen}
		saving={createSaving}
		onclose={() => {
			createOpen = false;
			createError = '';
		}}
		onsave={handleCreate}
	/>

	{#if editCurrency}
		<EditCurrencyModal
			open={editOpen}
			saving={editSaving}
			currencyId={editCurrency.id}
			initialLabel={editCurrency.label}
			initialSymbol={editCurrency.symbol}
			initialType={editCurrency.type}
			onclose={() => (editOpen = false)}
			onsave={handleEdit}
		/>
	{/if}

	<section>
		<div class="flex items-center justify-end p-10">
			<div class="flex flex-col items-end gap-1">
				{#if createError}
					<p class="text-sm text-failed">{createError}</p>
				{/if}
				<button
					onclick={() => (createOpen = true)}
					disabled={createSaving}
					class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success disabled:opacity-50"
				>
					New Currency
				</button>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center font-sans">
			<div class="w-full max-w-7xl">
				<Table data={resolvedData.currencies} {columns} rowKey="id">
					{#snippet cell({ row, key })}
						{#if key === 'type'}
							<span
								class="inline-block rounded-full border px-5 py-1 text-sm font-semibold {typeBadge[
									row.type as CurrencyType
								]}"
							>
								{row.type}
							</span>
						{:else if key === 'actions'}
							<button
								onclick={() => openEdit(row as Currency)}
								class="cursor-pointer text-friday-orange"
								title="Editar"
							>
								<SlidersHorizontal size={25} />
							</button>
						{:else if key === 'id'}
							<span class="font-mono text-xs text-gray-400"
								>{(row[key as keyof Currency] as string).slice(0, 8)}…</span
							>
						{:else}
							{row[key as keyof Currency]}
						{/if}
					{/snippet}
				</Table>
			</div>

			<!-- Pagination -->
			{#if resolvedData.pagination.pages > 1}
				<div class="mt-8 flex items-center gap-1">
					{#each visiblePages as page (page)}
						{#if page === '...'}
							<span class="px-2 text-sm text-gray-500 select-none">...</span>
						{:else}
							<button
								onclick={() => goToPage(page as number)}
								class="h-9 w-9 cursor-pointer rounded-lg text-sm font-medium transition-all duration-150
								{currentPage === page
									? 'bg-gray-600 text-white'
									: 'text-gray-400 hover:bg-white/10 hover:text-white'}"
							>
								{page}
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
