<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import AccountCard from './_components/AccountCard.svelte';
	import AccountModal from './_components/AccountModal.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import type { Account } from '$lib/types/account';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// === Resolve o streamed ===
	let resolvedData = $state<any>(null);
	let isLoading = $state(true);

	$effect(() => {
		isLoading = true;
		Promise.resolve(data.streamed)
			.then(async (result) => {
				if ('unauthorized' in result) {
					await fetch('/login?/logout', { method: 'POST' });
					goto('/login');
					return;
				}
				resolvedData = result;
				isLoading = false;
			})
			.catch((err) => {
				console.error('Erro ao carregar contas:', err);
				isLoading = false;
			});
	});

	const accounts = $derived<Account[]>(resolvedData?.accounts ?? []);

	// Toast
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let toastTimer: ReturnType<typeof setTimeout>;

	function showToast(message: string, type: 'success' | 'error') {
		clearTimeout(toastTimer);
		toastMessage = message;
		toastType = type;
		toastVisible = true;
		toastTimer = setTimeout(() => {
			toastVisible = false;
		}, 3000);
	}

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

		const formData = new FormData();
		formData.set('financialInstitutionId', saveData.financialInstitutionId);
		formData.set('type', saveData.type);
		formData.set('subtype', saveData.subtype);

		const res = await fetch('?/createAccount', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		creating = false;

		if (result.type === 'success') {
			createOpen = false;
			showToast('Conta criada com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			createError = (result.data?.error as string) ?? 'Erro desconhecido';
			showToast(createError, 'error');
		}
	}

	// Archive/Activate confirm
	let confirmOpen = $state(false);
	let confirmAccount = $state<Account | null>(null);
	let toggling = $state(false);

	function askToggle(account: Account) {
		confirmAccount = account;
		confirmOpen = true;
	}

	async function confirmToggle() {
		if (!confirmAccount) return;
		confirmOpen = false;
		toggling = true;

		const isActive = confirmAccount.status === 'activate';
		const action = isActive ? '?/archiveAccount' : '?/activateAccount';

		const formData = new FormData();
		formData.set('accountId', confirmAccount.id);

		const res = await fetch(action, { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		toggling = false;

		if (result.type === 'success') {
			const msg = isActive
				? `Conta "${confirmAccount.institution}" arquivada`
				: `Conta "${confirmAccount.institution}" ativada`;
			showToast(msg, 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			showToast((result.data?.error as string) ?? 'Erro ao atualizar conta', 'error');
		}

		confirmAccount = null;
	}

	// Edit (stub — just show toast for now since subtype edit needs more design)
	function handleEdit(account: Account) {
		showToast('Edição de conta em breve!', 'success');
	}
</script>

<Toast message={toastMessage} type={toastType} visible={toastVisible} />

{#if !isLoading && resolvedData}
	<AccountModal
		open={createOpen}
		saving={creating}
		institutions={resolvedData.institutions}
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

	{#if isLoading}
		<div class="flex min-h-96 items-center justify-center py-20">
			<div class="flex flex-col items-center gap-4">
				<div
					class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"
				></div>
				<p class="text-sm text-gray-400">Carregando contas...</p>
			</div>
		</div>
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
				{#each [
					{ key: 'bank', label: 'Bank' },
					{ key: 'investment', label: 'Investimentos' },
					{ key: 'cash', label: 'Cash' },
					{ key: 'benefit', label: 'Benefícios' }
				] as group (group.key)}
					{@const groupAccounts = accounts.filter((a) => a.type === group.key)}
					{#if groupAccounts.length}
						<div>
							<div class="my-3 border-b border-secondary/50 pb-3">
								<span class="text-4xl font-bold">{group.label}</span>
							</div>
							<div class="grid grid-cols-3 gap-4">
								{#each groupAccounts as account (account.id)}
									<AccountCard
										{account}
										onedit={handleEdit}
										onarchive={askToggle}
									/>
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
