<script lang="ts">
	import { SlidersHorizontal, CircleCheck, CircleSlash } from 'lucide-svelte';
	import Table from '$lib/components/ui/Table.svelte';
	import type { Column } from '$lib/components/ui/Table.svelte';
	import TransactionTagModal from './TransactionTagModal.svelte';
	import EditTagModal from './EditTagModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import { showToast } from '$lib/toast.svelte';
	import { useStreamedData } from '$lib/utils/streamed-data.svelte';
	import { submitAction } from '$lib/utils/form-action';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	const streamed = useStreamedData(() => data.streamed);

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
		filterCategory && streamed.data ? (streamed.data!.subcategoriesMap![filterCategory] ?? []) : []
	);

	const filteredTags = $derived(
		streamed.data
			? (streamed.data.tags as Tag[]).filter((tag) => {
					if (filterCategory && tag.category_id !== filterCategory) return false;
					if (filterSubcategory && tag.subcategory_id !== filterSubcategory) return false;
					if (filterType && tag.type !== filterType) return false;
					return true;
				})
			: []
	);

	// Pagination
	const currentPage = $derived(streamed.data?.pagination?.page ?? 1);
	const totalPages = $derived(streamed.data?.pagination?.pages ?? 1);

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

		const { success, error } = await submitAction('createTag', {
			type: saveData.type,
			categoryId: saveData.categoryId,
			newCategory: saveData.newCategory,
			subcategoryId: saveData.subcategoryId,
			newSubcategory: saveData.newSubcategory
		});
		saving = false;

		if (success) {
			createOpen = false;
			showToast('Tag criada com sucesso!', 'success');
		} else {
			createError = error!;
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

	async function handleEdit(saveData: {
		tagId: string;
		categoryId: string;
		subcategoryId: string;
	}) {
		editSaving = true;

		const { success, error } = await submitAction('updateTag', {
			tagId: saveData.tagId,
			categoryId: saveData.categoryId,
			subcategoryId: saveData.subcategoryId
		});
		editSaving = false;

		if (success) {
			editOpen = false;
			showToast('Tag atualizada com sucesso!', 'success');
		} else {
			showToast(error ?? 'Erro desconhecido', 'error');
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

		const { success, error } = await submitAction('toggleTag', {
			tagId: confirmTag.id,
			active: String(confirmTag.active)
		});
		toggling = false;

		if (success) {
			const label = confirmTag.active ? 'desativada' : 'ativada';
			showToast(`Tag ${label} com sucesso!`, 'success');
		} else {
			showToast(error ?? 'Erro ao atualizar tag', 'error');
		}

		confirmTag = null;
	}
</script>

{#if streamed.isLoading}
	<LoadingSpinner message="Carregando tags de transação..." />
{:else}
	<TransactionTagModal
		open={createOpen}
		onclose={() => {
			createOpen = false;
			createError = '';
		}}
		onsave={handleCreate}
		{saving}
		categories={streamed.data!.categories!}
		subcategoriesMap={streamed.data!.subcategoriesMap!}
	/>

	{#if editTag}
		<EditTagModal
			open={editOpen}
			saving={editSaving}
			tagId={editTag.id}
			initialCategoryId={editTag.category_id}
			initialSubcategoryId={editTag.subcategory_id}
			categories={streamed.data!.categories!}
			subcategoriesMap={streamed.data!.subcategoriesMap!}
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
						{#each streamed.data!.categories! as cat (cat.id)}
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

			<Pagination {currentPage} {totalPages} />
		</div>
	</section>
{/if}
