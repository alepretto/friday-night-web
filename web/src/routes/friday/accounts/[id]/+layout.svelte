<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeftIcon } from 'lucide-svelte';
	import type { Account } from '$lib/types/account';

	interface Props {
		data: { account: Account; bankAccountId: string | null; investmentAccountId: string | null };
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	const account = $derived(data.account);
	const activate = $derived(account.status === 'activate');

	const deparaType: Record<string, string> = {
		bank: 'Conta Bancária',
		investment: 'Investimentos',
		cash: 'Dinheiro',
		benefit: 'Benefício'
	};

	// Tabs gerados dinamicamente com os IDs corretos de cada conta irmã
	const tabs = $derived([
		...(data.bankAccountId
			? [{ label: 'Conta', route: `/friday/accounts/${data.bankAccountId}/bank` }]
			: []),
		...(data.investmentAccountId
			? [
					{
						label: 'Investimentos',
						route: `/friday/accounts/${data.investmentAccountId}/investment`
					}
				]
			: [])
	]);
</script>

<div class="flex flex-col gap-6 text-white">
	<!-- Back + account info -->
	<div class="flex items-center gap-4">
		<a
			href="/friday/accounts"
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:border-white/20 hover:text-white"
		>
			<ArrowLeftIcon size={16} />
		</a>
		{#if account.logoPath}
			<img src={account.logoPath} alt="" class="h-10 w-10 rounded-xl object-contain" />
		{:else}
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white/40">
				{account.institution.slice(0, 2).toUpperCase()}
			</div>
		{/if}
		<div class="flex-1">
			<h1 class="text-xl font-bold">{account.institution}</h1>
			<p class="text-sm text-white/40">
				{deparaType[account.type] ?? account.type}{account.subtype
					? ` · ${account.subtype}`
					: ''}
			</p>
		</div>
		<span
			class="rounded-full px-3 py-1 text-xs font-semibold {activate
				? 'bg-success/10 text-success'
				: 'bg-failed/10 text-failed'}"
		>
			{activate ? 'Ativa' : 'Arquivada'}
		</span>
	</div>

	<!-- Pill tabs -->
	<div class="flex">
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

	{@render children()}
</div>
