<script lang="ts">
	import AccountCard from './_components/AccountCard.svelte';
	import AccountModal from './_components/AccountModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
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

<main>
	<header class="text-white">
		<h1 class="text-4xl font-bold">Accounts</h1>
		<p>Gerencie as contas que você possui.</p>
	</header>

	{#if streamed.isLoading}
		<LoadingSpinner message="Carregando contas..." minHeight="min-h-96" />
	{:else}
		<section class="text-white">
			<div class="flex items-center justify-end p-10">
				<div class="flex flex-col items-end gap-1">
					{#if createError}
						<p class="text-sm text-failed">{createError}</p>
					{/if}
					<button
						onclick={() => (createOpen = true)}
						disabled={creating}
						class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success disabled:opacity-50"
					>
						New Account
					</button>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				{#each [{ key: 'bank', label: 'Bank' }, { key: 'investment', label: 'Investimentos' }, { key: 'cash', label: 'Cash' }, { key: 'benefit', label: 'Benefícios' }] as group (group.key)}
					{@const groupAccounts = accounts.filter((a) => a.type === group.key)}
					{#if groupAccounts.length}
						<div>
							<div class="my-3 border-b border-secondary/50 pb-3">
								<span class="text-4xl font-bold">{group.label}</span>
							</div>
							<div class="grid grid-cols-3 gap-4">
								{#each groupAccounts as account (account.id)}
									<AccountCard {account} onedit={handleEdit} onarchive={askToggle} />
								{/each}
							</div>
						</div>
					{/if}
				{/each}

				{#if accounts.length === 0}
					<p class="py-20 text-center text-gray-500">
						Nenhuma conta encontrada. Crie sua primeira conta!
					</p>
				{/if}
			</div>
		</section>
	{/if}
</main>
