<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { X } from 'lucide-svelte';
	interface Props {
		open: boolean;
		onclose: () => void;
		onSave: (label: string) => void;
	}

	let { open, onclose, onSave }: Props = $props();

	let label = $state('');

	function handleSave() {
		if (!label.trim()) return;
		onSave(label);
		label = '';
	}
</script>

{#if open}
	<Modal title="Create Payment Method" {onclose} onsave={handleSave} {open}>
		{#snippet body()}
			<div class="flex w-full max-w-md flex-col gap-3">
				<label class="text-bold pl-4 text-xl" for="label">Descrição</label>
				<input
					bind:value={label}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					type="text"
					id="label"
				/>
			</div>
		{/snippet}
	</Modal>
{/if}
