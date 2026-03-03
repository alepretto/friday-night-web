<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Account } from '$lib/types/account';

	interface Props {
		account: Account;
		onedit: (account: Account) => void;
		onarchive: (account: Account) => void;
	}

	let { account, onedit, onarchive }: Props = $props();

	const isActive = $derived(account.status === 'activate');
	const canView = $derived(account.type === 'bank' || account.type === 'investment');

	function handleVer() {
		if (canView) {
			goto(`/friday/accounts/${account.id}/${account.type}`);
		}
	}
</script>

<div
	class="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/15 {!isActive &&
		'opacity-60'}"
>
	<!-- Header: logo + institution + subtype + status dot -->
	<div class="flex items-center gap-3">
		{#if account.logoPath}
			<img src={account.logoPath} alt="" class="h-8 w-8 rounded-lg object-contain" />
		{:else}
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs text-white/40">
				{account.institution.slice(0, 2).toUpperCase()}
			</div>
		{/if}
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-semibold text-white">{account.institution}</p>
			{#if account.subtype}
				<p class="text-xs capitalize text-white/40">{account.subtype}</p>
			{/if}
		</div>
		<div class="h-2 w-2 shrink-0 rounded-full {isActive ? 'bg-success' : 'bg-failed'}"></div>
	</div>

	<!-- Actions -->
	<div class="flex gap-2">
		{#if canView}
			<button
				onclick={handleVer}
				class="flex-1 cursor-pointer rounded-lg py-2 text-xs text-white/60 transition hover:bg-friday-blue/10 hover:text-friday-blue"
			>
				Ver
			</button>
		{:else}
			<span class="flex-1 cursor-default rounded-lg py-2 text-center text-xs text-white/20">Ver</span>
		{/if}
		<button
			onclick={() => onedit(account)}
			class="flex-1 cursor-pointer rounded-lg py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
		>
			Editar
		</button>
		<button
			onclick={() => onarchive(account)}
			class="flex-1 cursor-pointer rounded-lg py-2 text-xs transition {isActive
				? 'text-failed/60 hover:bg-failed/10 hover:text-failed'
				: 'text-success/60 hover:bg-success/10 hover:text-success'}"
		>
			{isActive ? 'Arquivar' : 'Ativar'}
		</button>
	</div>
</div>
