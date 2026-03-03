<script lang="ts">
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/state';
	import { goto } from '$app/navigation';
	import { PlusIcon, ClockIcon, BarChart2Icon, ChevronDownIcon } from 'lucide-svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const accountId = $derived(page.url.searchParams.get('account_id') ?? data.accounts[0]?.id ?? '');
	type Account = (typeof data.accounts)[number];
	const selectedAccount = $derived(data.accounts.find((a: Account) => a.id === accountId) ?? data.accounts[0]);

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
		{ label: 'Nova', icon: PlusIcon, path: '' },
		{ label: 'Recentes', icon: ClockIcon, path: '/recentes' },
		{ label: 'Resumo', icon: BarChart2Icon, path: '/resumo' }
	];

	const activeTab = $derived(
		page.url.pathname.endsWith('/recentes')
			? '/recentes'
			: page.url.pathname.endsWith('/resumo')
				? '/resumo'
				: ''
	);

	onMount(() => {
		const tg = (window as any).Telegram?.WebApp;
		if (tg) {
			tg.ready();
			tg.expand();
		}
	});
</script>

<!--
  O header fixo usa padding-top com as variáveis do Telegram:
  - --tg-safe-area-inset-top: safe area do dispositivo (notch)
  - --tg-content-safe-area-inset-top: espaço reservado para o botão fechar do Mini App
  Fallback de 44px cobre a maioria dos casos onde essas variáveis ainda não estão disponíveis.
-->
<div class="flex h-screen flex-col bg-[#0d0d0f]">

	<!-- Header fixo com safe area -->
	<header
		class="fixed left-0 right-0 top-0 z-40 border-b border-white/8 bg-[#0d0d0f]"
		style="padding-top: calc(var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 44px))"
	>
		<div class="flex items-center gap-3 px-4 py-3">
			<!-- Logo + branding -->
			<div class="flex flex-1 items-center gap-2 min-w-0">
				<img src="/logo-friday.png" alt="Friday Night" class="h-6 w-6 shrink-0 rounded-full opacity-80" />
				<span class="text-sm font-bold text-friday-blue">Friday Night</span>
			</div>

			<!-- Account selector pill -->
			<div class="relative flex shrink-0 items-center">
				<select
					value={accountId}
					onchange={onAccountChange}
					class="appearance-none rounded-full border border-white/10 bg-white/[0.05] py-1.5 pl-3 pr-7 text-xs font-medium text-white/80 outline-none transition focus:border-friday-blue/40"
					style="max-width: 160px"
				>
					{#each data.accounts as account}
						<option value={account.id}>{account.label}</option>
					{/each}
				</select>
				<ChevronDownIcon size={12} class="pointer-events-none absolute right-2 text-white/40" />
			</div>
		</div>
	</header>

	<!-- Spacer igual à altura do header (py-3 + h-6 icon + padding-top do safe area)
	     O cálculo acompanha o header dinâmico -->
	<div
		style="height: calc(var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 44px) + 3rem)"
		class="shrink-0"
	></div>

	<!-- Scroll container -->
	<div class="flex-1 overflow-y-auto pb-20">
		{#if navigating}
			<div class="mx-4 mt-3 h-0.5 animate-pulse rounded-full bg-friday-blue/50"></div>
		{/if}
		{@render children()}
	</div>

	<!-- Bottom nav fixo -->
	<nav
		class="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-[#0d0d0f]"
		style="padding-bottom: var(--tg-safe-area-inset-bottom, 0px)"
	>
		<div class="grid grid-cols-3">
			{#each tabs as tab}
				{@const active = activeTab === tab.path}
				<a
					href={buildUrl(tab.path, accountId)}
					data-sveltekit-preload-data="tap"
					class="flex flex-col items-center gap-1 py-3 text-center transition-colors
						{active ? 'text-friday-blue' : 'text-white/30'}"
				>
					<div
						class="flex h-7 w-7 items-center justify-center rounded-xl transition-colors
							{active ? 'bg-friday-blue/15' : ''}"
					>
						<tab.icon size={16} />
					</div>
					<span class="text-[10px] font-medium tracking-wider {active ? 'text-friday-blue' : 'text-white/25'}">
						{tab.label}
					</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
