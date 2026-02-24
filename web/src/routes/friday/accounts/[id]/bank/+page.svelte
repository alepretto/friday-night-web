<script lang="ts">
	import { ReceiptIcon } from 'lucide-svelte';
	import CardsTable from './_components/CardsTable.svelte';
	import type { CardInfo } from '$lib/types/account';

	const summaryAccount = [
		{ label: 'Saldo', value: 1500 },
		{ label: 'Fatura', value: 5000 },
		{ label: 'Fatura Total', value: 15000 }
	];

	const cardsInfo: CardInfo[] = [
		{
			id: 1,
			name: 'Unique',
			flag: 'visa',
			closing_day: 28,
			due_day: 4,
			limit: 36000,
			bill: 1000,
			total_bill: 20000
		},
		{
			id: 2,
			name: 'Unique',
			flag: 'visa',
			closing_day: 28,
			due_day: 4,
			limit: 36000,
			bill: 1000,
			total_bill: 20000
		},
		{
			id: 3,
			name: 'Unique',
			flag: 'visa',
			closing_day: 28,
			due_day: 4,
			limit: 36000,
			bill: 1000,
			total_bill: 20000
		}
	];
</script>

<main class="text-white">
	<div class="grid grid-cols-9 gap-5 pt-5">
		<div class="col-span-2 flex flex-col justify-around gap-5">
			{#each summaryAccount as info (info.label)}
				<div class="flex justify-between px-3 py-5">
					<div class="flex items-center gap-3">
						<ReceiptIcon size={35} />
						<span class="text-xl italic">{info.label}</span>
					</div>

					<div class="text-2xl font-bold">
						{info.value.toLocaleString('pt-BR', {
							style: 'currency',
							currency: 'BRL',
							minimumFractionDigits: 2 // força 2 casas decimais
						})}
					</div>
				</div>
			{/each}
		</div>

		<div class="col-span-7 flex flex-col gap-5 p-5">
			<div class="flex items-center justify-between">
				<h1 class="text-3xl font-bold">Cartões</h1>

				<button
					// onclick={() => (open = true)}
					class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success"
				>
					New Card
				</button>
			</div>

			<div class="flex h-70">
				<CardsTable {cardsInfo} />
			</div>
		</div>
	</div>
</main>
