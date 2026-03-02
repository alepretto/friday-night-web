<script lang="ts">
	import { page } from '$app/state';
	let { children } = $props();

	const tabs = [
		{ label: 'Financial Tags', route: '/friday/transaction-attributes/transaction-tags' },
		{ label: 'Payment Methods', route: '/friday/transaction-attributes/payment-methods' },
		{ label: 'Currencies', route: '/friday/transaction-attributes/currencies' }
	] as const;
</script>

<div class="flex h-full flex-col text-white">
	<!-- Page header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-white">Transactions Attributes</h1>
		<p class="mt-1 text-sm text-white/40">Gerencies as Tags criadas que serão usadas em cada Transação</p>
	</div>

	<!-- Tab bar -->
	<div class="mb-6 flex">
		<div class="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
			{#each tabs as tab (tab.route)}
				<a
					href={tab.route}
					class="rounded-lg px-5 py-2 text-sm font-medium transition-all duration-150
						{page.url.pathname === tab.route
						? 'bg-friday-blue/15 text-friday-blue'
						: 'text-white/40 hover:text-white/70'}"
				>
					{tab.label}
				</a>
			{/each}
		</div>
	</div>

	<!-- Content -->
	{@render children()}
</div>
