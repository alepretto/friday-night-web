<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { AccountType } from '$lib/types/account';

	interface Institution {
		id: string;
		name: string;
	}

	interface Props {
		open: boolean;
		saving?: boolean;
		institutions: Institution[];
		onclose: () => void;
		onsave: (data: { financialInstitutionId: string; type: AccountType; subtype: string }) => void;
	}

	let { open, saving = false, institutions, onclose, onsave }: Props = $props();

	let financialInstitutionId = $state('');
	let type = $state<AccountType | ''>('');
	let subtype = $state('');

	$effect(() => {
		if (!open) {
			financialInstitutionId = '';
			type = '';
			subtype = '';
		}
	});

	function handleSave() {
		if (!financialInstitutionId || !type) return;
		onsave({ financialInstitutionId, type: type as AccountType, subtype: subtype.trim() });
	}
</script>

<Modal title="Nova Conta" {open} {onclose} onsave={handleSave} {saving}>
	{#snippet body()}
		<div class="flex w-full flex-col gap-5 px-4 pb-2">
			<div class="flex flex-col gap-2">
				<label class="pl-1 text-sm text-gray-400" for="acc-institution">Instituição</label>
				<select
					id="acc-institution"
					bind:value={financialInstitutionId}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				>
					<option class="text-black" value="">Selecione...</option>
					{#each institutions as inst (inst.id)}
						<option class="text-black" value={inst.id}>{inst.name}</option>
					{/each}
				</select>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="acc-type">Tipo</label>
					<select
						id="acc-type"
						bind:value={type}
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					>
						<option class="text-black" value="">Selecione...</option>
						<option class="text-black" value="bank">Bank</option>
						<option class="text-black" value="investment">Investment</option>
						<option class="text-black" value="cash">Cash</option>
						<option class="text-black" value="benefit">Benefício</option>
					</select>
				</div>

				<div class="flex flex-col gap-2">
					<label class="pl-1 text-sm text-gray-400" for="acc-subtype">Subtipo (opcional)</label>
					<input
						id="acc-subtype"
						bind:value={subtype}
						placeholder="ex: Conta Corrente"
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-white/20"
					/>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>
