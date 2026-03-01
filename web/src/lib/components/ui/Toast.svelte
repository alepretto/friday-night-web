<script lang="ts">
	interface Props {
		message: string;
		type: 'success' | 'error';
		visible: boolean;
	}

	let { message, type, visible }: Props = $props();
</script>

{#if visible}
	<div
		class="fixed right-6 bottom-6 z-50 rounded-xl border px-5 py-3 text-sm font-medium shadow-xl backdrop-blur-sm
		{type === 'success'
			? 'border-success/60 bg-success/20 text-success'
			: 'border-failed/60 bg-failed/20 text-failed'}"
	>
		{message}
	</div>
{/if}
