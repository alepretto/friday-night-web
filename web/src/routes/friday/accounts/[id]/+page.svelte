<script lang="ts">
	import { page } from '$app/state';
	import type { Account, AccountType } from '$lib/types/account';
	import AccountLogo from '../_components/AccountLogo.svelte';

	const id = page.params.id;

	const account: Account = {
		id: 1,
		institution: 'Santander',
		active: true,
		type: 'bank',
		logoPath: '/logo-santander 1.png'
	};
</script>

<main>
	<div class="text-white">
		<AccountLogo
			logoPath={account.logoPath}
			institution={account.institution}
			type={account.type}
			variant="page"
		/>
	</div>
</main>
