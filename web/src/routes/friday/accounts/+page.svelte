<script lang="ts">
	import AccountCard from './_components/AccountCard.svelte';
	import AccountModal from './_components/AccountModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { WalletIcon } from 'lucide-svelte';
	import { showToast } from '$lib/toast.svelte';
	import { useStreamedData } from '$lib/utils/streamed-data.svelte';
	import { submitAction } from '$lib/utils/form-action';
	import type { Account } from '$lib/types/account';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const streamed = useStreamedData(() => data.streamed);
	const accounts = $derived<Account[]>(streamed.data?.accounts ?? []);

	// Create modal
	let createOpen = $state(false);
	let creating = $state(false);
	let createError = $state('');

	async function handleCreate(saveData: {
		financialInstitutionId: string;
		type: string;
		subtype: string;
	}) {
		creating = true;
		createError = '';

		const { success, error } = await submitAction('createAccount', {
			financialInstitutionId: saveData.financialInstitutionId,
			type: saveData.type,
			subtype: saveData.subtype
		});
		creating = false;

		if (success) {
			createOpen = false;
			showToast('Conta criada com sucesso!', 'success');
		} else {
			createError = error!;
			showToast(createError, 'error');
		}
	}

	// Archive/Activate confirm
	let confirmOpen = $state(false);
	let confirmAccount = $state<Account | null>(null);

	function askToggle(account: Account) {
		confirmAccount = account;
		confirmOpen = true;
	}

	async function confirmToggle() {
		if (!confirmAccount) return;
		confirmOpen = false;

		const isActive = confirmAccount.status === 'activate';
		const actionName = isActive ? 'archiveAccount' : 'activateAccount';

		const { success, error } = await submitAction(actionName, {
			accountId: confirmAccount.id
		});

		if (success) {
			const msg = isActive
				? `Conta "${confirmAccount.institution}" arquivada`
				: `Conta "${confirmAccount.institution}" ativada`;
			showToast(msg, 'success');
		} else {
			showToast(error ?? 'Erro ao atualizar conta', 'error');
		}

		confirmAccount = null;
	}

	// Edit (stub)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleEdit(account: Account) {
		showToast('Edição de conta em breve!', 'success');
	}

	const groups = [
		{ key: 'bank', label: 'Bank' },
		{ key: 'investment', label: 'Investimentos' },
		{ key: 'cash', label: 'Cash' },
		{ key: 'benefit', label: 'Benefícios' }
	] as const;
</script>

{#if !streamed.isLoading && streamed.data}
	<AccountModal
		open={createOpen}
		saving={creating}
		institutions={streamed.data.institutions}
		onclose={() => {
			createOpen = false;
			createError = '';
		}}
		onsave={handleCreate}
	/>
{/if}

<ConfirmDialog
	open={confirmOpen}
	title={confirmAccount?.status === 'activate' ? 'Arquivar conta?' : 'Ativar conta?'}
	message={confirmAccount?.status === 'activate'
		? `Tem certeza que deseja arquivar a conta "${confirmAccount?.institution}"?`
		: `Tem certeza que deseja ativar a conta "${confirmAccount?.institution}"?`}
	confirmLabel={confirmAccount?.status === 'activate' ? 'Arquivar' : 'Ativar'}
	onconfirm={confirmToggle}
	oncancel={() => {
		confirmOpen = false;
		confirmAccount = null;
	}}
/>

<div class="flex flex-col gap-6 text-white">
	<!-- Page header -->
	<div class="flex items-start justify-between">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl border border-friday-blue/20 bg-friday-blue/10"
			>
				<WalletIcon size={18} class="text-friday-blue" />
			</div>
			<div>
				<h1 class="text-xl font-bold text-white">Contas</h1>
				<p class="text-sm text-white/40">Gerencie as contas que você possui</p>
			</div>
		</div>
		<button
			onclick={() => (createOpen = true)}
			disabled={creating}
			class="cursor-pointer rounded-xl border border-friday-blue/20 bg-friday-blue/15 px-4 py-2 text-sm font-semibold text-friday-blue transition hover:bg-friday-blue/25 disabled:opacity-50"
		>
			+ Nova Conta
		</button>
	</div>

	{#if streamed.isLoading}
		<LoadingSpinner message="Carregando contas..." minHeight="min-h-96" />
	{:else}
		{#each groups as group (group.key)}
			{@const groupAccounts = accounts.filter((a) => a.type === group.key)}
			{#if groupAccounts.length}
				<div class="flex flex-col gap-3">
					<h2 class="text-xs font-semibold uppercase tracking-wider text-white/40">
						{group.label}
					</h2>
					<div class="grid grid-cols-3 gap-4">
						{#each groupAccounts as account (account.id)}
							<AccountCard {account} onedit={handleEdit} onarchive={askToggle} />
						{/each}
					</div>
				</div>
			{/if}
		{/each}

		{#if accounts.length === 0}
			<div class="flex flex-col items-center justify-center gap-3 py-20 text-center">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
				>
					<WalletIcon size={22} class="text-white/20" />
				</div>
				<p class="text-sm font-medium text-white/30">Nenhuma conta encontrada</p>
				<p class="text-xs text-white/20">Crie sua primeira conta para começar</p>
			</div>
		{/if}
	{/if}
</div>
