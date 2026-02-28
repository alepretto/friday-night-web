<script lang="ts">
	import { SlidersHorizontal, CircleCheck, CircleSlash } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';
	import TransactionTagModal from './TransactionTagModal.svelte';
	import type { PageData } from './$types';

	let { data } = $props();

	// === Resolve o streamed ===
	let resolvedData = $state<any>(null);
	let isLoading = $state(true);

	$effect(() => {
		isLoading = true;
		Promise.resolve(data.streamed)
			.then((result) => {
				resolvedData = result;
				isLoading = false;
			})
			.catch((err) => {
				console.error('Erro ao carregar tags:', err);
				isLoading = false;
			});
	});

	type TagType = 'outcome' | 'income';

	interface Tag {
		id: string;
		category: string;
		subcategory: string;
		type: TagType;
		active: boolean;
		category_id: string;
		subcategory_id: string;
	}

	const columns: Column<Tag>[] = [
		{ key: 'id', label: 'ID' },
		{ key: 'category', label: 'Category', align: 'center' },
		{ key: 'subcategory', label: 'Sub-Category', align: 'center' },
		{ key: 'type', label: 'Type', align: 'center' },
		{ key: 'active', label: 'Active', align: 'center' },
		{ key: 'actions', label: 'Actions', align: 'center' }
	];

	const typeBadge = {
		outcome: 'border-failed bg-failed/50',
		income: 'border-success bg-success/50'
	};

	// Filter state
	let filterCategory = $state('');
	let filterSubcategory = $state('');
	let filterType = $state('');

	// Subcategories for filter dropdown
	const filterSubcategories = $derived(
		filterCategory && resolvedData ? (resolvedData.subcategoriesMap[filterCategory] ?? []) : []
	);

	// Client-side filtered tags
	const filteredTags = $derived(
		resolvedData
			? (resolvedData.tags as Tag[]).filter((tag) => {
					if (filterCategory && tag.category_id !== filterCategory) return false;
					if (filterSubcategory && tag.subcategory_id !== filterSubcategory) return false;
					if (filterType && tag.type !== filterType) return false;
					return true;
				})
			: []
	);

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

	// Modal
	let open = $state(false);
	let createError = $state('');
	let saving = $state(false);

	async function handleSave(saveData: {
		type: TagType;
		categoryId: string;
		newCategory: string;
		subcategoryId: string;
		newSubcategory: string;
	}) {
		saving = true;
		createError = '';

		const formData = new FormData();
		formData.set('type', saveData.type);
		formData.set('categoryId', saveData.categoryId);
		formData.set('newCategory', saveData.newCategory);
		formData.set('subcategoryId', saveData.subcategoryId);
		formData.set('newSubcategory', saveData.newSubcategory);

		const res = await fetch('?/createTag', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		saving = false;

		if (result.type === 'success') {
			open = false;
			await invalidateAll();
		} else if (result.type === 'failure') {
			createError = (result.data?.error as string) ?? 'Erro desconhecido';
		}
	}
</script>

{#if isLoading}
	<div class="flex min-h-125 items-center justify-center py-20">
		<div class="flex flex-col items-center gap-4">
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"
			></div>
			<p class="text-sm text-gray-400">Carregando tags de transação...</p>
		</div>
	</div>
{:else}
	<TransactionTagModal
		{open}
		onclose={() => {
			open = false;
			createError = '';
		}}
		onsave={handleSave}
		categories={resolvedData.categories}
		subcategoriesMap={resolvedData.subcategoriesMap}
	/>

	<section>
		<div class="flex items-center justify-between p-10">
			<div class="flex w-full max-w-3xl gap-5">
				<!-- Category filter -->
				<div class="flex w-full flex-col gap-1">
					<label class="px-2 text-sm text-gray-400" for="filter-category">Category</label>
					<select
						id="filter-category"
						bind:value={filterCategory}
						onchange={() => (filterSubcategory = '')}
						class="w-full rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
					>
						<option value="">Todos</option>
						{#each resolvedData.categories as cat (cat.id)}
							<option value={cat.id}>{cat.label}</option>
						{/each}
					</select>
				</div>

				<!-- Subcategory filter -->
				<div class="flex w-full flex-col gap-1">
					<label class="px-2 text-sm text-gray-400" for="filter-subcategory">Subcategory</label>
					<select
						id="filter-subcategory"
						bind:value={filterSubcategory}
						disabled={!filterCategory}
						class="w-full rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40"
					>
						<option value="">Todos</option>
						{#each filterSubcategories as sub (sub.id)}
							<option value={sub.id}>{sub.label}</option>
						{/each}
					</select>
				</div>

				<!-- Type filter -->
				<div class="flex w-full flex-col gap-1">
					<label class="px-2 text-sm text-gray-400" for="filter-type">Type</label>
					<select
						id="filter-type"
						bind:value={filterType}
						class="w-full rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
					>
						<option value="">Todos</option>
						<option value="outcome">Outcome</option>
						<option value="income">Income</option>
					</select>
				</div>
			</div>

			<div class="flex flex-col items-end gap-1">
				{#if createError}
					<p class="text-sm text-failed">{createError}</p>
				{/if}
				<button
					onclick={() => (open = true)}
					disabled={saving}
					class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success disabled:opacity-50"
				>
					New Tag
				</button>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center">
			<div class="w-full max-w-7xl">
				<Table data={filteredTags} {columns} rowKey="id">
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
							<div
								class="m-auto h-4 w-4 rounded-full {row[key] ? 'bg-success' : 'bg-failed'}"
							></div>
						{:else if key === 'actions'}
							<div class="flex justify-center gap-2">
								<button class="cursor-pointer text-friday-orange">
									<SlidersHorizontal size={25} />
								</button>

								<form
									method="POST"
									action="?/toggleTag"
									use:enhance={() =>
										async ({ update }) => {
											await update();
											await invalidateAll();
										}}
								>
									<input type="hidden" name="tagId" value={row.id} />
									<input type="hidden" name="active" value={String(row.active)} />
									{#if !row.active}
										<button type="submit" class="cursor-pointer text-success">
											<CircleCheck size={25} />
										</button>
									{:else}
										<button type="submit" class="cursor-pointer text-friday-red">
											<CircleSlash size={25} />
										</button>
									{/if}
								</form>
							</div>
						{:else if key === 'id'}
							<span class="font-mono text-xs text-gray-400"
								>{(row[key as keyof Tag] as string).slice(0, 8)}…</span
							>
						{:else}
							{row[key as keyof Tag]}
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
