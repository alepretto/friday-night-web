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
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={onclose}
			aria-label="Fechar modal"
		></button>

		<div
			class="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-secondary/50 shadow-2xl"
		>
			<header class="flex items-center justify-between p-4">
				<div>
					<h2 class="text-xl font-bold text-white">{title}</h2>
				</div>
				<div>
					<button
						onclick={onclose}
						class="cursor-pointer rounded-full border border-failed bg-friday-red/50 text-black"
					>
						<X size={20} />
					</button>
				</div>
			</header>
			<main class="flex items-center justify-center p-1">
				{@render body()}
			</main>
			<footer class="flex justify-end gap-3 p-5">
				<button
					onclick={onclose}
					class="cursor-pointer rounded-3xl px-10 py-2 text-2xl font-bold text-friday-red hover:text-failed"
				>
					Cancelar
				</button>
				<button
					onclick={onsave}
					disabled={saving}
					class="cursor-pointer rounded-3xl px-10 py-2 shadow-2xl disabled:cursor-not-allowed disabled:opacity-50
						{saveStyle === 'danger'
						? 'border border-failed/60 bg-failed/30 hover:bg-failed/50'
						: 'border border-blue-950 bg-friday-blue/80 hover:bg-blue-700'}"
				>
					{saving ? 'Salvando...' : saveLabel}
				</button>
			</footer>
		</div>
	</div>
{/if}
