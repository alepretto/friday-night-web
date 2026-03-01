<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Props {
		open: boolean;
		saving?: boolean;
		onclose: () => void;
		onsave: (data: {
			label: string;
			flag: string;
			close_day: number;
			due_day: number;
			limit: number;
		}) => void;
	}

	let { open, saving = false, onclose, onsave }: Props = $props();

	let label = $state('');
	let flag = $state<'mastercard' | 'visa'>('visa');
	let close_day = $state('');
	let due_day = $state('');
	let limit = $state('');

	$effect(() => {
		if (open) {
			label = '';
			flag = 'visa';
			close_day = '';
			due_day = '';
			limit = '';
		}
	});

	function handleSave() {
		const cd = parseInt(close_day);
		const dd = parseInt(due_day);
		const lim = parseFloat(limit);

		if (!label.trim()) return;
		if (!flag || isNaN(cd) || cd < 1 || cd > 31) return;
		if (isNaN(dd) || dd < 1 || dd > 31) return;
		if (isNaN(lim) || lim <= 0) return;

		onsave({ label: label.trim(), flag, close_day: cd, due_day: dd, limit: lim });
	}
</script>

<Modal title="Novo Cartão" {open} {saving} {onclose} onsave={handleSave}>
	{#snippet body()}
		<div class="flex flex-col gap-6">
			<div class="flex flex-col gap-1">
				<label class="pl-1 text-sm text-gray-400" for="card-label">Nome do cartão</label>
				<input
					id="card-label"
					type="text"
					bind:value={label}
					placeholder="Ex: Nubank Principal"
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label class="pl-1 text-sm text-gray-400" for="card-flag">Bandeira</label>
				<select
					id="card-flag"
					bind:value={flag}
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				>
					<option class="text-black" value="visa">Visa</option>
					<option class="text-black" value="mastercard">Mastercard</option>
				</select>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="flex flex-col gap-1">
					<label class="pl-1 text-sm text-gray-400" for="card-close">Dia de Fechamento</label>
					<input
						id="card-close"
						type="number"
						min="1"
						max="31"
						bind:value={close_day}
						placeholder="Ex: 15"
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					/>
				</div>
				<div class="flex flex-col gap-1">
					<label class="pl-1 text-sm text-gray-400" for="card-due">Dia de Vencimento</label>
					<input
						id="card-due"
						type="number"
						min="1"
						max="31"
						bind:value={due_day}
						placeholder="Ex: 22"
						class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
					/>
				</div>
			</div>

			<div class="flex flex-col gap-1">
				<label class="pl-1 text-sm text-gray-400" for="card-limit">Limite (R$)</label>
				<input
					id="card-limit"
					type="number"
					min="0"
					step="0.01"
					bind:value={limit}
					placeholder="Ex: 5000.00"
					class="w-full rounded-xl bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-white/20"
				/>
			</div>
		</div>
	{/snippet}
</Modal>
