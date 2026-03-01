<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		onconfirm: () => void;
		oncancel: () => void;
	}

	let { open, title, message, confirmLabel = 'Confirmar', onconfirm, oncancel }: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={oncancel}
			aria-label="Cancelar"
		></button>

		<div
			class="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-secondary/90 p-6 shadow-2xl"
		>
			<h2 class="text-lg font-bold text-white">{title}</h2>
			<p class="mt-2 text-sm text-gray-400">{message}</p>

			<div class="mt-6 flex justify-end gap-3">
				<button
					onclick={oncancel}
					class="cursor-pointer rounded-3xl px-8 py-2 text-friday-red hover:text-failed"
				>
					Cancelar
				</button>
				<button
					onclick={onconfirm}
					class="cursor-pointer rounded-3xl border border-failed/60 bg-failed/30 px-8 py-2 text-white hover:bg-failed/50"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
