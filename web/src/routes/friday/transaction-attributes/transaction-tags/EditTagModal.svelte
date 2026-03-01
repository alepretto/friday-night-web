<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Category {
		id: string;
		label: string;
		type: 'outcome' | 'income';
	}

	interface Subcategory {
		id: string;
		label: string;
	}

	interface Props {
		open: boolean;
		saving?: boolean;
		tagId: string;
		initialCategoryId: string;
		initialSubcategoryId: string;
		categories: Category[];
		subcategoriesMap: Record<string, Subcategory[]>;
		onclose: () => void;
		onsave: (data: { tagId: string; categoryId: string; subcategoryId: string }) => void;
	}

	let {
		open,
		saving = false,
		tagId,
		initialCategoryId,
		initialSubcategoryId,
		categories,
		subcategoriesMap,
		onclose,
		onsave
	}: Props = $props();

	let categoryId = $state(initialCategoryId);
	let subcategoryId = $state(initialSubcategoryId);

	$effect(() => {
		if (open) {
			categoryId = initialCategoryId;
			subcategoryId = initialSubcategoryId;
		}
	});

	const subcategories = $derived(categoryId ? (subcategoriesMap[categoryId] ?? []) : []);

	function handleSave() {
		if (!categoryId || !subcategoryId) return;
		onsave({ tagId, categoryId, subcategoryId });
	}
</script>

<Modal title="Editar Tag" {open} {onclose} onsave={handleSave} {saving}>
	{#snippet body()}
		<div class="flex w-full flex-col gap-6 px-4 pb-4">
			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-gray-400" for="edit-tag-category">Categoria</label>
				<select
					id="edit-tag-category"
					bind:value={categoryId}
					onchange={() => (subcategoryId = '')}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				>
					<option class="text-black" value="">Selecione...</option>
					{#each categories as cat (cat.id)}
						<option class="text-black" value={cat.id}>{cat.label}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-gray-400" for="edit-tag-subcategory">Subcategoria</label>
				<select
					id="edit-tag-subcategory"
					bind:value={subcategoryId}
					disabled={!categoryId}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40"
				>
					<option class="text-black" value="">Selecione...</option>
					{#each subcategories as sub (sub.id)}
						<option class="text-black" value={sub.id}>{sub.label}</option>
					{/each}
				</select>
			</div>
		</div>
	{/snippet}
</Modal>
