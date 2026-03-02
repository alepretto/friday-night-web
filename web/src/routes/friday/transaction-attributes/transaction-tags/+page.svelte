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
		{ key: 'subcategory', label: 'Subcategory', align: 'center' },
		{ key: 'type', label: 'Type', align: 'center' },
		{ key: 'active', label: 'Active', align: 'center' },
		{ key: 'actions', label: 'Actions', align: 'center' }
	];

	const typeBadge = {
		outcome: 'bg-failed/20 text-red-300 border-failed/40',
		income: 'bg-success/20 text-green-300 border-success/40'
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

	<!-- Filters + action bar -->
	<div class="mb-4 flex items-center justify-between gap-4">
		<div class="flex flex-wrap gap-3">
			<!-- Category filter -->
			<select
				bind:value={filterCategory}
				onchange={() => (filterSubcategory = '')}
				class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 outline-none transition focus:border-friday-blue/50 focus:text-white"
			>
				<option value="">Categoria</option>
				{#each streamed.data!.categories! as cat (cat.id)}
					<option value={cat.id}>{cat.label}</option>
				{/each}
			</select>

			<!-- Subcategory filter -->
			<select
				bind:value={filterSubcategory}
				disabled={!filterCategory}
				class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 outline-none transition focus:border-friday-blue/50 focus:text-white disabled:cursor-not-allowed disabled:opacity-40"
			>
				<option value="">Subcategoria</option>
				{#each filterSubcategories as sub (sub.id)}
					<option value={sub.id}>{sub.label}</option>
				{/each}
			</select>

			<!-- Type filter -->
			<select
				bind:value={filterType}
				class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 outline-none transition focus:border-friday-blue/50 focus:text-white"
			>
				<option value="">Tipo</option>
				<option value="outcome">Outcome</option>
				<option value="income">Income</option>
			</select>
		</div>

		<button
			onclick={() => (createOpen = true)}
			disabled={saving}
			class="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
		>
			New Tag
		</button>
	</div>

	<!-- Table -->
	<Table data={filteredTags} {columns} rowKey="id">
		{#snippet cell({ row, key })}
			{#if key === 'type'}
				<span
					class="inline-block rounded-full border px-4 py-0.5 text-xs font-semibold {typeBadge[
						row.type as keyof typeof typeBadge
					]}"
				>
					{row.type === 'outcome' ? 'Outcome' : 'Income'}
				</span>
			{:else if key === 'active'}
				<div class="flex justify-center">
					<div class="h-3 w-3 rounded-full {row[key] ? 'bg-success' : 'bg-failed'}"></div>
				</div>
			{:else if key === 'actions'}
				<div class="flex justify-center gap-3">
					<button
						onclick={() => openEdit(row as Tag)}
						class="text-white/30 transition hover:text-friday-orange"
						title="Editar"
					>
						<SlidersHorizontal size={16} />
					</button>
					<button
						onclick={() => askToggle(row as Tag)}
						disabled={toggling}
						class="transition disabled:opacity-40 {row.active
							? 'text-white/30 hover:text-friday-red'
							: 'text-white/30 hover:text-success'}"
						title={row.active ? 'Desativar' : 'Ativar'}
					>
						{#if row.active}
							<CircleSlash size={16} />
						{:else}
							<CircleCheck size={16} />
						{/if}
					</button>
				</div>
			{:else if key === 'id'}
				<span class="font-mono text-xs text-white/25">{(row[key as keyof Tag] as string).slice(0, 8)}…</span>
			{:else}
				{row[key as keyof Tag]}
			{/if}
		{/snippet}
	</Table>

	<div class="mt-4 flex justify-center">
		<Pagination {currentPage} {totalPages} />
	</div>
{/if}
