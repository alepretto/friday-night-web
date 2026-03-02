<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const accountId = $derived(page.url.searchParams.get('account_id') ?? data.accounts[0]?.id ?? '');

	function buildUrl(tab: string, aid: string) {
		return `/telegram/transaction${tab}?account_id=${aid}`;
	}

	function onAccountChange(e: Event) {
		const select = e.currentTarget as HTMLSelectElement;
		const newId = select.value;
		const currentPath = page.url.pathname.replace('/telegram/transaction', '') || '';
		goto(buildUrl(currentPath, newId), { replaceState: true });
	}

	const tabs = [
		{ label: 'Nova', icon: '+', path: '' },
		{ label: 'Recentes', icon: '≡', path: '/recentes' },
		{ label: 'Resumo', icon: '◎', path: '/resumo' }
	];

	const activeTab = $derived(
		page.url.pathname.endsWith('/recentes')
			? '/recentes'
			: page.url.pathname.endsWith('/resumo')
				? '/resumo'
				: ''
	);
</script>

<div
	class="flex min-h-screen flex-col bg-[#0d0d0f]"
	style="padding-top: max(3.5rem, calc(var(--tg-safe-area-inset-top, 0px) + 1rem))"
>
	<!-- Account selector -->
	<div class="flex items-center gap-3 border-b border-white/10 px-4 py-3">
		<div class="flex min-w-0 flex-1 items-center gap-2">
			<span class="text-white/40">○</span>
			<select
				value={accountId}
				onchange={onAccountChange}
				class="min-w-0 flex-1 truncate bg-transparent text-sm font-medium text-white outline-none"
			>
				{#each data.accounts as account}
					<option value={account.id}>{account.label}</option>
				{/each}
			</select>
		</div>
		<span class="shrink-0 text-xs text-white/30">▾</span>
	</div>

	<!-- Page content -->
	<div class="flex-1 pb-20">
		{@render children()}
	</div>

	<!-- Bottom navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0d0f]">
		<div class="grid grid-cols-3">
			{#each tabs as tab}
				<a
					href={buildUrl(tab.path, accountId)}
					class="flex flex-col items-center gap-1 py-3 text-center transition-colors
						{activeTab === tab.path ? 'text-friday-blue' : 'text-white/30 hover:text-white/50'}"
				>
					<span class="text-lg leading-none">{tab.icon}</span>
					<span class="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
