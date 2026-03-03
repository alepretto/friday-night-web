<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Currency {
		id: string;
		symbol: string;
		label: string;
	}

	interface Props {
		open: boolean;
		saving?: boolean;
		tagId: string;
		paymentMethodId: string;
		currencies: Currency[];
		defaultCurrencyId: string;
		onclose: () => void;
		onsave: (data: {
			tagId: string;
			paymentMethodId: string;
			currencyId: string;
			value: string;
			symbol: string;
			assetType: string;
			quantity: string;
			price: string;
			description: string;
			dateTransaction: string;
		}) => void;
	}

	let {
		open,
		saving = false,
		tagId,
		paymentMethodId,
		currencies,
		defaultCurrencyId,
		onclose,
		onsave
	}: Props = $props();

	let currencyId = $state(defaultCurrencyId);
	let symbol = $state('');
	let assetType = $state<'stock' | 'etf' | 'bond' | 'cripto'>('stock');
	let quantity = $state('');
	let price = $state('');
	let description = $state('');
	let dateTransaction = $state('');

	// Valor calculado automaticamente: qty × price
	const computedValue = $derived(() => {
		const q = parseFloat(quantity);
		const p = parseFloat(price);
		if (isNaN(q) || isNaN(p)) return '';
		return (q * p).toFixed(2);
	});

	const canSave = $derived(
		!!currencyId && !!symbol.trim() && !!assetType &&
		parseFloat(quantity) > 0 && parseFloat(price) > 0
	);

	$effect(() => {
		if (open) {
			currencyId = defaultCurrencyId;
			symbol = '';
			assetType = 'stock';
			quantity = '';
			price = '';
			description = '';
			dateTransaction = '';
		}
	});

	function handleSave() {
		if (!canSave) return;
		onsave({
			tagId,
			paymentMethodId,
			currencyId,
			value: computedValue(),
			symbol: symbol.trim().toUpperCase(),
			assetType,
			quantity,
			price,
			description,
			dateTransaction
		});
	}

	const inputClass =
		'w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-friday-blue/40 focus:bg-white/[0.08]';

	const labelClass = 'text-xs font-semibold text-white/50';
</script>

<Modal title="Registrar Aporte" {open} {saving} saveLabel="Registrar" {onclose} onsave={handleSave}>
	{#snippet body()}
		<div class="flex flex-col gap-5">

			<!-- Ativo -->
			<div class="flex flex-col gap-3">
				<p class="text-xs font-semibold uppercase tracking-wider text-white/40">Ativo</p>
				<div class="flex gap-3">
					<div class="flex flex-col gap-1 flex-1">
						<label class={labelClass} for="aporte-symbol">Símbolo</label>
						<input
							id="aporte-symbol"
							type="text"
							bind:value={symbol}
							placeholder="PETR4, BTC..."
							class="{inputClass} uppercase"
						/>
					</div>
					<div class="flex flex-col gap-1 w-36">
						<label class={labelClass} for="aporte-asset-type">Tipo</label>
						<select id="aporte-asset-type" bind:value={assetType} class={inputClass}>
							<option class="bg-[#1a1d23]" value="stock">Ação</option>
							<option class="bg-[#1a1d23]" value="etf">ETF</option>
							<option class="bg-[#1a1d23]" value="bond">Renda Fixa</option>
							<option class="bg-[#1a1d23]" value="cripto">Cripto</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<label class={labelClass} for="aporte-qty">Quantidade</label>
						<input
							id="aporte-qty"
							type="number"
							step="0.000001"
							min="0"
							bind:value={quantity}
							placeholder="0"
							class={inputClass}
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class={labelClass} for="aporte-price">Preço unitário (R$)</label>
						<input
							id="aporte-price"
							type="number"
							step="0.01"
							min="0"
							bind:value={price}
							placeholder="0,00"
							class={inputClass}
						/>
					</div>
				</div>

				<!-- Valor total auto-calculado -->
				{#if computedValue()}
					<div class="rounded-lg border border-friday-blue/20 bg-friday-blue/5 px-4 py-2.5">
						<p class="text-xs text-white/40">Total da transação</p>
						<p class="text-lg font-bold text-friday-blue">
							R$ {parseFloat(computedValue()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
						</p>
					</div>
				{/if}
			</div>

			<div class="border-t border-white/8"></div>

			<!-- Moeda + Detalhes opcionais -->
			<div class="flex flex-col gap-3">
				<p class="text-xs font-semibold uppercase tracking-wider text-white/40">Detalhes (opcional)</p>
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1">
						<label class={labelClass} for="aporte-currency">Moeda</label>
						<select id="aporte-currency" bind:value={currencyId} class={inputClass}>
							{#each currencies as c (c.id)}
								<option class="bg-[#1a1d23]" value={c.id}>{c.symbol} — {c.label}</option>
							{/each}
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label class={labelClass} for="aporte-date">Data</label>
						<input
							id="aporte-date"
							type="datetime-local"
							bind:value={dateTransaction}
							class={inputClass}
						/>
					</div>
				</div>
				<div class="flex flex-col gap-1">
					<label class={labelClass} for="aporte-desc">Descrição</label>
					<input
						id="aporte-desc"
						type="text"
						bind:value={description}
						placeholder="opcional"
						class={inputClass}
					/>
				</div>
			</div>

		</div>
	{/snippet}
</Modal>
