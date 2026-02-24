<script lang="ts">
	import { ReceiptIcon } from 'lucide-svelte';
	import CardsTable from './_components/CardsTable.svelte';
	import type { CardInfo } from '$lib/types/account';
	import type { Transaction } from '$lib/types/transaction';
	import TableTransactions from './_components/TableTransactions.svelte';

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

	const transactions: Transaction[] = [
		{
			id: 1,
			category: 'Alimentação',
			subcategory: 'Café da Manhã',
			paymentMethod: 'Vale Refição',
			dateTransaction: '2026-02-24T19:08:00-03:00',
			type: 'outcome',
			value: 16,
			description: 'Café da Área'
		},
		{
			id: 2,
			category: 'Salário',
			subcategory: 'Salário Mensal',
			paymentMethod: 'Ted',
			dateTransaction: '2026-02-24T19:08:00-03:00',
			type: 'income',
			value: 16,
			description: null
		}
	];
</script>

<main class="flex flex-col gap-5 text-white">
	<div class="grid grid-cols-9 gap-15 pt-5">
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

	<div class="flex flex-col gap-10">
		<div class="flex justify-between">
			<h1 class="text-3xl font-bold">Transações</h1>
			<button
				// onclick={() => (open = true)}
				class="cursor-pointer rounded-3xl border border-friday-blue/60 bg-friday-blue/40 px-10 py-3 transition-colors hover:bg-friday-blue"
			>
				New Transaction
			</button>
		</div>

		<div class="flex justify-around">
			<div class="flex gap-5">
				{#each [{ id: 'date_start', label: 'Date Start' }, { id: 'date_end', label: 'Date End' }] as field (field.id)}
					<div class="flex w-full flex-col gap-1">
						<label class="px-2 text-sm text-gray-400" for="transaction-tag-{field.id}">
							{field.label}
						</label>
						<input
							class="w-full rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
							name="transaction-{field.id}"
							id="transaction-{field.id}"
							type="date"
						/>
					</div>
				{/each}
			</div>
			<div class="flex w-full max-w-3xl gap-5">
				{#each [{ id: 'category', label: 'Category' }, { id: 'subcategory', label: 'Subcategory' }, { id: 'type', label: 'Type' }, { id: 'payment_method', label: 'Payment Method' }] as field (field.id)}
					<div class="flex w-full flex-col gap-1">
						<label class="px-2 text-sm text-gray-400" for="transaction-tag-{field.id}">
							{field.label}
						</label>
						<select
							class="w-full rounded-xl bg-secondary/30 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
							name="transaction-tag-{field.id}"
							id="transaction-tag-{field.id}"
						>
							<option value="">Selecione...</option>
						</select>
					</div>
				{/each}
			</div>
		</div>

		<div class="flex justify-center">
			<TableTransactions {transactions} />
		</div>
	</div>
</main>
