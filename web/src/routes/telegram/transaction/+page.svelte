<script lang="ts">
	import { enhance } from '$app/forms';
	import { showToast } from '$lib/toast.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type TransactionType = 'outcome' | 'income';

	let transactionType = $state<TransactionType>('outcome');
	let selectedTagId = $state('');
	let selectedPaymentMethodId = $state('');
	let selectedCurrencyId = $state(data.defaultCurrencyId);
	let selectedAccountId = $state(data.accounts[0]?.id ?? '');
	let value = $state('');
	let description = $state('');
	let dateTransaction = $state('');
	let loading = $state(false);

	const filteredTags = $derived(
		data.activeTags.filter((tag: (typeof data.activeTags)[number]) => tag.type === transactionType)
	);

	$effect(() => {
		if (form?.success) {
			showToast('Transação registrada!', 'success');
			value = '';
			description = '';
			selectedTagId = '';
		} else if (form?.error) {
			showToast(form.error, 'error');
		}
	});

	$effect(() => {
		// Reset tag when transaction type changes
		selectedTagId = '';
	});
</script>

<div class="flex min-h-screen flex-col bg-[#0d0d0f] p-4 pb-8">
	<!-- Header -->
	<div class="mb-6 flex items-center gap-3 pt-2">
		<img src="/logo-friday.png" alt="Friday Night" class="h-9 w-9 rounded-full" />
		<h1 class="text-xl font-extrabold tracking-wide text-secondary italic">Nova Transação</h1>
	</div>

	<!-- Type toggle -->
	<div class="mb-5 flex rounded-xl bg-white/5 p-1">
		<button
			type="button"
			onclick={() => (transactionType = 'outcome')}
			class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all
				{transactionType === 'outcome'
				? 'bg-failed text-white shadow'
				: 'text-slate-400 hover:text-slate-300'}"
		>
			Saída
		</button>
		<button
			type="button"
			onclick={() => (transactionType = 'income')}
			class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all
				{transactionType === 'income'
				? 'bg-success text-white shadow'
				: 'text-slate-400 hover:text-slate-300'}"
		>
			Entrada
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
		<!-- Account -->
		<div class="flex flex-col gap-1.5">
			<label class="pl-1 text-sm text-slate-400" for="accountId">Conta</label>
			<select
				id="accountId"
				name="accountId"
				bind:value={selectedAccountId}
				required
				class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-white/20"
			>
				<option value="" disabled>Selecionar conta</option>
				{#each data.accounts as account}
					<option value={account.id}>{account.label}</option>
				{/each}
			</select>
		</div>

		<!-- Category / Tag -->
		<div class="flex flex-col gap-1.5">
			<label class="pl-1 text-sm text-slate-400" for="tagId">Categoria</label>
			<select
				id="tagId"
				name="tagId"
				bind:value={selectedTagId}
				required
				class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-white/20"
			>
				<option value="" disabled>Selecionar categoria</option>
				{#each filteredTags as tag}
					<option value={tag.id}>{tag.categoryLabel} — {tag.subcategoryLabel}</option>
				{/each}
			</select>
		</div>

		<!-- Payment method -->
		<div class="flex flex-col gap-1.5">
			<label class="pl-1 text-sm text-slate-400" for="paymentMethodId">Método de Pagamento</label>
			<select
				id="paymentMethodId"
				name="paymentMethodId"
				bind:value={selectedPaymentMethodId}
				required
				class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-white/20"
			>
				<option value="" disabled>Selecionar método</option>
				{#each data.activePaymentMethods as pm}
					<option value={pm.id}>{pm.label}</option>
				{/each}
			</select>
		</div>

		<!-- Currency + Value -->
		<div class="flex gap-3">
			<div class="flex flex-col gap-1.5">
				<label class="pl-1 text-sm text-slate-400" for="currencyId">Moeda</label>
				<select
					id="currencyId"
					name="currencyId"
					bind:value={selectedCurrencyId}
					required
					class="rounded-xl bg-white/10 px-3 py-3 text-white outline-none focus:ring-2 focus:ring-white/20"
				>
					{#each data.currencies as currency}
						<option value={currency.id}>{currency.symbol}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-1 flex-col gap-1.5">
				<label class="pl-1 text-sm text-slate-400" for="value">Valor</label>
				<input
					id="value"
					name="value"
					type="number"
					step="0.01"
					min="0"
					bind:value
					required
					class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-white/20"
					placeholder="0.00"
				/>
			</div>
		</div>

		<!-- Date -->
		<div class="flex flex-col gap-1.5">
			<label class="pl-1 text-sm text-slate-400" for="dateTransaction">Data</label>
			<input
				id="dateTransaction"
				name="dateTransaction"
				type="datetime-local"
				bind:value={dateTransaction}
				class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-white/20"
			/>
		</div>

		<!-- Description -->
		<div class="flex flex-col gap-1.5">
			<label class="pl-1 text-sm text-slate-400" for="description">Descrição (opcional)</label>
			<input
				id="description"
				name="description"
				type="text"
				bind:value={description}
				class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-white/20"
				placeholder="Ex: almoço com amigos"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="mt-2 w-full rounded-xl px-4 py-4 text-base font-semibold text-white transition disabled:opacity-50
				{transactionType === 'income' ? 'bg-success hover:opacity-90' : 'bg-failed hover:opacity-90'}"
		>
			{loading ? 'Salvando...' : 'Registrar Transação'}
		</button>
	</form>
</div>
