<script lang="ts">
	import type { Transaction } from '$lib/types/transaction';
	import { getDia, getMesAno } from '$lib/utils/date';
	import { Trash2, SquarePen } from 'lucide-svelte';

	interface Props {
		transactions: Transaction[];
	}

	let { transactions }: Props = $props();

	const typeBadge = {
		income: 'bg-success/50 border-success text-green-500/80',
		outcome: 'bg-failed/50 border-failed text-red-500/80'
	};
</script>

<div class="flex flex-col gap-2">
	{#each transactions as transaction (transaction.id)}
		<div
			class="grid grid-cols-[92px_145px_190px_135px_125px_185px_92px]
			       items-center gap-x-6
			       rounded-2xl bg-secondary/30 px-8 py-5
			       transition-all
			       duration-200 hover:translate-x-2
			       hover:bg-secondary/50"
		>
			<div class="flex flex-col items-center">
				<span class="text-xl font-bold">{getDia(transaction.dateTransaction)}</span>
				<span class="text-muted-foreground text-sm">{getMesAno(transaction.dateTransaction)}</span>
			</div>

			<span class="truncate text-xl">{transaction.category}</span>

			<div class="flex flex-col truncate">
				<span class="text-base font-bold">{transaction.subcategory}</span>
				{#if transaction.description}
					<span class="text-sm">{transaction.description}</span>
				{:else}
					<span>-</span>
				{/if}
			</div>
			<span>
				{transaction.paymentMethod}
			</span>
			<span
				class="rounded-full border px-5 py-2 text-center text-sm font-bold {typeBadge[
					transaction.type
				]}"
			>
				{transaction.type}
			</span>

			<span class="text-center text-xl font-bold">
				{transaction.value.toLocaleString('pt-BR', {
					style: 'currency',
					currency: 'BRL',
					minimumFractionDigits: 2 // força 2 casas decimais
				})}
			</span>

			<div class="flex gap-3">
				<SquarePen class="cursor-pointer text-orange-800" />
				<Trash2 class="cursor-pointer text-gray-700" />
			</div>
		</div>
	{/each}
</div>
