<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	type CurrencyType = 'fiat' | 'crypto';

	interface Props {
		open: boolean;
		onsave: (data: { label: string; symbol: string; type: CurrencyType }) => void;
		onclose: () => void;
	}

	let { open, onclose, onsave }: Props = $props();

	let label = $state('');
	let symbol = $state('');
	let type: CurrencyType | '' = $state('');

	function handleSave() {
		if (!label.trim() || !symbol.trim() || !type) return;
		onsave({ label, symbol, type });
		label = '';
		symbol = '';
		type = '';
	}
</script>

<Modal title="New Currency" {open} onclose={() => (open = false)} onsave={handleSave}>
	{#snippet body()}
		<div class="flex flex-col gap-4">
			<div class="flex w-full flex-col gap-3">
				<label class="text-bold pl-4 text-xl" for="label">Descrição</label>
				<input
					bind:value={label}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					type="text"
					id="label"
				/>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div class="flex w-full flex-col gap-3">
					<label class="text-bold pl-4 text-xl" for="symbol">Symbol</label>
					<input
						bind:value={symbol}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
						type="text"
						id="symbol"
					/>
				</div>
				<div class="flex w-full flex-col gap-3">
					<label class="text-bold pl-4 text-xl" for="label">Type</label>
					<select
						name="currency-type"
						id="currency-type"
						bind:value={type}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					>
						<option class="px-4 py-2 text-black" value="">Selecione...</option>
						<option class="px-4 py-2 text-black" value="fiat">Fiat</option>
						<option class="px-4 py-2 text-black" value="crypto">Crypto</option>
					</select>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>
