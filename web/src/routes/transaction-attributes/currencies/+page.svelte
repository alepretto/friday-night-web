<script lang="ts">
	import { SlidersHorizontal } from 'lucide-svelte';

	type CurrencyType = 'Fiat' | 'Cripto';

	interface Currency {
		id: number;
		label: string;
		symbol: string;
		type: CurrencyType;
	}

	const currencies: Currency[] = [
		{ id: 1, label: 'Brazilian Real', symbol: 'R$', type: 'Fiat' },
		{ id: 2, label: 'United States Dollar', symbol: '$', type: 'Fiat' },
		{ id: 3, label: 'Bitcoin', symbol: 'BTC', type: 'Cripto' },
		{ id: 4, label: 'Tether', symbol: 'USDT', type: 'Cripto' },
		{ id: 5, label: 'Ethereum', symbol: 'ETH', type: 'Cripto' }
	];

	// Dicionário de cores por tipo
	const typeBadgeClasses: Record<CurrencyType, string> = {
		Fiat: 'bg-blue-600 border-blue-400 text-white',
		Cripto: 'bg-red-900/60 border-red-500 text-red-200'
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
</script>

<section>
	<div class="flex items-center justify-between p-10">
		<div class="flex w-full max-w-3xl gap-5">
			{#each [{ id: 'category', label: 'Category' }, { id: 'subcategory', label: 'Subcategory' }, { id: 'type', label: 'Type' }] as field (field.id)}
				<div class="flex w-full flex-col gap-1">
					<label class="px-2 text-sm text-gray-400" for="transaction-tag-{field.id}">
						{field.label}
					</label>
					<select
						class="w-full rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
						name="transaction-tag-{field.id}"
						id="transaction-tag-{field.id}"
					>
						<option value="">Selecione...</option>
					</select>
				</div>
			{/each}
		</div>

		<button
			class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-4 transition-colors hover:bg-success"
		>
			New Currency
		</button>
	</div>

	<div class="flex flex-col items-center justify-center font-sans">
		<div
			class="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-secondary/30 shadow-2xl"
		>
			<!-- Table -->
			<table class="w-full text-sm text-gray-300">
				<thead>
					<tr class="border-b border-white/10 text-xs tracking-widest text-gray-400 uppercase">
						<th class="px-6 py-5 text-left font-semibold">ID</th>
						<th class="px-6 py-5 text-center font-semibold">Label</th>
						<th class="px-6 py-5 text-center font-semibold">Symbol</th>
						<th class="px-6 py-5 text-center font-semibold">Type</th>
						<th class="px-6 py-5 text-center font-semibold">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each currencies as currency, i (i)}
						<tr class="border-b border-white/5 transition-colors duration-150 hover:bg-white/30">
							<td class="px-6 py-5 text-gray-400">{currency.id}</td>
							<td class="px-6 py-5 text-center text-gray-200">{currency.label}</td>
							<td class="px-6 py-5 text-center text-gray-200">{currency.symbol}</td>
							<td class="px-6 py-5 text-center">
								<span
									class="inline-block rounded-full border px-5 py-1 text-xs font-semibold tracking-wide {typeBadgeClasses[
										currency.type
									]}"
								>
									{currency.type}
								</span>
							</td>
							<td class="px-6 py-5 text-center">
								<button
									class="cursor-pointer text-amber-500 transition-colors duration-150 hover:text-amber-300"
									aria-label="Configurar {currency.label}"
								>
									<SlidersHorizontal size={18} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
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
