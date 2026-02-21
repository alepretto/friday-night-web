<script lang="ts">
	import { X } from 'lucide-svelte';
	interface Props {
		open: boolean;
		onClose: () => void;
		onSave: (label: string) => void;
	}

	let { open, onClose, onSave }: Props = $props();

	let label = $state('');

	function handleSave() {
		if (!label.trim()) return;
		onSave(label);
		label = '';
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

		<div
			class="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-secondary/50 shadow-2xl"
		>
			<header class="flex items-center justify-between p-4">
				<div>
					<h2 class="text-xl font-bold text-white">Nova Currancie</h2>
				</div>
				<div>
					<button
						onclick={() => (open = false)}
						class="cursor-pointer rounded-full border border-failed bg-friday-red/50 text-black"
					>
						<X size={20} />
					</button>
				</div>
			</header>

			<main class="flex h-30 items-center justify-center p-1">
				<div class="flex w-full max-w-md flex-col gap-3">
					<label class="text-bold pl-4 text-xl" for="label">Descrição</label>
					<input
						bind:value={label}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
						type="text"
						id="label"
					/>
				</div>
			</main>

			<footer class="flex justify-end gap-3 p-5">
				<button
					onclick={() => (open = false)}
					class="cursor-pointer rounded-3xl px-10 py-2 text-2xl font-bold text-friday-red hover:text-failed"
				>
					Cancelar
				</button>
				<button
					onclick={handleSave}
					class="cursor-pointer rounded-3xl border border-blue-950 bg-friday-blue/80 px-10 py-2 shadow-2xl hover:bg-blue-700"
				>
					Salvar
				</button>
			</footer>
		</div>
	</div>
{/if}
