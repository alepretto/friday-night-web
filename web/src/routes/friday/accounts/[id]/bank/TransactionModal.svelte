<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	type TagType = 'outcome' | 'income';

	interface TagOption {
		id: string;
		label: string;
		type: TagType;
	}

	interface PaymentMethodOption {
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
			value: string;
			description: string;
			dateTransaction: string;
		}) => void;
		tags: TagOption[];
		paymentMethods: PaymentMethodOption[];
	}

	let { open, saving = false, onclose, onsave, tags, paymentMethods }: Props = $props();

	let selectedType: TagType = $state('outcome');
	let tagId = $state('');
	let paymentMethodId = $state('');
	let value = $state('');
	let description = $state('');
	let dateTransaction = $state(new Date().toISOString().slice(0, 10));

	const filteredTags = $derived(tags.filter((t) => t.type === selectedType));

	$effect(() => {
		if (open) {
			selectedType = 'outcome';
			tagId = '';
			paymentMethodId = '';
			value = '';
			description = '';
			dateTransaction = new Date().toISOString().slice(0, 10);
		}
	});

	function selectType(type: TagType) {
		selectedType = type;
		tagId = '';
	}

	function handleSave() {
		if (!tagId || !paymentMethodId || !value || parseFloat(value) <= 0) return;

		onsave({
			tagId,
			paymentMethodId,
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

			<!-- Tag -->
			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-gray-400" for="tx-tag">Tag</label>
				<select
					id="tx-tag"
					bind:value={tagId}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				>
					<option class="text-black" value="">Selecione...</option>
					{#each filteredTags as tag (tag.id)}
						<option class="text-black" value={tag.id}>{tag.label}</option>
					{/each}
				</select>
			</div>

			<!-- Payment Method -->
			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-gray-400" for="tx-pm">Método de Pagamento</label>
				<select
					id="tx-pm"
					bind:value={paymentMethodId}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				>
					<option class="text-black" value="">Selecione...</option>
					{#each paymentMethods as pm (pm.id)}
						<option class="text-black" value={pm.id}>{pm.label}</option>
					{/each}
				</select>
			</div>

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
					<label class="pl-1 text-sm text-gray-400" for="tx-date">Data</label>
					<input
						id="tx-date"
						type="date"
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
