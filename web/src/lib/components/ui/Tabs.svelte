<script lang="ts">
	import { page } from '$app/state';

	export interface Tab {
		label: string;
		route: string;
	}

	interface Props {
		tabs: Tab[];
	}

	let { tabs }: Props = $props();
</script>

<div class="inline-flex w-fit rounded-full border border-white/10 bg-secondary/30 p-1">
	{#each tabs as tab (tab.label)}
		<a
			href={tab.route}
			class="cursor-pointer rounded-full px-20 py-2 text-sm font-medium transition-all duration-200
              {page.url.pathname.startsWith(tab.route)
				? 'bg-tertiary text-white shadow-lg'
				: 'text-white-500 hover:text-gray-300'}"
		>
			{tab.label}
		</a>
	{/each}
</div>
