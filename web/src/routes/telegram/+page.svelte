<svelte:head>
	<script src="https://telegram.org/js/telegram-web-app.js"></script>
</svelte:head>

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';

	let { form }: { form: ActionData } = $props();

	let initData = $state('');
	let autoSubmitting = $state(true);
	let loading = $state(false);
	let autoForm = $state<HTMLFormElement | null>(null);

	onMount(() => {
		const tg = (window as any).Telegram?.WebApp;
		if (tg?.initData) {
			initData = tg.initData;
			tg.ready();
		} else {
			autoSubmitting = false;
		}
	});

	$effect(() => {
		if (initData && autoSubmitting && autoForm) {
			autoForm.requestSubmit();
		}
	});
</script>

{#if !initData && !autoSubmitting}
	<div class="flex min-h-screen items-center justify-center p-6">
		<div class="rounded-2xl border border-white/10 bg-secondary/30 p-6 text-center backdrop-blur-sm">
			<p class="text-slate-400">Abra este app pelo Telegram.</p>
		</div>
	</div>
{:else if autoSubmitting && !form?.needsLink}
	<!-- Hidden auto-submit form for Telegram auth -->
	<form
		bind:this={autoForm as HTMLFormElement}
		method="POST"
		action="?/auth"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
	>
		<input type="hidden" name="init_data" value={initData} />
	</form>

	<div class="flex min-h-screen items-center justify-center">
		<div class="flex flex-col items-center gap-4">
			<div class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-friday-blue">
			</div>
			<p class="text-sm text-slate-400">Autenticando...</p>
		</div>
	</div>
{:else}
	<!-- Link account form shown when Telegram ID is not linked yet -->
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
					loading = true;
					return async ({ update }) => {
						loading = false;
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
					disabled={loading}
					class="mt-1 w-full rounded-xl bg-friday-blue px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
				>
					{loading ? 'Vinculando...' : 'Entrar e Vincular'}
				</button>
			</form>
		</div>
	</div>
{/if}
