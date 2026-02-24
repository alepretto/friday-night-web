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
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	let { children } = $props();

	let sidebarOpen = $state(false);

	const navItems = [
		{ label: 'Dashboard', icon: LayoutDashboardIcon, route: '/friday/dashboard' },
		{ label: 'Accounts', icon: WalletIcon, route: '/friday/accounts' },
		{ label: 'Attributes', icon: TagIcon, route: '/friday/transaction-attributes' },
		{ label: 'Budget', icon: PiggyBankIcon, route: '/friday/budget' },
		{ label: 'Goals', icon: CrosshairIcon, route: '/friday/goals' },
		{ label: 'Events', icon: CalendarIcon, route: '/friday/events' }
	] as const;

	const bottomItems = [
		{ label: 'Config', icon: SettingsIcon, route: '/friday/config' },
		{ label: 'Logout', icon: LogOutIcon, route: '/friday/config' } //'/logout'
	] as const;
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<!-- HEADER -->
	<header class="flex h-20 shrink-0 items-center gap-3 border-b bg-secondary/30 px-4">
		<button
			onclick={() => (sidebarOpen = !sidebarOpen)}
			class="flex items-center rounded-md px-5 text-slate-400 transition hover:bg-white/5 hover:text-blue-400"
		>
			<MenuIcon size={32} />
		</button>

		<span class="flex-1 text-4xl font-extrabold tracking-wide text-secondary italic">
			Friday Night
		</span>

		<img src="/logo-friday.png" alt="Friday Night" class="h-10 w-10 rounded-full" />
	</header>

	<div class="flex flex-1 overflow-hidden">
		<!-- SIDEBAR -->
		<aside
			class="flex shrink-0 flex-col justify-between overflow-hidden border-r bg-secondary/30 px-2 py-3 transition-all duration-200
				{sidebarOpen ? 'w-60' : 'w-20'}"
		>
			<!-- Top nav -->
			<nav class="flex flex-col items-center gap-5 pt-5">
				{#each navItems as item}
					<button
						onclick={() => goto(resolve(item.route))}
						title={!sidebarOpen ? item.label : ''}
						class="flex w-full items-center gap-5 rounded-lg px-2.5 py-2 text-base font-medium transition-all
							{page.url.pathname.startsWith(item.route)
							? 'text-secondary-400 bg-white/80'
							: 'text-slate-300 hover:bg-white/4 hover:text-slate-300'}"
					>
						<span class="shrink-0"><item.icon size={25} /></span>
						{#if sidebarOpen}
							<span class="truncate">{item.label}</span>
						{/if}
					</button>
				{/each}
			</nav>

			<!-- Bottom nav -->
			<nav class="flex flex-col gap-0.5">
				{#each bottomItems as item}
					<button
						onclick={() => goto(resolve(item.route))}
						title={!sidebarOpen ? item.label : ''}
						class="text-md flex w-full items-center gap-5 rounded-lg px-2.5 py-2 font-medium transition-all
							{page.url.pathname.startsWith(item.route)
							? 'text-secondary-400 bg-white/80'
							: 'text-slate-300 hover:bg-white/4 hover:text-slate-300'}"
					>
						<span class="shrink-0"><item.icon size={25} /></span>
						{#if sidebarOpen}
							<span class="truncate">{item.label}</span>
						{/if}
					</button>
				{/each}
			</nav>
		</aside>

		<!-- CONTENT -->
		<main class="flex-1 overflow-y-auto bg-[#0d0d0f] p-6">
			{@render children()}
		</main>
	</div>
</div>
