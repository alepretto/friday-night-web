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

	<!-- Action bar -->
	<div class="mb-6 flex justify-end">
		<button
			onclick={() => (createOpen = true)}
			disabled={saving}
			class="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
		>
			New Method
		</button>
	</div>

	<!-- Grid -->
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
		{#each streamed.data!.methods as method (method.id)}
			<div
				class="flex items-center justify-between rounded-xl border bg-white/[0.03] px-4 py-4 transition-colors
					{method.active
					? 'border-success/25 hover:border-success/40'
					: 'border-white/8 hover:border-white/15'}"
			>
				<div class="flex items-center gap-3 min-w-0">
					<div class="h-2 w-2 shrink-0 rounded-full {method.active ? 'bg-success' : 'bg-failed'}"></div>
					<span class="truncate text-sm font-medium text-white/80">{method.label}</span>
				</div>
				<button
					onclick={() => askToggle(method as PaymentMethod)}
					disabled={toggling}
					class="ml-3 shrink-0 transition disabled:opacity-40 {method.active
						? 'text-white/25 hover:text-friday-red'
						: 'text-white/25 hover:text-success'}"
					title={method.active ? 'Desativar' : 'Ativar'}
				>
					{#if method.active}
						<CircleSlash size={16} />
					{:else}
						<CircleCheck size={16} />
					{/if}
				</button>
			</div>
		{/each}
	</div>
{/if}
