<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	type TagType = 'outcome' | 'income';

	interface TagOption {
		id: string;
		categoryId: string;
		subcategoryId: string;
		categoryLabel: string;
		subcategoryLabel: string;
		type: TagType;
	}

	interface PaymentMethodOption {
		id: string;
		label: string;
	}

	interface CardOption {
		id: string;
		label: string;
	}

	interface Props {
		open: boolean;
		saving?: boolean;
		onclose: () => void;
		onsave: (data: {
			tagId: string;
			paymentMethodId: string;
			cardId: string;
			value: string;
			description: string;
			dateTransaction: string;
		}) => void;
		tags: TagOption[];
		paymentMethods: PaymentMethodOption[];
		cards: CardOption[];
	}

	let { open, saving = false, onclose, onsave, tags, paymentMethods, cards }: Props = $props();

	let selectedType: TagType = $state('outcome');
	let categoryId = $state('');
	let subcategoryId = $state('');
	let paymentMethodId = $state('');
	let cardId = $state('');
	let value = $state('');
	let description = $state('');
	let dateTransaction = $state(nowLocal());

	// Categorias únicas filtradas pelo tipo
	const categories = $derived(() => {
		const map = new Map<string, string>();
		for (const tag of tags) {
			if (tag.type === selectedType) {
				map.set(tag.categoryId, tag.categoryLabel);
			}
		}
		return [...map.entries()].map(([id, label]) => ({ id, label }));
	});

	// Subcategorias filtradas pela categoria selecionada
	const subcategories = $derived(() => {
		const map = new Map<string, string>();
		for (const tag of tags) {
			if (tag.type === selectedType && tag.categoryId === categoryId) {
				map.set(tag.subcategoryId, tag.subcategoryLabel);
			}
		}
		return [...map.entries()].map(([id, label]) => ({ id, label }));
	});

	// Resolve tag_id a partir de categoria + subcategoria
	const resolvedTagId = $derived(() => {
		const tag = tags.find(
			(t) =>
				t.type === selectedType && t.categoryId === categoryId && t.subcategoryId === subcategoryId
		);
		return tag?.id ?? '';
	});

	const selectedPmLabel = $derived(
		paymentMethods.find((pm) => pm.id === paymentMethodId)?.label ?? ''
	);
	const isCreditCard = $derived(selectedPmLabel.toLowerCase().includes('cartão de crédito'));

	function nowLocal(): string {
		const d = new Date();
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
		return d.toISOString().slice(0, 16);
	}

	$effect(() => {
		if (open) {
			selectedType = 'outcome';
			categoryId = '';
			subcategoryId = '';
			paymentMethodId = '';
			cardId = '';
			value = '';
			description = '';
			dateTransaction = nowLocal();
		}
	});

	function selectType(type: TagType) {
		selectedType = type;
		categoryId = '';
		subcategoryId = '';
	}

	function handleCategoryChange() {
		subcategoryId = '';
	}

	function handlePmChange() {
		cardId = '';
	}

	function handleSave() {
		const tagId = resolvedTagId();
		if (!tagId || !paymentMethodId || !value || parseFloat(value) <= 0) return;
		if (isCreditCard && !cardId) return;

		onsave({
			tagId,
			paymentMethodId,
			cardId,
			value,
			description: description.trim(),
			dateTransaction
		});
	}
</script>

<Modal title="Nova Transação" {open} {saving} {onclose} onsave={handleSave}>
	{#snippet body()}
		<div class="flex w-full flex-col gap-6 px-4">
			<!-- Type toggle -->
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
						{type === 'outcome' ? 'Saída' : 'Entrada'}
					</button>
				{/each}
			</div>

			<!-- Categoria e Subcategoria -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="tx-category">Categoria</label>
					<select
						id="tx-category"
						bind:value={categoryId}
						onchange={handleCategoryChange}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					>
						<option class="text-black" value="">Selecione...</option>
						{#each categories() as cat (cat.id)}
							<option class="text-black" value={cat.id}>{cat.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="tx-subcategory">Subcategoria</label>
					<select
						id="tx-subcategory"
						bind:value={subcategoryId}
						disabled={!categoryId}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40"
					>
						<option class="text-black" value="">Selecione...</option>
						{#each subcategories() as sub (sub.id)}
							<option class="text-black" value={sub.id}>{sub.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Payment Method -->
			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-gray-400" for="tx-pm">Método de Pagamento</label>
				<select
					id="tx-pm"
					bind:value={paymentMethodId}
					onchange={handlePmChange}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				>
					<option class="text-black" value="">Selecione...</option>
					{#each paymentMethods as pm (pm.id)}
						<option class="text-black" value={pm.id}>{pm.label}</option>
					{/each}
				</select>
			</div>

			<!-- Card selector (only when credit card) -->
			{#if isCreditCard}
				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="tx-card">Cartão</label>
					<select
						id="tx-card"
						bind:value={cardId}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					>
						<option class="text-black" value="">Selecione o cartão...</option>
						{#each cards as card (card.id)}
							<option class="text-black" value={card.id}>{card.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Value and Date -->
			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="tx-value">Valor (R$)</label>
					<input
						id="tx-value"
						type="number"
						min="0.01"
						step="0.01"
						bind:value
						placeholder="0.00"
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-white/20"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="tx-date">Data e Hora</label>
					<input
						id="tx-date"
						type="datetime-local"
						bind:value={dateTransaction}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					/>
				</div>
			</div>

			<!-- Description -->
			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-gray-400" for="tx-desc">Descrição (opcional)</label>
				<input
					id="tx-desc"
					type="text"
					bind:value={description}
					placeholder="Ex: Almoço no restaurante"
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-white/20"
				/>
			</div>
		</div>
	{/snippet}
</Modal>
