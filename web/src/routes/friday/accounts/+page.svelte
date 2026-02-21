<script lang="ts">
	import AccountCard from './_components/AccountCard.svelte';
	import type { Account } from '$lib/types/account';

	const accounts: Account[] = [
		{
			id: 1,
			institution: 'Santander',
			active: true,
			type: 'bank',
			logoPath: '/logo-santander 1.png'
		},
		{
			id: 2,
			institution: 'BTG Pactual',
			active: true,
			type: 'investment',
			logoPath: '/logo-btg.png'
		},
		{
			id: 3,
			institution: 'Pluxee',
			active: true,
			type: 'benefict',
			subtype: 'Vale Refeição',
			logoPath: '/logo-pluxee.png'
		},
		{
			id: 3,
			institution: 'Picnic',
			active: true,
			type: 'cash',
			logoPath: '/logo-picnic.png'
		}
	];
</script>

<main>
	<header class="text-white">
		<h1 class="text-4xl font-bold">Accounts</h1>
		<p>Gerencies as contas que você possuí.</p>
	</header>

	<section class="text-white">
		<div class="flex items-center justify-end p-10">
			<button
				class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success"
			>
				New Account
			</button>
		</div>

		<div class="flex flex-col gap-4">
			<div>
				{#if accounts.filter((a) => a.type == 'bank').length}
					<div class="my-3 border-b border-secondary/50 pb-3">
						<span class=" text-4xl font-bold">Bank</span>
					</div>
					<div class="grid grid-cols-3 gap-4">
						{#each accounts.filter((a) => a.type == 'bank') as account (account.id)}
							<AccountCard {account} />
						{/each}
					</div>
				{/if}
			</div>

			<div>
				{#if accounts.filter((a) => a.type == 'investment').length}
					<div class="my-3 border-b border-secondary/50 py-3">
						<span class=" text-4xl font-bold">Investimentos</span>
					</div>
					<div class="grid grid-cols-3 gap-4">
						{#each accounts.filter((a) => a.type == 'investment') as account (account.id)}
							<AccountCard {account} />
						{/each}
					</div>
				{/if}
			</div>

			<div>
				{#if accounts.filter((a) => a.type == 'cash').length}
					<div class="my-3 border-b border-secondary/50 py-3">
						<span class=" text-4xl font-bold">Cash</span>
					</div>
					<div class="grid grid-cols-3 gap-4">
						{#each accounts.filter((a) => a.type == 'cash') as account (account.id)}
							<AccountCard {account} />
						{/each}
					</div>
				{/if}
			</div>

			<div>
				{#if accounts.filter((a) => a.type == 'benefict').length}
					<div class="my-3 border-b border-secondary/50 py-3">
						<span class=" text-4xl font-bold">Benefícios</span>
					</div>
					<div class="grid grid-cols-3 gap-4">
						{#each accounts.filter((a) => a.type == 'benefict') as account (account.id)}
							<AccountCard {account} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>
</main>
