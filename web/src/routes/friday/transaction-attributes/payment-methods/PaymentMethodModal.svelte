<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Props {
		open: boolean;
		saving?: boolean;
		onclose: () => void;
		onsave: (label: string) => void;
	}

	let { open, onclose, onsave, saving = false }: Props = $props();

	let label = $state('');

	function handleSave() {
		if (!label.trim()) return;
		onsave(label.trim());
		label = '';
	}
</script>

<Modal title="New Payment Method" {open} {onclose} onsave={handleSave} {saving}>
	{#snippet body()}
		<div class="flex w-full max-w-md flex-col gap-3">
			<label class="text-bold pl-4 text-xl" for="pm-label">Descrição</label>
			<input
				bind:value={label}
				class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				type="text"
				id="pm-label"
			/>
		</div>
	{/snippet}
</Modal>
