<script lang="ts">
	interface Props {
		message?: string;
		minHeight?: string;
	}

	let { message = 'Carregando...', minHeight = 'min-h-125' }: Props = $props();
</script>

<div class="flex items-center justify-center py-20 {minHeight}">
	<div class="flex flex-col items-center gap-4">
		<div class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
		<p class="text-sm text-gray-400">{message}</p>
	</div>
</div>
