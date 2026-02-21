<script lang="ts">
	import { page } from '$app/state';
	import type { Account } from '$lib/types/account';
	import AccountLogo from '../_components/AccountLogo.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';

	const id = page.params.id;

	const account: Account = {
		id: 1,
		institution: 'Santander',
		active: true,
		type: 'bank',
		logoPath: '/logo-santander 1.png'
	};

	const tabs = [
		{ label: 'Conta Corrente', route: `/friday/accounts/${id}/bank` },
		{ label: 'Corretora', route: `/friday/accounts/${id}/investment` }
	];

	let { children } = $props();
</script>

<main class="p-5">
	<div class="flex items-center justify-between border-b border-b-white/20 pb-3 text-white">
		<AccountLogo
			logoPath={account.logoPath}
			institution={account.institution}
			type={account.type}
			variant="page"
		/>

		<div>
			<Tabs {tabs} />
		</div>
	</div>

	{@render children()}
</main>
