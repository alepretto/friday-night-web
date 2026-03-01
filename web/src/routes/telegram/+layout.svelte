<script lang="ts">
	import Toast from '$lib/components/ui/Toast.svelte';
	import { getToastState } from '$lib/toast.svelte';

	let { children } = $props();
	const toast = getToastState();
</script>

<div class="min-h-screen w-full bg-[#0d0d0f]">
	{@render children()}
</div>

<Toast message={toast.message} type={toast.type} visible={toast.visible} />
