<script lang="ts">
	import { CircleCheck, CircleSlash } from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import PaymentMethodModal from './PaymentMethodModal.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface PaymentMethod {
		id: string;
		label: string;
		active: boolean;
	}

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
				console.error('Erro ao carregar métodos de pagamento:', err);
				isLoading = false;
			});
	});

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
	let saving = $state(false);
	let createError = $state('');

	async function handleSave(label: string) {
		saving = true;
		createError = '';

		const formData = new FormData();
		formData.set('label', label);

		const res = await fetch('?/createPaymentMethod', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		saving = false;

		if (result.type === 'success') {
			createOpen = false;
			showToast('Método de pagamento criado com sucesso!', 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			createError = (result.data?.error as string) ?? 'Erro desconhecido';
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

		const formData = new FormData();
		formData.set('methodId', confirmMethod.id);
		formData.set('active', String(confirmMethod.active));

		const res = await fetch('?/togglePaymentMethod', { method: 'POST', body: formData });
		const result = deserialize(await res.text());

		toggling = false;

		if (result.type === 'success') {
			const label = confirmMethod.active ? 'desativado' : 'ativado';
			showToast(`"${confirmMethod.label}" ${label} com sucesso!`, 'success');
			await invalidateAll();
		} else if (result.type === 'failure') {
			const msg = (result.data?.error as string) ?? 'Erro ao atualizar método';
			showToast(msg, 'error');
		}

		confirmMethod = null;
	}
</script>

<Toast message={toastMessage} type={toastType} visible={toastVisible} />

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

{#if isLoading}
	<div class="flex min-h-125 items-center justify-center py-20">
		<div class="flex flex-col items-center gap-4">
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"
			></div>
			<p class="text-sm text-gray-400">Carregando métodos de pagamento...</p>
		</div>
	</div>
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
			{#each resolvedData.methods as method (method.id)}
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
