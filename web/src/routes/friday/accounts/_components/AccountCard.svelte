<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Account } from '$lib/types/account';
	import AccountLogo from './AccountLogo.svelte';

	interface Props {
		account: Account;
		onedit: (account: Account) => void;
		onarchive: (account: Account) => void;
	}

	let { account, onedit, onarchive }: Props = $props();

	const isActive = $derived(account.status === 'activate');

	function handleVer() {
		if (account.type === 'bank' || account.type === 'investment') {
			goto(`/friday/accounts/${account.id}/${account.type}`);
		}
	}
</script>

<div
	class="flex min-w-md flex-col rounded-2xl border bg-secondary/30 px-4 py-5 {isActive
		? 'border-white/20'
		: 'border-white/5 opacity-60'}"
>
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
				{#if account.subtype}
					<span class="text-sm text-gray-400">{account.subtype}</span>
				{/if}
			</div>
			<div class="flex items-center gap-5">
				<div class="h-3 w-3 rounded-full {isActive ? 'bg-success' : 'bg-failed'}"></div>
				<span class="text-base">{isActive ? 'Ativa' : 'Arquivada'}</span>
			</div>
		</div>
		<div class="flex items-end">
			<div class="grid grid-cols-3 gap-2 rounded-xl border-3 border-secondary/30 bg-tertiary">
				{#if account.type === 'bank' || account.type === 'investment'}
					<button
						onclick={handleVer}
						class="cursor-pointer px-4 py-1 text-center hover:bg-secondary"
					>
						Ver
					</button>
				{:else}
					<span class="cursor-default px-4 py-1 text-center opacity-30">Ver</span>
				{/if}
				<button
					onclick={() => onedit(account)}
					class="cursor-pointer px-4 py-1 text-center hover:bg-secondary"
				>
					Editar
				</button>
				<button
					onclick={() => onarchive(account)}
					class="cursor-pointer px-4 py-1 text-center hover:bg-secondary {isActive
						? 'text-failed/80'
						: 'text-success/80'}"
				>
					{isActive ? 'Arquivar' : 'Ativar'}
				</button>
			</div>
		</div>
	</div>
</div>
