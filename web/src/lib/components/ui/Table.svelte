<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	export interface Column<T> {
		key: keyof T | string;
		label: string;
		align?: 'left' | 'center' | 'right';
	}

	interface Props<T> {
		data: T[];
		columns: Column<T>[];
		rowKey: keyof T;
		cell?: Snippet<[{ row: T; key: T | string }]>;
	}

	let { data, columns, rowKey, cell }: Props<T> = $props();

	const alignClass = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	};
</script>

<div class="w-full overflow-hidden rounded-2xl border border-white/10 bg-secondary/30 shadow-2xl">
	<table class="w-full text-sm text-gray-300">
		<thead>
			<tr class="border-b border-white/10 text-xs tracking-widest text-gray-400 uppercase">
				{#each columns as col (col.key)}
					<th class="px-6 py-5 font-semibold {alignClass[col.align ?? 'left']}">
						{col.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data as row (row[rowKey])}
				<tr class="border-b border-white/5 transition-colors duration-150 hover:bg-white/[0.03]">
					{#each columns as col (col.key)}
						<td class="px-6 py-5 {alignClass[col.align ?? 'left']}">
							{#if cell}
								{@render cell({ row, key: col.key as string })}
							{:else}
								{(row as Record<string, unknown>)[col.key as string]}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
