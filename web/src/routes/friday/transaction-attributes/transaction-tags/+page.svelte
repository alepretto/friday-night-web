<script lang="ts">
	import { SlidersHorizontal, CircleCheck, CircleSlash } from 'lucide-svelte';
	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';

	interface Tag {
		id: number;
		category: string;
		subcategory: string;
		type: string;
		active: boolean;
	}

	const columns: Column<Tag>[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'category', label: 'Category', align: 'center' },
		{ key: 'subcategory', label: 'Sub-Category', align: 'center' },
		{ key: 'type', label: 'Type', align: 'center' },
		{ key: 'active', label: 'Active', align: 'center' },
		{ key: 'actions', label: 'Actions', align: 'center' }
	];

	const tags: Tag[] = [
		{ id: 1, category: 'Alimentação', subcategory: 'Café da Manhã', type: 'outcome', active: true },
		{ id: 2, category: 'Alimentação', subcategory: 'Almoço', type: 'outcome', active: true },
		{ id: 3, category: 'Transaporte', subcategory: 'Gasolina', type: 'outcome', active: false },
		{
			id: 4,
			category: 'Transaporte',
			subcategory: 'Estacionamento',
			type: 'outcome',
			active: true
		},
		{ id: 5, category: 'Salário', subcategory: 'Salário Mensal', type: 'income', active: true }
	];

	const typeBadge = {
		outcome: 'border-failed bg-failed/50',
		income: 'border-success bg-success/50'
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
			class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success"
		>
			New Tag
		</button>
	</div>

	<div class="flex flex-col items-center justify-center">
		<div class="w-full max-w-7xl">
			<Table data={tags} {columns} rowKey="id">
				{#snippet cell({ row, key })}
					{#if key === 'type'}
						<div
							class="m-auto max-w-30 rounded-2xl border p-1 font-bold {typeBadge[
								row.type as keyof typeof typeBadge
							]}"
						>
							{row[key]}
						</div>
					{:else if key === 'active'}
						<div class="m-auto h-4 w-4 rounded-full {row[key] ? 'bg-success' : 'bg-failed'}"></div>
					{:else if key === 'actions'}
						<div class="flex justify-center gap-2">
							<button class="cursor-pointer text-friday-orange">
								<SlidersHorizontal size={25} />
							</button>

							{#if !row.active}
								<button class="cursor-pointer text-success">
									<CircleCheck size={25} />
								</button>
							{:else}
								<button class="cursor-pointer text-friday-red">
									<CircleSlash size={25} />
								</button>
							{/if}
						</div>
					{:else}
						{row[key as keyof Tag]}
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
