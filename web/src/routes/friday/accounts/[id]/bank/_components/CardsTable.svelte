<script lang="ts">
	import Table, { type Column } from '$lib/components/ui/Table.svelte';

	import type { CardInfo } from '$lib/types/account';

	const columns: Column<CardInfo>[] = [
		{ key: 'name', label: 'Nome', align: 'center' },
		{ key: 'flag', label: 'Bandeira', align: 'center' },
		{ key: 'closing_day', label: 'Dia Fechamento', align: 'center' },
		{ key: 'due_day', label: 'Dia Pagamento', align: 'center' },
		{ key: 'limit', label: 'Limite', align: 'center' },
		{ key: 'bill', label: 'Fatura', align: 'center' },
		{ key: 'total_bill', label: 'Fatura Total', align: 'center' }
	];

	interface Props {
		cardsInfo: CardInfo[];
	}

	let { cardsInfo }: Props = $props();
</script>

<Table rowKey="id" data={cardsInfo} {columns}>
	{#snippet cell({ row, key })}
		{@const value = row[key as keyof CardInfo]}
		{#if ['limit', 'bill', 'total_bill'].includes(key as keyof CardInfo) && typeof value === 'number'}
			{value.toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
				minimumFractionDigits: 2 // força 2 casas decimais
			})}
		{:else}
			{row[key as keyof CardInfo]}
		{/if}
	{/snippet}
</Table>
