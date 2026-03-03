<script lang="ts">
	import { enhance } from '$app/forms';
	import { showToast } from '$lib/toast.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type TransactionType = 'outcome' | 'income';
	type Tab = 'transaction' | 'tag';

	let activeTab = $state<Tab>('transaction');
	let transactionType = $state<TransactionType>('outcome');

	let selectedCategoryId = $state('');
	let selectedSubcategoryId = $state('');
	let selectedCardId = $state('');
	let selectedPaymentMethodId = $state('');
	let selectedCurrencyId = $state(data.defaultCurrencyId);
	let value = $state('');
	let description = $state('');
	let dateTransaction = $state('');
	let loading = $state(false);

	// Holding fields (investment accounts only)
	let holdingSymbol = $state('');
	let holdingAssetType = $state('stock');
	let holdingQuantity = $state('');
	let holdingPrice = $state('');

	const isInvestment = $derived(
		data.accounts.find((a: { id: string; type: string }) => a.id === data.selectedAccountId)
			?.type === 'investment'
	);

	let newCategoryLabel = $state('');
	let newSubcategoryLabel = $state('');
	let tagLoading = $state(false);

	type ActiveTag = (typeof data.activeTags)[number];
	type ActivePm = (typeof data.activePaymentMethods)[number];

	const filteredTags = $derived(
		data.activeTags.filter((tag: ActiveTag) => tag.type === transactionType)
	);

	const categories = $derived(() => {
		const map = new Map<string, string>();
		for (const tag of filteredTags) map.set(tag.categoryId, tag.categoryLabel);
		return [...map.entries()].map(([id, label]) => ({ id, label }));
	});

	const subcategories = $derived(() => {
		const map = new Map<string, string>();
		for (const tag of filteredTags) {
			if (tag.categoryId === selectedCategoryId) map.set(tag.subcategoryId, tag.subcategoryLabel);
		}
		return [...map.entries()].map(([id, label]) => ({ id, label }));
	});

	const resolvedTagId = $derived(() => {
		const tag = filteredTags.find(
			(t: ActiveTag) => t.categoryId === selectedCategoryId && t.subcategoryId === selectedSubcategoryId
		);
		return tag?.id ?? '';
	});

	const selectedPmLabel = $derived(
		data.activePaymentMethods.find((pm: ActivePm) => pm.id === selectedPaymentMethodId)?.label ?? ''
	);
	const isCreditCard = $derived(selectedPmLabel.toLowerCase().includes('cartão de crédito'));

	$effect(() => {
		selectedCategoryId;
		transactionType;
		selectedSubcategoryId = '';
	});

	$effect(() => {
		if (!isCreditCard) selectedCardId = '';
	});

	$effect(() => {
		if (form?.success) {
			if ((form as { holdingError?: boolean }).holdingError) {
				showToast('Transação registrada, mas falha ao salvar ativo.', 'error');
			} else {
				showToast('Transação registrada!', 'success');
			}
			value = '';
			description = '';
			selectedCategoryId = '';
			selectedSubcategoryId = '';
			selectedCardId = '';
			holdingSymbol = '';
			holdingQuantity = '';
			holdingPrice = '';
		} else if (form?.tagCreated) {
			showToast('Tag criada!', 'success');
			newCategoryLabel = '';
			newSubcategoryLabel = '';
			activeTab = 'transaction';
		} else if (form?.tagError) {
			showToast(form.tagError, 'error');
		} else if (form?.error) {
			showToast(form.error, 'error');
		}
	});

	const inputClass =
		'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-friday-blue/40 focus:bg-white/[0.06]';

	const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/35';
</script>

<!-- Sub-tabs: Transação / Nova tag -->
<div class="flex border-b border-white/8 px-4">
	<button
		type="button"
		onclick={() => (activeTab = 'transaction')}
		class="pb-3 pr-6 text-sm font-medium transition-colors
			{activeTab === 'transaction' ? 'border-b-2 border-friday-blue text-white -mb-px' : 'text-white/30'}"
	>
		Transação
	</button>
	<button
		type="button"
		onclick={() => (activeTab = 'tag')}
		class="pb-3 pr-6 text-sm font-medium transition-colors
			{activeTab === 'tag' ? 'border-b-2 border-friday-blue text-white -mb-px' : 'text-white/30'}"
	>
		Nova tag
	</button>
</div>

