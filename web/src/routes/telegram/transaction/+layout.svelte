<script lang="ts">
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/state';
	import { goto } from '$app/navigation';
	import { PlusIcon, ClockIcon, BarChart2Icon, ChevronDownIcon } from 'lucide-svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const accountId = $derived(page.url.searchParams.get('account_id') ?? data.accounts[0]?.id ?? '');

	// Feedback visual instantâneo
	let pendingTab = $state<string | null>(null);

	// Limpa pendingTab quando a URL muda (navegação completa), não depende de navigating
	$effect(() => {
		page.url.pathname; // dependency tracking
		pendingTab = null;
	});

	// Mede a altura real do header para o conteúdo não ser coberto
	let headerEl = $state<HTMLElement | null>(null);
	let headerH = $state(90); // valor inicial estimado para evitar flash

	$effect(() => {
		if (!headerEl) return;
		const ro = new ResizeObserver(() => {
			headerH = headerEl!.offsetHeight;
		});
		ro.observe(headerEl);
		return () => ro.disconnect();
	});

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

	const visualActiveTab = $derived(pendingTab ?? activeTab);

	onMount(() => {
		const tg = (window as any).Telegram?.WebApp;
		if (tg) {
			tg.ready();
			tg.expand();
		}
	});
</script>

<!--
  Header fixo + padding-top dinâmico no conteúdo (medido via ResizeObserver).
  Elimina o h-screen flex-col que era impreciso no WebView do Telegram.
  O padding-top é atualizado automaticamente se o header crescer (mudança de CSS vars do Telegram).
-->
<div class="bg-[#0d0d0f]">
	<!-- Header fixo: z-40, altura variável conforme safe-area do Telegram -->
	<header
		bind:this={headerEl}
		class="fixed left-0 right-0 top-0 z-40 border-b bg-[#0d0d0f] {navigating
			? 'border-friday-blue/50'
			: 'border-white/8'}"
		style="padding-top: calc(var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 44px))"
	>
		<div class="flex items-center gap-3 px-4 py-3">
			<!-- Logo + branding -->
			<div class="flex min-w-0 flex-1 items-center gap-2">
				<img
					src="/logo-friday.png"
					alt="Friday Night"
					class="h-6 w-6 shrink-0 rounded-full opacity-80"
				/>
				<span class="text-sm font-bold text-friday-blue">Friday Night</span>
			</div>

			<!-- Account selector: sem disabled — sempre interativo -->
			{#if data.accounts.length > 0}
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
			{/if}
		</div>
	</header>

	<!-- Conteúdo: padding-top = altura real do header (ResizeObserver), padding-bottom = nav + safe area -->
	<div
		style="padding-top: {headerH}px; padding-bottom: calc(var(--tg-safe-area-inset-bottom, 0px) + 64px)"
	>
		{@render children()}
	</div>

	<!-- Bottom nav fixo -->
	<nav
		class="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-[#0d0d0f]"
		style="padding-bottom: var(--tg-safe-area-inset-bottom, 0px)"
	>
		<div class="grid grid-cols-3">
			{#each tabs as tab}
				{@const active = visualActiveTab === tab.path}
				<a
					href={buildUrl(tab.path, accountId)}
					data-sveltekit-preload-data="tap"
					onclick={() => {
						pendingTab = tab.path;
					}}
					class="flex flex-col items-center gap-1 py-3 text-center transition-colors
						{active ? 'text-friday-blue' : 'text-white/30'}"
				>
					<div
						class="flex h-7 w-7 items-center justify-center rounded-xl transition-colors
							{active ? 'bg-friday-blue/15' : ''}"
					>
						<tab.icon size={16} />
					</div>
					<span
						class="text-[10px] font-medium tracking-wider {active
							? 'text-friday-blue'
							: 'text-white/25'}"
					>
						{tab.label}
					</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
