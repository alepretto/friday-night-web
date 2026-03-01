<script lang="ts">
	import { SlidersHorizontal, CircleCheck, CircleSlash } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';
	import TransactionTagModal from './TransactionTagModal.svelte';
	import EditTagModal from './EditTagModal.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	const filterSubcategories = $derived(
		filterCategory && resolvedData ? (resolvedData.subcategoriesMap[filterCategory] ?? []) : []
	);

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
	let createError = $state('');
	let saving = $state(false);

	async function handleCreate(saveData: {
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
			createOpen = false;
			showToast('Tag criada com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			createError = (result.data?.error as string) ?? 'Erro desconhecido';
			showToast(createError, 'error');
		}
	}

	// Edit modal
	let editOpen = $state(false);
	let editSaving = $state(false);
	let editTag = $state<Tag | null>(null);

	function openEdit(tag: Tag) {
		editTag = tag;
		editOpen = true;
	}

	async function handleEdit(saveData: { tagId: string; categoryId: string; subcategoryId: string }) {
		editSaving = true;

		const formData = new FormData();
		formData.set('tagId', saveData.tagId);
		formData.set('categoryId', saveData.categoryId);
		formData.set('subcategoryId', saveData.subcategoryId);

		const res = await fetch('?/updateTag', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		editSaving = false;

		if (result.type === 'success') {
			editOpen = false;
			showToast('Tag atualizada com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			const msg = (result.data?.error as string) ?? 'Erro desconhecido';
			showToast(msg, 'error');
		}
	}

	// Toggle confirm
	let confirmOpen = $state(false);
	let confirmTag = $state<Tag | null>(null);
	let toggling = $state(false);

	function askToggle(tag: Tag) {
		confirmTag = tag;
		confirmOpen = true;
	}

	async function confirmToggle() {
		if (!confirmTag) return;
		confirmOpen = false;
		toggling = true;

		const formData = new FormData();
		formData.set('tagId', confirmTag.id);
		formData.set('active', String(confirmTag.active));

		const res = await fetch('?/toggleTag', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		toggling = false;

		if (result.type === 'success') {
			const label = confirmTag.active ? 'desativada' : 'ativada';
			showToast(`Tag ${label} com sucesso!`, 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			const msg = (result.data?.error as string) ?? 'Erro ao atualizar tag';
			showToast(msg, 'error');
		}

		confirmTag = null;
	}
</script>

<Toast message={toastMessage} type={toastType} visible={toastVisible} />

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
		open={createOpen}
		onclose={() => {
			createOpen = false;
			createError = '';
		}}
		onsave={handleCreate}
		{saving}
		categories={resolvedData.categories}
		subcategoriesMap={resolvedData.subcategoriesMap}
	/>

	{#if editTag}
		<EditTagModal
			open={editOpen}
			saving={editSaving}
			tagId={editTag.id}
			initialCategoryId={editTag.category_id}
			initialSubcategoryId={editTag.subcategory_id}
			categories={resolvedData.categories}
			subcategoriesMap={resolvedData.subcategoriesMap}
			onclose={() => (editOpen = false)}
			onsave={handleEdit}
		/>
	{/if}

	<ConfirmDialog
		open={confirmOpen}
		title={confirmTag?.active ? 'Desativar tag?' : 'Ativar tag?'}
		message={confirmTag?.active
			? `Tem certeza que deseja desativar a tag "${confirmTag?.category} / ${confirmTag?.subcategory}"?`
			: `Tem certeza que deseja ativar a tag "${confirmTag?.category} / ${confirmTag?.subcategory}"?`}
		confirmLabel={confirmTag?.active ? 'Desativar' : 'Ativar'}
		onconfirm={confirmToggle}
		oncancel={() => {
			confirmOpen = false;
			confirmTag = null;
		}}
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
					onclick={() => (createOpen = true)}
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
								<button
									onclick={() => openEdit(row as Tag)}
									class="cursor-pointer text-friday-orange"
									title="Editar"
								>
									<SlidersHorizontal size={25} />
								</button>

								<button
									onclick={() => askToggle(row as Tag)}
									disabled={toggling}
									class="cursor-pointer disabled:opacity-40 {row.active
										? 'text-friday-red'
										: 'text-success'}"
									title={row.active ? 'Desativar' : 'Ativar'}
								>
									{#if row.active}
										<CircleSlash size={25} />
									{:else}
										<CircleCheck size={25} />
									{/if}
								</button>
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
