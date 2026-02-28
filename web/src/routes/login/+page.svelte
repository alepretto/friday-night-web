<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
</script>

<div class="flex h-screen w-screen items-center justify-center bg-[#0d0d0f]">
	<div
		class="w-full max-w-md rounded-2xl border border-white/10 bg-secondary/30 p-8 backdrop-blur-sm"
	>
		<div class="mb-8 text-center">
			<img src="/logo-friday.png" alt="Friday Night" class="mx-auto mb-4 h-16 w-16 rounded-full" />
			<h1 class="text-3xl font-extrabold tracking-wide text-secondary italic">Friday Night</h1>
		</div>

		{#if form?.error}
			<div class="mb-4 rounded-xl bg-failed/20 px-4 py-3 text-sm text-failed">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="flex flex-col gap-5"
		>
			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-slate-400" for="username">Usuário</label>
				<input
					id="username"
					name="username"
					type="text"
					required
					class="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-white/20"
					placeholder="seu usuário"
				/>
			</div>

			<div class="flex flex-col gap-2">
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
				class="mt-2 w-full rounded-xl bg-friday-blue px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
			>
				{loading ? 'Entrando...' : 'Entrar'}
			</button>
		</form>
	</div>
</div>
