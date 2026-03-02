<script lang="ts">
	import {
		LayoutDashboardIcon,
		WalletIcon,
		TagIcon,
		PiggyBankIcon,
		CrosshairIcon,
		CalendarIcon,
		SettingsIcon,
		LogOutIcon,
		MenuIcon
	} from 'lucide-svelte';

	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { resolve } from '$app/paths';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { getToastState } from '$lib/toast.svelte';

	let { children } = $props();
	const toast = getToastState();

	let sidebarOpen = $state(true);

	const navItems = [
		{ label: 'Dashboard', icon: LayoutDashboardIcon, route: '/friday/dashboard' },
		{ label: 'Accounts', icon: WalletIcon, route: '/friday/accounts' },
		{ label: 'Attributes', icon: TagIcon, route: '/friday/transaction-attributes' },
		{ label: 'Budget', icon: PiggyBankIcon, route: '/friday/budget' },
		{ label: 'Goals', icon: CrosshairIcon, route: '/friday/goals' },
		{ label: 'Events', icon: CalendarIcon, route: '/friday/events' }
	] as const;

	const bottomItems = [{ label: 'Config', icon: SettingsIcon, route: '/friday/config' }] as const;
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<!-- HEADER -->
	<header class="flex h-14 shrink-0 items-center gap-3 border-b border-white/8 bg-primary px-4">
		<button
			onclick={() => (sidebarOpen = !sidebarOpen)}
			class="flex h-8 w-8 items-center justify-center rounded-md text-white/40 transition hover:bg-white/5 hover:text-white/70"
		>
			<MenuIcon size={20} />
		</button>

		<span class="flex-1 text-xl font-bold tracking-tight text-friday-blue">
			Friday Night
		</span>

		<img src="/logo-friday.png" alt="Friday Night" class="h-8 w-8 rounded-full opacity-80" />
	</header>

	<div class="flex flex-1 overflow-hidden">
		<!-- SIDEBAR -->
		<aside
			class="flex shrink-0 flex-col justify-between overflow-hidden border-r border-white/8 bg-primary px-2 py-4 transition-all duration-200
				{sidebarOpen ? 'w-56' : 'w-14'}"
		>
			<!-- Top nav -->
			<nav class="flex flex-col gap-1">
				{#each navItems as item}
					{@const active = page.url.pathname.startsWith(item.route)}
					<button
						onclick={() => goto(resolve(item.route))}
						title={!sidebarOpen ? item.label : ''}
						class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all
							{active
							? 'bg-friday-blue/12 text-friday-blue'
							: 'text-white/40 hover:bg-white/5 hover:text-white/70'}"
					>
						<span class="shrink-0 {active ? 'text-friday-blue' : ''}">
							<item.icon size={18} />
						</span>
						{#if sidebarOpen}
							<span class="truncate">{item.label}</span>
						{/if}
					</button>
				{/each}
			</nav>

			<!-- Bottom nav -->
			<nav class="flex flex-col gap-1">
				{#each bottomItems as item}
					{@const active = page.url.pathname.startsWith(item.route)}
					<button
						onclick={() => goto(resolve(item.route))}
						title={!sidebarOpen ? item.label : ''}
						class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all
							{active
							? 'bg-friday-blue/12 text-friday-blue'
							: 'text-white/40 hover:bg-white/5 hover:text-white/70'}"
					>
						<span class="shrink-0"><item.icon size={18} /></span>
						{#if sidebarOpen}
							<span class="truncate">{item.label}</span>
						{/if}
					</button>
				{/each}

				<form method="POST" action="/login?/logout">
					<button
						type="submit"
						title={!sidebarOpen ? 'Logout' : ''}
						class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-white/40 transition-all hover:bg-white/5 hover:text-white/70"
					>
						<span class="shrink-0"><LogOutIcon size={18} /></span>
						{#if sidebarOpen}
							<span class="truncate">Logout</span>
						{/if}
					</button>
				</form>
			</nav>
		</aside>

		<!-- CONTENT -->
		<main class="relative flex-1 overflow-y-auto bg-[#0d0d0f] p-6">
			{#if navigating?.to?.url.pathname.startsWith('/friday/accounts/')}
				<div class="absolute inset-0 z-10 flex items-center justify-center bg-[#0d0d0f]">
					<div class="flex flex-col items-center gap-4">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-friday-blue"></div>
						<p class="text-sm text-white/30">Carregando...</p>
					</div>
				</div>
			{/if}
			{@render children()}
		</main>
	</div>
</div>

<Toast message={toast.message} type={toast.type} visible={toast.visible} />
