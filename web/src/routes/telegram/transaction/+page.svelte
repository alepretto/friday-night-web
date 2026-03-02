<script lang="ts">
	import { enhance } from '$app/forms';
	import { showToast } from '$lib/toast.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type TransactionType = 'outcome' | 'income';
	type Tab = 'transaction' | 'tag';

	let activeTab = $state<Tab>('transaction');
	let transactionType = $state<TransactionType>('outcome');

	// Cascade category selectors
	let selectedCategoryId = $state('');
	let selectedSubcategoryId = $state('');
	let selectedCardId = $state('');
	let selectedPaymentMethodId = $state('');
	let selectedCurrencyId = $state(data.defaultCurrencyId);
	let value = $state('');
	let description = $state('');
	let dateTransaction = $state('');
	let loading = $state(false);

	let newCategoryLabel = $state('');
	let newSubcategoryLabel = $state('');
	let tagLoading = $state(false);

	type ActiveTag = (typeof data.activeTags)[number];
	type ActivePm = (typeof data.activePaymentMethods)[number];

	// Tags filtered by transaction type
	const filteredTags = $derived(
		data.activeTags.filter((tag: ActiveTag) => tag.type === transactionType)
	);

	// Unique categories from filtered tags
	const categories = $derived(() => {
		const map = new Map<string, string>();
		for (const tag of filteredTags) {
			map.set(tag.categoryId, tag.categoryLabel);
		}
		return [...map.entries()].map(([id, label]) => ({ id, label }));
	});

	// Subcategories filtered by selected category
	const subcategories = $derived(() => {
		const map = new Map<string, string>();
		for (const tag of filteredTags) {
			if (tag.categoryId === selectedCategoryId) {
				map.set(tag.subcategoryId, tag.subcategoryLabel);
			}
		}
		return [...map.entries()].map(([id, label]) => ({ id, label }));
	});

	// Resolve tag ID from category + subcategory
	const resolvedTagId = $derived(() => {
		const tag = filteredTags.find(
			(t: ActiveTag) => t.categoryId === selectedCategoryId && t.subcategoryId === selectedSubcategoryId
		);
		return tag?.id ?? '';
	});

	// Credit card detection
	const selectedPmLabel = $derived(
		data.activePaymentMethods.find((pm: ActivePm) => pm.id === selectedPaymentMethodId)?.label ?? ''
	);
	const isCreditCard = $derived(selectedPmLabel.toLowerCase().includes('cartão de crédito'));

	// Reset subcategory when category or type changes
	$effect(() => {
		selectedCategoryId;
		transactionType;
		selectedSubcategoryId = '';
	});

	// Reset card when payment method is not credit card
	$effect(() => {
		if (!isCreditCard) selectedCardId = '';
	});

	$effect(() => {
		if (form?.success) {
			showToast('Transação registrada!', 'success');
			value = '';
			description = '';
			selectedCategoryId = '';
			selectedSubcategoryId = '';
			selectedCardId = '';
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
</script>

<!-- Sub-tabs -->
<div class="flex border-b border-white/10 px-5">
	<button
		type="button"
		onclick={() => (activeTab = 'transaction')}
		class="pb-3 pr-7 text-sm font-medium transition-colors
			{activeTab === 'transaction'
			? 'border-b-2 border-friday-blue text-white'
			: 'text-white/30 hover:text-white/50'}"
	>
		Transação
	</button>
	<button
		type="button"
		onclick={() => (activeTab = 'tag')}
		class="pb-3 pr-7 text-sm font-medium transition-colors
			{activeTab === 'tag'
			? 'border-b-2 border-friday-blue text-white'
			: 'text-white/30 hover:text-white/50'}"
	>
		Nova tag
	</button>
</div>

<!-- Tab: Transação -->
{#if activeTab === 'transaction'}
	<div class="flex flex-col gap-5 p-5">
		<!-- Type selector -->
		<div class="grid grid-cols-2 gap-3">
			<button
				type="button"
				onclick={() => (transactionType = 'outcome')}
				class="flex flex-col items-center gap-2 rounded-2xl border py-5 transition-all
					{transactionType === 'outcome'
					? 'border-failed/40 bg-failed/10 text-failed'
					: 'border-white/10 bg-white/[0.03] text-white/25 hover:text-white/40'}"
			>
				<span class="text-xl leading-none">↓</span>
				<span class="text-xs font-semibold uppercase tracking-widest">Saída</span>
			</button>
			<button
				type="button"
				onclick={() => (transactionType = 'income')}
				class="flex flex-col items-center gap-2 rounded-2xl border py-5 transition-all
					{transactionType === 'income'
					? 'border-success/40 bg-success/10 text-success'
					: 'border-white/10 bg-white/[0.03] text-white/25 hover:text-white/40'}"
			>
				<span class="text-xl leading-none">↑</span>
				<span class="text-xs font-semibold uppercase tracking-widest">Entrada</span>
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
			class="flex flex-col gap-4"
		>
			<!-- Hidden fields -->
			<input type="hidden" name="accountId" value={data.selectedAccountId} />
			<input type="hidden" name="tagId" value={resolvedTagId()} />

			<!-- Categoria (cascade step 1) -->
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="categoryId">
						Categoria
					</label>
					<button
						type="button"
						onclick={() => (activeTab = 'tag')}
						class="text-xs text-friday-blue transition hover:opacity-70"
					>
						+ nova tag
					</button>
				</div>
				<select
					id="categoryId"
					bind:value={selectedCategoryId}
					required
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
				>
					<option value="" disabled>Selecionar categoria</option>
					{#each categories() as cat}
						<option value={cat.id}>{cat.label}</option>
					{/each}
				</select>
			</div>

			<!-- Subcategoria (cascade step 2) -->
			{#if selectedCategoryId}
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="subcategoryId">
						Subcategoria
					</label>
					<select
						id="subcategoryId"
						bind:value={selectedSubcategoryId}
						required
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
					>
						<option value="" disabled>Selecionar subcategoria</option>
						{#each subcategories() as sub}
							<option value={sub.id}>{sub.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Método de pagamento -->
			<div class="flex flex-col gap-1.5">
				<label
					class="text-xs font-medium uppercase tracking-wider text-white/40"
					for="paymentMethodId"
				>
					Método de pagamento
				</label>
				<select
					id="paymentMethodId"
					name="paymentMethodId"
					bind:value={selectedPaymentMethodId}
					required
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
				>
					<option value="" disabled>Selecionar método</option>
					{#each data.activePaymentMethods as pm}
						<option value={pm.id}>{pm.label}</option>
					{/each}
				</select>
			</div>

			<!-- Cartão (condicional: apenas quando crédito) -->
			{#if isCreditCard && data.cards.length > 0}
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="cardId">
						Cartão
					</label>
					<select
						id="cardId"
						name="cardId"
						bind:value={selectedCardId}
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
					>
						<option value="">Sem cartão específico</option>
						{#each data.cards as card}
							<option value={card.id}>{card.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Moeda + Valor -->
			<div class="flex gap-3">
				<div class="flex flex-col gap-1.5">
					<label
						class="text-xs font-medium uppercase tracking-wider text-white/40"
						for="currencyId"
					>
						Moeda
					</label>
					<select
						id="currencyId"
						name="currencyId"
						bind:value={selectedCurrencyId}
						required
						class="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-white/25"
					>
						{#each data.currencies as currency}
							<option value={currency.id}>{currency.symbol}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-1 flex-col gap-1.5">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="value">
						Valor
					</label>
					<input
						id="value"
						name="value"
						type="number"
						step="0.01"
						min="0"
						bind:value
						required
						placeholder="0,00"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25"
					/>
				</div>
			</div>

			<!-- Data -->
			<div class="flex flex-col gap-1.5">
				<label
					class="text-xs font-medium uppercase tracking-wider text-white/40"
					for="dateTransaction"
				>
					Data
				</label>
				<input
					id="dateTransaction"
					name="dateTransaction"
					type="datetime-local"
					bind:value={dateTransaction}
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
				/>
			</div>

			<!-- Descrição -->
			<div class="flex flex-col gap-1.5">
				<label
					class="text-xs font-medium uppercase tracking-wider text-white/40"
					for="description"
				>
					Descrição
				</label>
				<input
					id="description"
					name="description"
					type="text"
					bind:value={description}
					placeholder="opcional"
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="mt-1 w-full rounded-2xl py-4 text-sm font-semibold tracking-wide text-white transition disabled:opacity-40
					{transactionType === 'income' ? 'bg-success hover:opacity-90' : 'bg-failed hover:opacity-90'}"
			>
				{loading
					? 'Salvando...'
					: transactionType === 'income'
						? 'Registrar Entrada'
						: 'Registrar Saída'}
			</button>
		</form>
	</div>

<!-- Tab: Nova Tag -->
{:else}
	<div class="flex flex-col gap-5 p-5">
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
			class="flex flex-col gap-4"
		>
			<!-- Tipo da tag -->
			<fieldset class="flex flex-col gap-1.5">
				<legend class="text-xs font-medium uppercase tracking-wider text-white/40">Tipo</legend>
				<div class="grid grid-cols-2 gap-3">
					<label
						class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border py-4 transition-all
							{transactionType === 'outcome'
							? 'border-failed/40 bg-failed/10 text-failed'
							: 'border-white/10 bg-white/[0.03] text-white/25'}"
					>
						<input
							type="radio"
							name="tagType"
							value="outcome"
							bind:group={transactionType}
							class="sr-only"
						/>
						<span class="text-xl leading-none">↓</span>
						<span class="text-xs font-semibold uppercase tracking-widest">Saída</span>
					</label>
					<label
						class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border py-4 transition-all
							{transactionType === 'income'
							? 'border-success/40 bg-success/10 text-success'
							: 'border-white/10 bg-white/[0.03] text-white/25'}"
					>
						<input
							type="radio"
							name="tagType"
							value="income"
							bind:group={transactionType}
							class="sr-only"
						/>
						<span class="text-xl leading-none">↑</span>
						<span class="text-xs font-semibold uppercase tracking-widest">Entrada</span>
					</label>
				</div>
			</fieldset>

			<!-- Categoria -->
			<div class="flex flex-col gap-1.5">
				<label
					class="text-xs font-medium uppercase tracking-wider text-white/40"
					for="categoryLabel"
				>
					Categoria
				</label>
				<input
					id="categoryLabel"
					name="categoryLabel"
					type="text"
					bind:value={newCategoryLabel}
					required
					placeholder="Ex: Alimentação"
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25"
				/>
			</div>

			<!-- Subcategoria -->
			<div class="flex flex-col gap-1.5">
				<label
					class="text-xs font-medium uppercase tracking-wider text-white/40"
					for="subcategoryLabel"
				>
					Subcategoria
				</label>
				<input
					id="subcategoryLabel"
					name="subcategoryLabel"
					type="text"
					bind:value={newSubcategoryLabel}
					required
					placeholder="Ex: Restaurante"
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25"
				/>
			</div>

			<button
				type="submit"
				disabled={tagLoading}
				class="mt-1 w-full rounded-2xl bg-friday-blue py-4 text-sm font-semibold tracking-wide text-white transition hover:opacity-90 disabled:opacity-40"
			>
				{tagLoading ? 'Criando...' : 'Criar Tag'}
			</button>
		</form>
	</div>
{/if}
