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

<!-- Hidden auto-submit form -->
<form bind:this={authForm} method="POST" action="?/auth" use:enhance class="hidden">
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
{:else}
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
{/if}
