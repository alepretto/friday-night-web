<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	type TagType = 'outcome' | 'income';

	interface Category {
		id: string;
		label: string;
		type: TagType;
	}

	interface Subcategory {
		id: string;
		label: string;
	}

	interface Props {
		open: boolean;
		saving?: boolean;
		onclose: () => void;
		onsave: (data: {
			type: TagType;
			categoryId: string;
			newCategory: string;
			subcategoryId: string;
			newSubcategory: string;
		}) => void;
		categories: Category[];
		subcategoriesMap: Record<string, Subcategory[]>;
	}

	let { open, onclose, onsave, saving = false, categories, subcategoriesMap }: Props = $props();

	let selectedType: TagType = $state('outcome');
	let categoryId = $state('');
	let newCategory = $state('');
	let subcategoryId = $state('');
	let newSubcategory = $state('');

	const filteredCategories = $derived(categories.filter((c) => c.type === selectedType));

	const filteredSubcategories = $derived(categoryId ? (subcategoriesMap[categoryId] ?? []) : []);

	function selectType(type: TagType) {
		selectedType = type;
		categoryId = '';
		subcategoryId = '';
		newCategory = '';
		newSubcategory = '';
	}

	function handleCategoryChange() {
		subcategoryId = '';
		newSubcategory = '';
	}

	function handleSave() {
		const hasCategory = categoryId !== '' || newCategory.trim() !== '';
		const hasSubcategory = subcategoryId !== '' || newSubcategory.trim() !== '';

		if (!hasCategory || !hasSubcategory) return;

		onsave({
			type: selectedType,
			categoryId,
			newCategory: newCategory.trim(),
			subcategoryId,
			newSubcategory: newSubcategory.trim()
		});

		selectedType = 'outcome';
		categoryId = '';
		newCategory = '';
		subcategoryId = '';
		newSubcategory = '';
	}
</script>

<Modal title="New Tag" {open} {onclose} onsave={handleSave} {saving}>
	{#snippet body()}
		<div class="flex flex-col gap-6">
			<div class="flex rounded-full border border-white/10 bg-white/5 p-1">
				{#each ['outcome', 'income'] as TagType[] as type (type)}
					<button
						onclick={() => selectType(type)}
						class="flex-1 cursor-pointer rounded-full py-2 text-sm font-semibold {selectedType ===
						type
							? type === 'outcome'
								? 'bg-friday-red text-white shadow'
								: 'bg-friday-blue text-white shadow'
							: 'text-gray-400 hover:text-white'}"
					>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</button>
				{/each}
			</div>

			<!-- Categoria + Nova Categoria -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="category">Categoria</label>
					<select
						id="category"
						bind:value={categoryId}
						onchange={handleCategoryChange}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					>
						<option class="text-black" value="">Selecione...</option>
						{#each filteredCategories as cat (cat.id)}
							<option class="text-black" value={cat.id}>{cat.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="new-category">Nova Categoria</label>
					<input
						id="new-category"
						bind:value={newCategory}
						placeholder="Digite..."
						disabled={categoryId !== ''}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none placeholder:text-gray-500
              focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40"
					/>
				</div>
			</div>

			<!-- Subcategoria + Nova Subcategoria -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="subcategory">Subcategoria</label>
					<select
						id="subcategory"
						bind:value={subcategoryId}
						disabled={categoryId === '' && newCategory.trim() === ''}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20
              disabled:cursor-not-allowed disabled:opacity-40"
					>
						<option class="text-black" value="">Selecione...</option>
						{#each filteredSubcategories as sub (sub.id)}
							<option class="text-black" value={sub.id}>{sub.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="new-subcategory">Nova Subcategoria</label>
					<input
						id="new-subcategory"
						bind:value={newSubcategory}
						placeholder="Digite..."
						disabled={subcategoryId !== ''}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none placeholder:text-gray-500
              focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40"
					/>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>