<!-- ── Tab: Nova Transação ── -->
{#if activeTab === 'transaction'}
	<div class="flex flex-col gap-4 p-4">

		<!-- Tipo: Saída / Entrada -->
		<div class="grid grid-cols-2 gap-2">
			<button
				type="button"
				onclick={() => (transactionType = 'outcome')}
				class="flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-semibold transition-all
					{transactionType === 'outcome'
					? 'border-failed/40 bg-failed/10 text-red-300'
					: 'border-white/8 bg-white/[0.02] text-white/25'}"
			>
				<span class="text-base leading-none">↓</span>
				<span class="text-xs font-bold uppercase tracking-widest">Saída</span>
			</button>
			<button
				type="button"
				onclick={() => (transactionType = 'income')}
				class="flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-semibold transition-all
					{transactionType === 'income'
					? 'border-success/40 bg-success/10 text-green-300'
					: 'border-white/8 bg-white/[0.02] text-white/25'}"
			>
				<span class="text-base leading-none">↑</span>
				<span class="text-xs font-bold uppercase tracking-widest">Entrada</span>
			</button>
		</div>

		<form
			method="POST"
			action="?/createTransaction"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update({ reset: false });
				};
			}}
			class="flex flex-col gap-3"
		>
			<input type="hidden" name="accountId" value={data.selectedAccountId} />
			<input type="hidden" name="tagId" value={resolvedTagId()} />

			<!-- Valor + Moeda em destaque -->
			<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
				<div class="mb-1 flex items-center justify-between">
					<span class={labelClass}>Valor</span>
					<select
						name="currencyId"
						bind:value={selectedCurrencyId}
						required
						class="bg-transparent text-xs font-semibold text-white/50 outline-none"
					>
						{#each data.currencies as currency}
							<option value={currency.id}>{currency.symbol}</option>
						{/each}
					</select>
				</div>
				<input
					name="value"
					type="number"
					step="0.01"
					min="0"
					bind:value
					required
					placeholder="0,00"
					class="w-full bg-transparent text-3xl font-bold text-white placeholder:text-white/15 outline-none"
				/>
			</div>

			<!-- Categoria + Subcategoria -->
			<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center justify-between">
						<label class={labelClass} for="categoryId">Categoria</label>
						<button
							type="button"
							onclick={() => (activeTab = 'tag')}
							class="text-[10px] font-semibold text-friday-blue"
						>+ nova tag</button>
					</div>
					<select id="categoryId" bind:value={selectedCategoryId} required class={inputClass}>
						<option value="" disabled>Selecionar...</option>
						{#each categories() as cat}
							<option value={cat.id}>{cat.label}</option>
						{/each}
					</select>
				</div>

				{#if selectedCategoryId}
					<div class="flex flex-col gap-1.5">
						<label class={labelClass} for="subcategoryId">Subcategoria</label>
						<select id="subcategoryId" bind:value={selectedSubcategoryId} required class={inputClass}>
							<option value="" disabled>Selecionar...</option>
							{#each subcategories() as sub}
								<option value={sub.id}>{sub.label}</option>
							{/each}
						</select>
					</div>
				{/if}
			</div>

			<!-- Ativo (investment only) -->
			{#if isInvestment}
				<div class="rounded-2xl border border-friday-blue/20 bg-friday-blue/5 p-4 flex flex-col gap-3">
					<p class="{labelClass} text-friday-blue/70">Ativo investido</p>
					<div class="flex gap-2">
						<input
							name="holdingSymbol"
							type="text"
							bind:value={holdingSymbol}
							placeholder="PETR4, BTC..."
							required
							class="{inputClass} flex-1 uppercase"
						/>
						<select
							name="holdingAssetType"
							bind:value={holdingAssetType}
							required
							class="{inputClass} w-36"
						>
							<option value="stock">Ação</option>
							<option value="etf">ETF</option>
							<option value="bond">Renda Fixa</option>
							<option value="cripto">Cripto</option>
						</select>
					</div>
					<div class="flex gap-2">
						<div class="flex flex-col gap-1 flex-1">
							<span class={labelClass}>Quantidade</span>
							<input
								name="holdingQuantity"
								type="number"
								step="0.000001"
								min="0"
								bind:value={holdingQuantity}
								placeholder="0"
								required
								class={inputClass}
							/>
						</div>
						<div class="flex flex-col gap-1 flex-1">
							<span class={labelClass}>Preço unitário</span>
							<input
								name="holdingPrice"
								type="number"
								step="0.01"
								min="0"
								bind:value={holdingPrice}
								placeholder="0,00"
								required
								class={inputClass}
							/>
						</div>
					</div>
				</div>
			{/if}

			<!-- Método de pagamento + Cartão -->
			<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
				<div class="flex flex-col gap-1.5">
					<label class={labelClass} for="paymentMethodId">Método de pagamento</label>
					<select
						id="paymentMethodId"
						name="paymentMethodId"
						bind:value={selectedPaymentMethodId}
						required
						class={inputClass}
					>
						<option value="" disabled>Selecionar...</option>
						{#each data.activePaymentMethods as pm}
							<option value={pm.id}>{pm.label}</option>
						{/each}
					</select>
				</div>

				{#if isCreditCard && data.cards.length > 0}
					<div class="flex flex-col gap-1.5">
						<label class={labelClass} for="cardId">Cartão</label>
						<select id="cardId" name="cardId" bind:value={selectedCardId} class={inputClass}>
							<option value="">Sem cartão específico</option>
							{#each data.cards as card}
								<option value={card.id}>{card.label}</option>
							{/each}
						</select>
					</div>
				{/if}
			</div>

			<!-- Data + Descrição -->
			<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
				<div class="flex flex-col gap-1.5">
					<label class={labelClass} for="dateTransaction">Data</label>
					<input
						id="dateTransaction"
						name="dateTransaction"
						type="datetime-local"
						bind:value={dateTransaction}
						class={inputClass}
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class={labelClass} for="description">Descrição</label>
					<input
						id="description"
						name="description"
						type="text"
						bind:value={description}
						placeholder="opcional"
						class={inputClass}
					/>
				</div>
			</div>

			<!-- Submit -->
			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-2xl py-4 text-sm font-bold tracking-wide text-white transition disabled:opacity-40
					{transactionType === 'income' ? 'bg-success hover:opacity-90' : 'bg-failed hover:opacity-90'}"
			>
				{#if loading}
					<span class="flex items-center justify-center gap-2">
						<span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
						Salvando...
					</span>
				{:else}
					{transactionType === 'income' ? 'Registrar Entrada' : 'Registrar Saída'}
				{/if}
			</button>
		</form>
	</div>

<!-- ── Tab: Nova Tag ── -->
{:else}
	<div class="flex flex-col gap-4 p-4">
		<p class="text-sm text-white/40">Combine categoria e subcategoria para criar uma tag.</p>

		<form
			method="POST"
			action="?/createTag"
			use:enhance={() => {
				tagLoading = true;
				return async ({ update }) => {
					tagLoading = false;
					await update({ reset: false });
				};
			}}
			class="flex flex-col gap-3"
		>
			<!-- Tipo -->
			<fieldset class="flex flex-col gap-1.5">
				<legend class={labelClass}>Tipo</legend>
				<div class="grid grid-cols-2 gap-2 mt-1">
					<label
						class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border py-4 transition-all
							{transactionType === 'outcome'
							? 'border-failed/40 bg-failed/10 text-red-300'
							: 'border-white/8 bg-white/[0.02] text-white/25'}"
					>
						<input type="radio" name="tagType" value="outcome" bind:group={transactionType} class="sr-only" />
						<span class="text-base">↓</span>
						<span class="text-xs font-bold uppercase tracking-widest">Saída</span>
					</label>
					<label
						class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border py-4 transition-all
							{transactionType === 'income'
							? 'border-success/40 bg-success/10 text-green-300'
							: 'border-white/8 bg-white/[0.02] text-white/25'}"
					>
						<input type="radio" name="tagType" value="income" bind:group={transactionType} class="sr-only" />
						<span class="text-base">↑</span>
						<span class="text-xs font-bold uppercase tracking-widest">Entrada</span>
					</label>
				</div>
			</fieldset>

			<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
				<div class="flex flex-col gap-1.5">
					<label class={labelClass} for="categoryLabel">Categoria</label>
					<input
						id="categoryLabel"
						name="categoryLabel"
						type="text"
						bind:value={newCategoryLabel}
						required
						placeholder="Ex: Alimentação"
						class={inputClass}
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class={labelClass} for="subcategoryLabel">Subcategoria</label>
					<input
						id="subcategoryLabel"
						name="subcategoryLabel"
						type="text"
						bind:value={newSubcategoryLabel}
						required
						placeholder="Ex: Restaurante"
						class={inputClass}
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={tagLoading}
				class="w-full rounded-2xl bg-friday-blue py-4 text-sm font-bold tracking-wide text-white transition hover:opacity-90 disabled:opacity-40"
			>
				{tagLoading ? 'Criando...' : 'Criar Tag'}
			</button>
		</form>
	</div>
{/if}
