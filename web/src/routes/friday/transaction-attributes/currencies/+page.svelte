<script lang="ts">
	import { SlidersHorizontal } from 'lucide-svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';
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

	let label = $state('');
	let symbol = $state('');
	let type: CurrencyType | '' = $state('');

	function handleSave() {
		if (!label.trim() || !symbol.trim()) return;
		if (!type) return;

		symbol = symbol.trim();
		label = label.trim();
		currencies.push({
			id: nextId,
			label,
			symbol,
			type
		});
		label = '';
		symbol = '';
		type = '';
		openModal = false;
	}
</script>

<Modal
	title="New Currency"
	open={openModal}
	onclose={() => (openModal = false)}
	onsave={handleSave}
>
	{#snippet body()}
		<div class="flex flex-col gap-4">
			<div class="flex w-full flex-col gap-3">
				<label class="text-bold pl-4 text-xl" for="label">Descrição</label>
				<input
					bind:value={label}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					type="text"
					id="label"
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="flex w-full flex-col gap-3">
					<label class="text-bold pl-4 text-xl" for="symbol">Symbol</label>
					<input
						bind:value={symbol}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
						type="text"
						id="symbol"
					/>
				</div>
				<div class="flex w-full flex-col gap-3">
					<label class="text-bold pl-4 text-xl" for="label">Type</label>
					<select
						name="currency-type"
						id="currency-type"
						bind:value={type}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					>
						<option class="px-4 py-2 text-black" value="">Selecione...</option>
						<option class="px-4 py-2 text-black" value="fiat">Fiat</option>
						<option class="px-4 py-2 text-black" value="crypto">Crypto</option>
					</select>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>

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
						<button> <SlidersHorizontal size={18} /> </button>
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
