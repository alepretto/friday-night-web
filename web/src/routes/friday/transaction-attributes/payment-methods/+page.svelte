<script lang="ts">
	import { CircleCheck, CircleSlash } from 'lucide-svelte';
	import PaymentMethodModal from './PaymentMethodModal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { showToast } from '$lib/toast.svelte';
	import { useStreamedData } from '$lib/utils/streamed-data.svelte';
	import { submitAction } from '$lib/utils/form-action';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface PaymentMethod {
		id: string;
		label: string;
		active: boolean;
	}

	const streamed = useStreamedData(() => data.streamed);

	// Create modal
	let createOpen = $state(false);
	let saving = $state(false);
	let createError = $state('');

	async function handleSave(label: string) {
		saving = true;
		createError = '';

		const { success, error } = await submitAction('createPaymentMethod', { label });
		saving = false;

		if (success) {
			createOpen = false;
			showToast('Método de pagamento criado com sucesso!', 'success');
		} else {
			createError = error!;
			showToast(createError, 'error');
		}
	}

	// Toggle confirm
	let confirmOpen = $state(false);
	let confirmMethod = $state<PaymentMethod | null>(null);
	let toggling = $state(false);

	function askToggle(method: PaymentMethod) {
		confirmMethod = method;
		confirmOpen = true;
	}

	async function confirmToggle() {
		if (!confirmMethod) return;
		confirmOpen = false;
		toggling = true;

		const { success, error } = await submitAction('togglePaymentMethod', {
			methodId: confirmMethod.id,
			active: String(confirmMethod.active)
		});
		toggling = false;

		if (success) {
			const label = confirmMethod.active ? 'desativado' : 'ativado';
			showToast(`"${confirmMethod.label}" ${label} com sucesso!`, 'success');
		} else {
			showToast(error ?? 'Erro ao atualizar método', 'error');
		}

		confirmMethod = null;
	}
</script>

<ConfirmDialog
	open={confirmOpen}
	title={confirmMethod?.active ? 'Desativar método?' : 'Ativar método?'}
	message={confirmMethod?.active
		? `Tem certeza que deseja desativar "${confirmMethod?.label}"?`
		: `Tem certeza que deseja ativar "${confirmMethod?.label}"?`}
	confirmLabel={confirmMethod?.active ? 'Desativar' : 'Ativar'}
	onconfirm={confirmToggle}
	oncancel={() => {
		confirmOpen = false;
		confirmMethod = null;
	}}
/>

{#if streamed.isLoading}
	<LoadingSpinner message="Carregando métodos de pagamento..." />
{:else}
	<PaymentMethodModal
		open={createOpen}
		{saving}
		onclose={() => {
			createOpen = false;
			createError = '';
		}}
		onsave={handleSave}
	/>

	<section>
		<div class="flex items-center justify-end p-10">
			<div class="flex flex-col items-end gap-1">
				{#if createError}
					<p class="text-sm text-failed">{createError}</p>
				{/if}
				<button
					onclick={() => (createOpen = true)}
					disabled={saving}
					class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success disabled:opacity-50"
				>
					New Payment Method
				</button>
			</div>
		</div>

		<div class="grid grid-cols-4 gap-10 px-10">
			{#each streamed.data!.methods as method (method.id)}
				<div
					class="flex h-25 items-center justify-around rounded-2xl border-2 bg-secondary/30 px-2 shadow-2xl {method.active
						? 'border-success/30'
						: 'border-failed/30'}"
				>
					<div class="w-full pl-5 text-[20px] font-bold">{method.label}</div>
					<div class="flex shrink-0 items-center justify-between gap-10">
						<div
							class="h-5 w-5 rounded-full {method.active ? 'bg-success' : 'bg-friday-red'}"
						></div>
						<button
							onclick={() => askToggle(method as PaymentMethod)}
							disabled={toggling}
							class="w-10 cursor-pointer disabled:opacity-40 {method.active
								? 'text-friday-red'
								: 'text-success'}"
						>
							{#if method.active}
								<CircleSlash size={30} />
							{:else}
								<CircleCheck size={30} />
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
