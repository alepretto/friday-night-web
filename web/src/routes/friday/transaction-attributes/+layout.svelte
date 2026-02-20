<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const tabs = [
		{
			label: 'Transaction Tags',
			route: `/friday/transaction-attributes/transaction-tags`
		},
		{ label: 'Payment Methods', route: `/friday/transaction-attributes/payment-methods` },
		{ label: 'Currencies', route: `/friday/transaction-attributes/currencies` }
	] as const;
</script>

<div class="p-10">
	<main class="text-white">
		<header>
			<h1 class="text-4xl font-bold">Transactions Attributes</h1>
			<p>Gerencies todos os atributos das transações aqui.</p>
		</header>

		<div class="p-10">
			<div class="inline-flex w-fit rounded-full border border-white/10 bg-secondary/30 p-1">
				{#each tabs as tab (tab.route)}
					<a
						href={resolve(tab.route)}
						class="cursor-pointer rounded-full px-20 py-2 text-sm font-medium transition-all duration-200
              {page.url.pathname === tab.route
							? 'bg-tertiary text-white shadow-lg'
							: 'text-white-500 hover:text-gray-300'}"
					>
						{tab.label}
					</a>
				{/each}
			</div>
		</div>

		{@render children()}
	</main>
</div>
