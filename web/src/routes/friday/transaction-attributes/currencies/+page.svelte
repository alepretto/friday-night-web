<script lang="ts">
	import { SlidersHorizontal } from 'lucide-svelte';
	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';
	import CurrencyModal from './CurrencyModal.svelte';
	import EditCurrencyModal from './EditCurrencyModal.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import { showToast } from '$lib/toast.svelte';
	import { useStreamedData } from '$lib/utils/streamed-data.svelte';
	import { submitAction } from '$lib/utils/form-action';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type CurrencyType = 'fiat' | 'crypto';

	interface Currency {
		id: string;
		label: string;
		symbol: string;
		type: CurrencyType;
	}

	const streamed = useStreamedData(() => data.streamed);

	const columns: Column<Currency>[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'label', label: 'Label', align: 'center' },
		{ key: 'symbol', label: 'Symbol', align: 'center' },
		{ key: 'type', label: 'Type', align: 'center' },
		{ key: 'actions', label: 'Actions', align: 'center' }
	];

	const typeBadge = {
		fiat: 'bg-friday-blue/15 text-friday-blue border-friday-blue/30',
		crypto: 'bg-friday-orange/15 text-friday-orange border-friday-orange/30'
	};

	const currentPage = $derived(streamed.data?.pagination?.page ?? 1);
	const totalPages = $derived(streamed.data?.pagination?.pages ?? 1);

	// Create modal
	let createOpen = $state(false);
	let createSaving = $state(false);
	let createError = $state('');

	async function handleCreate(saveData: { label: string; symbol: string; type: CurrencyType }) {
		createSaving = true;
		createError = '';

		const { success, error } = await submitAction('createCurrency', {
			label: saveData.label,
			symbol: saveData.symbol,
			type: saveData.type
		});
		createSaving = false;

		if (success) {
			createOpen = false;
			showToast('Moeda criada com sucesso!', 'success');
		} else {
			createError = error!;
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

		const { success, error } = await submitAction('updateCurrency', {
			currencyId: saveData.currencyId,
			label: saveData.label,
			symbol: saveData.symbol,
			type: saveData.type
		});
		editSaving = false;

		if (success) {
			editOpen = false;
			showToast('Moeda atualizada com sucesso!', 'success');
		} else {
			showToast(error ?? 'Erro desconhecido', 'error');
		}
	}
</script>

{#if streamed.isLoading}
	<LoadingSpinner message="Carregando moedas..." />
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

	<!-- Action bar -->
	<div class="mb-4 flex justify-end">
		<button
			onclick={() => (createOpen = true)}
			disabled={createSaving}
			class="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
		>
			New Currency
		</button>
	</div>

	<!-- Table -->
	<Table data={streamed.data!.currencies} {columns} rowKey="id">
		{#snippet cell({ row, key })}
			{#if key === 'type'}
				<span
					class="inline-block rounded-full border px-4 py-0.5 text-xs font-semibold {typeBadge[
						row.type as CurrencyType
					]}"
				>
					{row.type === 'fiat' ? 'Fiat' : 'Cripto'}
				</span>
			{:else if key === 'actions'}
				<button
					onclick={() => openEdit(row as Currency)}
					class="text-white/30 transition hover:text-friday-orange"
					title="Editar"
				>
					<SlidersHorizontal size={16} />
				</button>
			{:else if key === 'id'}
				<span class="font-mono text-xs text-white/25">{(row[key as keyof Currency] as string).slice(0, 8)}…</span>
			{:else}
				{row[key as keyof Currency]}
			{/if}
		{/snippet}
	</Table>

	<div class="mt-4 flex justify-center">
		<Pagination {currentPage} {totalPages} />
	</div>
{/if}
