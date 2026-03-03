<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { form: initialForm, data }: { form: ActionData | undefined; data: PageData } = $props();

	type Stage = 'loading' | 'error' | 'needsLink' | 'selectAccount';

	let stage = $state<Stage>('loading');
	let form = $state(initialForm ?? {});
	let errorMessage = $state('');
	let initData = $state('');
	let authForm: HTMLFormElement;
	let selectedAccountId = $state<string>('');

	// Contas filtradas pelo tipo selecionado
	let selectedAccountType = $state<string>('');
	const filteredAccounts = $derived(
		data.accounts.filter((acc: { type: string }) => acc.type === selectedAccountType)
	);

	onMount(() => {
		const tg = (window as any).Telegram?.WebApp;
		if (tg?.initData) {
			tg.ready();
			initData = tg.initData;
			setTimeout(() => authForm?.requestSubmit(), 0);
		} else {
			errorMessage = 'Abra este app pelo Telegram.';
			stage = 'error';
		}
	});

	$effect(() => {
		if (stage === 'selectAccount' && data.accounts.length > 0) {
			// Selecionar automaticamente o primeiro tipo de conta
			const firstType = data.accounts[0]?.type;
			if (firstType) {
				selectedAccountType = firstType;
				const firstAccount = data.accounts.find((acc: { type: string }) => acc.type === firstType);
				if (firstAccount) {
					selectedAccountId = firstAccount.id;
				}
			}
		}
	});

	// Redirecionar após seleção de conta
	$effect(() => {
		if (form?.redirectUrl) {
			window.location.href = form.redirectUrl;
		}
	});

	let linkLoading = $state(false);
</script>

<!-- Hidden auto-submit form -->
<form bind:this={authForm} method="POST" action="?/auth" use:enhance={() => {
	return async ({ result, update }) => {
		// Primeiro fazer o update para que data.accounts seja preenchido
		await update({ reset: false });
		// Depois atualizar o stage com base no resultado
		if (result.type === 'success') {
			if ((result.data as any)?.success) {
				stage = 'selectAccount';
			}
		} else if (result.type === 'failure') {
			if ((result.data as any)?.needsLink) {
				stage = 'needsLink';
			} else if ((result.data as any)?.error) {
				errorMessage = (result.data as any).error;
				stage = 'error';
			}
		} else if (result.type === 'error') {
			errorMessage = result.error?.message ?? 'Erro desconhecido';
			stage = 'error';
		}
	};
}} class="hidden">
	<input type="hidden" name="init_data" value={initData} />
</form>

{#if stage === 'loading'}
	<div class="flex min-h-screen items-center justify-center">
		<div class="flex flex-col items-center gap-4">
			<div
				class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-friday-blue"
			></div>
			<p class="text-xs uppercase tracking-widest text-white/30">Autenticando</p>
		</div>
	</div>
{:else if stage === 'error'}
	<div class="flex min-h-screen items-center justify-center p-6">
		<div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
			<p class="text-sm text-white/50">{errorMessage}</p>
		</div>
	</div>
{:else if stage === 'needsLink'}
	<!-- needsLink: vincular conta -->
	<div
		class="flex min-h-screen items-center justify-center p-6"
		style="padding-top: max(5rem, calc(var(--tg-safe-area-inset-top, 0px) + 2rem))"
	>
		<div class="w-full max-w-sm">
			<div class="mb-8 text-center">
				<img src="/logo-friday.png" alt="Friday Night" class="mx-auto mb-4 h-12 w-12 rounded-full opacity-90" />
				<h1 class="text-xl font-semibold text-white">Friday Night</h1>
				<p class="mt-1.5 text-sm text-white/40">Vincule sua conta para continuar</p>
			</div>

			{#if form?.error}
				<div class="mb-5 rounded-xl border border-failed/20 bg-failed/10 px-4 py-3 text-sm text-failed">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/link"
				use:enhance={() => {
					linkLoading = true;
					return async ({ update }) => {
						linkLoading = false;
						await update();
					};
				}}
				class="flex flex-col gap-4"
			>
				<input type="hidden" name="init_data" value={initData} />

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="email">
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						placeholder="seu@email.com"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="password">
						Senha
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						placeholder="••••••••"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/25"
					/>
				</div>

				<button
					type="submit"
					disabled={linkLoading}
					class="mt-2 w-full rounded-2xl bg-friday-blue py-4 text-sm font-semibold tracking-wide text-white transition hover:opacity-90 disabled:opacity-40"
				>
					{linkLoading ? 'Vinculando...' : 'Entrar e Vincular'}
				</button>
			</form>
		</div>
	</div>
{:else if stage === 'selectAccount'}
	<!-- Seletor de contas -->
	<div
		class="flex min-h-screen items-center justify-center p-6"
		style="padding-top: max(5rem, calc(var(--tg-safe-area-inset-top, 0px) + 2rem))"
	>
		<div class="w-full max-w-sm">
			<div class="mb-8 text-center">
				<img src="/logo-friday.png" alt="Friday Night" class="mx-auto mb-4 h-12 w-12 rounded-full opacity-90" />
				<h1 class="text-xl font-semibold text-white">Friday Night</h1>
				<p class="mt-1.5 text-sm text-white/40">Selecione sua conta</p>
			</div>

			{#if form?.error}
				<div class="mb-5 rounded-xl border border-failed/20 bg-failed/10 px-4 py-3 text-sm text-failed">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/selectAccount"
				onsubmit={(e) => {
					// Previne o comportamento padrão e faz o redirecionamento manualmente
					e.preventDefault();
					const formData = new FormData(e.target as HTMLFormElement);
					const accountId = formData.get('accountId') as string;
					if (accountId) {
						window.location.href = `/telegram/transaction?account_id=${accountId}`;
					}
				}}
				class="flex flex-col gap-4"
			>
				<input type="hidden" name="init_data" value={initData} />
				<input type="hidden" name="accountId" value={selectedAccountId} />

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="accountType">
						Tipo de Conta
					</label>
					<select
						id="accountType"
						name="accountType"
						bind:value={selectedAccountType}
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
					>
						<option value="" disabled>Tipo...</option>
						{#each data.accountTypes as type}
							<option value={type.id}>{type.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium uppercase tracking-wider text-white/40" for="account">
						Conta
					</label>
					<select
						id="account"
						name="accountId"
						bind:value={selectedAccountId}
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
					>
						<option value="" disabled>Selecione...</option>
						{#each filteredAccounts as account}
							<option value={account.id}>{account.label}</option>
						{/each}
					</select>
				</div>

				<button
					type="submit"
					class="mt-2 w-full rounded-2xl bg-friday-blue py-4 text-sm font-semibold tracking-wide text-white transition hover:opacity-90"
				>
					Continuar
				</button>
			</form>
		</div>
	</div>
{/if}
