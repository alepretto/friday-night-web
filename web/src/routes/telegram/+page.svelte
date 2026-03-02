<svelte:head>
	<script src="https://telegram.org/js/telegram-web-app.js"></script>
</svelte:head>

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';

	let { form }: { form: ActionData } = $props();

	type Stage = 'loading' | 'error' | 'needsLink';

	let stage = $state<Stage>('loading');
	let errorMessage = $state('');
	let initData = $state('');
	let authForm: HTMLFormElement;

	onMount(() => {
		const tg = (window as any).Telegram?.WebApp;
		if (tg?.initData) {
			tg.ready();
			initData = tg.initData;
			// submit after the DOM updates with the initData value
			setTimeout(() => authForm?.requestSubmit(), 0);
		} else {
			errorMessage = 'Abra este app pelo Telegram.';
			stage = 'error';
		}
	});

	$effect(() => {
		if (!form) return;
		if (form.needsLink) {
			stage = 'needsLink';
		} else if (form.error) {
			errorMessage = form.error;
			stage = 'error';
		}
	});

	let linkLoading = $state(false);
</script>

<!-- Hidden auto-submit form — always in DOM so bind:this is always valid -->
<form
	bind:this={authForm}
	method="POST"
	action="?/auth"
	use:enhance
	class="hidden"
>
	<input type="hidden" name="init_data" value={initData} />
</form>

{#if stage === 'loading'}
	<div class="flex min-h-screen items-center justify-center">
		<div class="flex flex-col items-center gap-4">
			<div class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-friday-blue">
			</div>
			<p class="text-sm text-slate-400">Autenticando...</p>
		</div>
	</div>
{:else if stage === 'error'}
	<div class="flex min-h-screen items-center justify-center p-6">
		<div class="rounded-2xl border border-white/10 bg-secondary/30 p-6 text-center backdrop-blur-sm">
			<p class="text-slate-400">{errorMessage}</p>
		</div>
	</div>
{:else}
	<!-- needsLink: show email + password form -->
	<div class="flex min-h-screen items-center justify-center p-6">
		<div class="w-full max-w-sm rounded-2xl border border-white/10 bg-secondary/30 p-6 backdrop-blur-sm">
			<div class="mb-6 text-center">
				<img src="/logo-friday.png" alt="Friday Night" class="mx-auto mb-3 h-14 w-14 rounded-full" />
				<h1 class="text-2xl font-extrabold tracking-wide text-secondary italic">Friday Night</h1>
				<p class="mt-1 text-sm text-slate-400">Vincule sua conta para continuar</p>
			</div>

			{#if form?.error}
				<div class="mb-4 rounded-xl bg-failed/20 px-4 py-3 text-sm text-failed">
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
					<label class="pl-1 text-sm text-slate-400" for="email">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-white/20"
						placeholder="seu@email.com"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label class="pl-1 text-sm text-slate-400" for="password">Senha</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-white/20"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={linkLoading}
					class="mt-1 w-full rounded-xl bg-friday-blue px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
				>
					{linkLoading ? 'Vinculando...' : 'Entrar e Vincular'}
				</button>
			</form>
		</div>
	</div>
{/if}
