<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	interface Props {
		currentPage: number;
		totalPages: number;
		preserveParams?: boolean;
	}

	let { currentPage, totalPages, preserveParams = false }: Props = $props();

	function getVisiblePages(current: number, total: number) {
		if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
		const pages: (number | '...')[] = [1, 2, 3];
		if (current > 4) pages.push('...');
		if (current > 3 && current < total - 1) pages.push(current);
		pages.push('...');
		pages.push(total - 1, total);
		return [...new Set(pages)];
	}

	const visiblePages = $derived(getVisiblePages(currentPage, totalPages));

	function goToPage(p: number) {
		if (preserveParams) {
			const params = new SvelteURLSearchParams(page.url.searchParams);
			params.set('page', String(p));
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- query-only navigation
			goto(`?${params.toString()}`);
		} else {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- query-only navigation
			goto(`?page=${p}`);
		}
	}
</script>

{#if totalPages > 1}
	<div class="mt-8 flex items-center gap-1">
		{#each visiblePages as p (p)}
			{#if p === '...'}
				<span class="px-2 text-sm text-gray-500 select-none">...</span>
			{:else}
				<button
					onclick={() => goToPage(p as number)}
					class="h-9 w-9 cursor-pointer rounded-lg text-sm font-medium transition-all duration-150
					{currentPage === p ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}"
				>
					{p}
				</button>
			{/if}
		{/each}
	</div>
{/if}
