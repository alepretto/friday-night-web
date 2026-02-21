<script lang="ts">
	import { CircleCheck, CircleSlash, X } from 'lucide-svelte';

	import PaymentMethodModal from './PaymentMethodModal.svelte';

	interface PaymentMethod {
		id: number;
		label: string;
		active: boolean;
	}

	const methods: PaymentMethod[] = $state([
		{ id: 1, label: 'Cartão de Crédito', active: true },
		{ id: 2, label: 'Cartão de Débito', active: true },
		{ id: 3, label: 'Vale Alimentação', active: false },
		{ id: 4, label: 'Vale Refeição', active: true },
		{ id: 5, label: 'Boleto', active: true }
	]);

	let open = $state(false);

	let nextId = $state(6);

	function createPaymentMethod(method: string) {
		methods.push({
			id: nextId,
			label: method,
			active: true
		});

		nextId = nextId + 1;
		open = false;
	}
</script>

<PaymentMethodModal {open} onSave={createPaymentMethod} onclose={() => (open = false)} />

<section>
	<div class="flex items-center justify-end p-10">
		<button
			onclick={() => (open = true)}
			class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success"
		>
			New Payment Method
		</button>
	</div>

	<div class="grid grid-cols-4 gap-10 px-10">
		{#each methods as method (method.id)}
			<div
				class="flex h-25 items-center justify-around rounded-2xl border-2 bg-secondary/30 px-2 shadow-2xl {method.active
					? 'border-success/30'
					: 'border-failed/30'}"
			>
				<div class="w-full pl-5 text-[20px] font-bold">{method.label}</div>
				<div class="flex shrink-0 items-center justify-between gap-10">
					{#if method.active}
						<div class=" h-5 w-5 rounded-full bg-success"></div>
						<div class="w-10 cursor-pointer text-friday-red"><CircleSlash size={30} /></div>
					{:else}
						<div class="h-5 w-5 rounded-full bg-friday-red"></div>
						<div class="w-10 cursor-pointer text-success"><CircleCheck size={30} /></div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
