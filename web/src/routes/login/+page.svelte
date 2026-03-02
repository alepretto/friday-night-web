<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
</script>

<div class="flex h-screen w-screen items-start justify-center bg-[#010101] pt-16">
	<!-- Subtle grid background -->
	<div
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(47,128,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(47,128,237,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
	></div>

	<div class="relative w-full max-w-sm px-6">
		<!-- Logo + branding -->
		<div class="mb-8 text-center">
			<div class="mx-auto flex items-center justify-center">
				<img src="/logo-friday.png" alt="Friday Night" class="h-90 w-100" />
			</div>
			<h1 class="text-6xl font-bold tracking-tight text-white">Friday Night</h1>
			<p class="mt-1 text-sm text-white/40">Entre com sua conta</p>
		</div>

		<!-- Error -->
		{#if form?.error}
			<div
				class="mb-5 rounded-xl border border-failed/20 bg-failed/10 px-4 py-3 text-sm text-red-300"
			>
				{form.error}
			</div>
		{/if}

		<!-- Form card -->
		<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
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
				class="flex flex-col gap-4"
			>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium tracking-wider text-white/40 uppercase" for="username">
						Usuário
					</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						placeholder="seu usuário"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none placeholder:text-white/20 focus:border-friday-blue/50 focus:bg-white/8"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-medium tracking-wider text-white/40 uppercase" for="password">
						Senha
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						placeholder="••••••••"
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition outline-none placeholder:text-white/20 focus:border-friday-blue/50 focus:bg-white/8"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="mt-1 w-full rounded-xl bg-friday-blue py-3 text-sm font-semibold text-white transition hover:bg-friday-blue/90 disabled:opacity-50"
				>
					{loading ? 'Entrando...' : 'Entrar'}
				</button>
			</form>
		</div>
	</div>
</div>
