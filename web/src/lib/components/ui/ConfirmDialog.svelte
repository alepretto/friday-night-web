<script lang="ts">
	import Modal from './Modal.svelte';

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

<Modal
	{open}
	{title}
	onclose={oncancel}
	onsave={onconfirm}
	saveLabel={confirmLabel}
	saveStyle="danger"
>
	{#snippet body()}
		<div class="w-full px-4 pb-2">
			<p class="text-sm text-gray-400">{message}</p>
		</div>
	{/snippet}
</Modal>
