<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	type CurrencyType = 'fiat' | 'crypto';

	interface Props {
		open: boolean;
		saving?: boolean;
		currencyId: string;
		initialLabel: string;
		initialSymbol: string;
		initialType: CurrencyType;
		onclose: () => void;
		onsave: (data: {
			currencyId: string;
			label: string;
			symbol: string;
			type: CurrencyType;
		}) => void;
	}

	let {
		open,
		saving = false,
		currencyId,
		initialLabel,
		initialSymbol,
		initialType,
		onclose,
		onsave
	}: Props = $props();

	let label = $state(initialLabel);
	let symbol = $state(initialSymbol);
	let type = $state<CurrencyType>(initialType);

	$effect(() => {
		if (open) {
			label = initialLabel;
			symbol = initialSymbol;
			type = initialType;
		}
	});

	function handleSave() {
		if (!label.trim() || !symbol.trim() || !type) return;
		onsave({ currencyId, label: label.trim(), symbol: symbol.trim(), type });
	}
</script>

<Modal title="Editar Moeda" {open} {onclose} onsave={handleSave} {saving}>
	{#snippet body()}
		<div class="flex w-full flex-col gap-4 px-4 pb-2">
			<div class="flex w-full flex-col gap-3">
				<label class="text-bold pl-4 text-xl" for="edit-label">Descrição</label>
				<input
					bind:value={label}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					type="text"
					id="edit-label"
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="flex w-full flex-col gap-3">
					<label class="text-bold pl-4 text-xl" for="edit-symbol">Symbol</label>
					<input
						bind:value={symbol}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
						type="text"
						id="edit-symbol"
					/>
				</div>
				<div class="flex w-full flex-col gap-3">
					<label class="text-bold pl-4 text-xl" for="edit-currency-type">Type</label>
					<select
						id="edit-currency-type"
						bind:value={type}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					>
						<option class="text-black" value="fiat">Fiat</option>
						<option class="text-black" value="crypto">Crypto</option>
					</select>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>
