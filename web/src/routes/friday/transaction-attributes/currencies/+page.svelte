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
		fiat: 'bg-friday-blue/50 border-blue-600 text-white',
		crypto: 'bg-failed/60 border border-red-900 text-red-200'
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
				<Table data={streamed.data!.currencies} {columns} rowKey="id">
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

			<Pagination {currentPage} {totalPages} />
		</div>
	</section>
{/if}
