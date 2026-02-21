<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Account, AccountType } from '$lib/types/account';
	import AccountLogo from './AccountLogo.svelte';

	interface Props {
		account: Account;
	}

	let { account }: Props = $props();
</script>

<div class="flex min-w-md flex-col rounded-2xl border border-white/20 bg-secondary/30 px-4 py-5">
	<div class="border-b border-b-white/20 pb-3">
		<AccountLogo
			institution={account.institution}
			logoPath={account.logoPath}
			type={account.type}
		/>
	</div>

	<div class="flex justify-between py-6">
		<div class="flex flex-col gap-3 pl-3">
			<div>
				<span class="text-xl font-bold">R$ 5.538,23</span>
			</div>
			<div class="flex items-center gap-5">
				<div class="h-3 w-3 rounded-full bg-success"></div>
				<span class="text-base">Status</span>
			</div>
		</div>
		<div class="flex items-end">
			<div class="grid grid-cols-3 gap-2 rounded-xl border-3 border-secondary/30 bg-tertiary">
				<button
					onclick={() => goto(`/friday/accounts/${account.id}/${account.type}`)}
					class="cursor-pointer px-4 py-1 text-center hover:bg-secondary"
				>
					Ver
				</button>
				<button class="cursor-pointer px-4 py-1 text-center hover:bg-secondary"> Editar </button>
				<button class="cursor-pointer px-4 py-1 text-center hover:bg-secondary">Arquivar</button>
			</div>
		</div>
	</div>
</div>
