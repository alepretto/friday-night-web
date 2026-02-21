<script lang="ts">
	import { SlidersHorizontal } from 'lucide-svelte';

	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';
	import CurrencyModal from './CurrencyModal.svelte';
	type CurrencyType = 'fiat' | 'crypto';

	interface Currency {
		id: number;
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

	const currencies: Currency[] = $state([
		{ id: 1, label: 'Brazilian Real', symbol: 'R$', type: 'fiat' },
		{ id: 2, label: 'United States Dollar', symbol: '$', type: 'fiat' },
		{ id: 3, label: 'Bitcoin', symbol: 'BTC', type: 'crypto' },
		{ id: 4, label: 'Tether', symbol: 'USDT', type: 'crypto' },
		{ id: 5, label: 'Ethereum', symbol: 'ETH', type: 'crypto' }
	]);

	const typeBadge = {
		fiat: 'bg-friday-blue/50 border-blue-600 text-white',
		crypto: 'bg-failed/60 border border-red-900 text-red-200'
	};
	const totalPages = 68;
	let currentPage = $state(1);

	function getVisiblePages(current: number, total: number) {
		if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
		const pages: (number | '...')[] = [1, 2, 3];
		if (current > 4) pages.push('...');
		if (current > 3 && current < total - 1) pages.push(current);
		pages.push('...');
		pages.push(total - 1, total);
		// deduplica
		return [...new Set(pages)];
	}

	const visiblePages = $derived(getVisiblePages(currentPage, totalPages));

	// Campos Modais
	let nextId = $state(6);
	let openModal = $state(false);

	function handleSave(data: { label: string; symbol: string; type: CurrencyType }) {
		currencies.push({ id: nextId, ...data });
		openModal = false;
		nextId = nextId + 1;
	}
</script>

<CurrencyModal open={openModal} onclose={() => (openModal = false)} onsave={handleSave} />

<section>
	<div class="flex items-center justify-end p-10">
		<button
			onclick={() => (openModal = true)}
			class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success"
		>
			New Currency
		</button>
	</div>

	<div class="flex flex-col items-center justify-center font-sans">
		<div class="w-full max-w-7xl">
			<Table data={currencies} {columns} rowKey="id">
				{#snippet cell({ row, key })}
					{#if key === 'type'}
						<span
							class="inline-block rounded-full border px-5 py-1 text-sm font-semibold {typeBadge[
								row.type
							]}"
						>
							{row.type}
						</span>
					{:else if key === 'actions'}
						<button class="cursor-pointer text-friday-orange">
							<SlidersHorizontal size={25} />
						</button>
					{:else}
						{row[key as keyof Currency]}
					{/if}
				{/snippet}
			</Table>
		</div>

		<!-- Pagination -->
		<div class="mt-8 flex items-center gap-1">
			{#each visiblePages as page (page)}
				{#if page === '...'}
					<span class="px-2 text-sm text-gray-500 select-none">...</span>
				{:else}
					<button
						onclick={() => (currentPage = page as number)}
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
	</div>
</section>
