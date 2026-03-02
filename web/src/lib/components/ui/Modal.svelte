<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		onsave: () => void;
		body: Snippet;
		saving?: boolean;
		saveLabel?: string;
		saveStyle?: 'primary' | 'danger';
	}

	let {
		open,
		title,
		onclose,
		onsave,
		body,
		saving = false,
		saveLabel = 'Salvar',
		saveStyle = 'primary'
	}: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
			onclick={onclose}
			aria-label="Fechar modal"
		></button>

		<div class="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1d23] shadow-2xl">
			<!-- Header -->
			<header class="flex items-center justify-between border-b border-white/8 px-6 py-4">
				<h2 class="text-base font-semibold text-white">{title}</h2>
				<button
					onclick={onclose}
					class="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/8 hover:text-white"
				>
					<X size={16} />
				</button>
			</header>

			<!-- Body -->
			<main class="px-6 py-5">
				{@render body()}
			</main>

			<!-- Footer -->
			<footer class="flex justify-end gap-3 border-t border-white/8 px-6 py-4">
				<button
					onclick={onclose}
					class="rounded-lg px-4 py-2 text-sm font-medium text-white/50 transition hover:text-white"
				>
					Cancelar
				</button>
				<button
					onclick={onsave}
					disabled={saving}
					class="rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50
						{saveStyle === 'danger'
						? 'bg-failed/80 hover:bg-failed'
						: 'bg-friday-blue hover:bg-friday-blue/90'}"
				>
					{saving ? 'Salvando...' : saveLabel}
				</button>
			</footer>
		</div>
	</div>
{/if}
