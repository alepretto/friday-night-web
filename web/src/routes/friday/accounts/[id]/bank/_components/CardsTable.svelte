<script lang="ts">
	import { Trash2 } from 'lucide-svelte';
	import Table, { type Column } from '$lib/components/ui/Table.svelte';
	import type { CardInfo } from '$lib/types/account';

	const columns: Column<CardInfo>[] = [
		{ key: 'label', label: 'Nome', align: 'left' },
		{ key: 'flag', label: 'Bandeira', align: 'center' },
		{ key: 'close_day', label: 'Dia Fechamento', align: 'center' },
		{ key: 'due_day', label: 'Dia Pagamento', align: 'center' },
		{ key: 'limit', label: 'Limite', align: 'center' },
		{ key: 'actions', label: '', align: 'center' }
	];

	interface Props {
		cardsInfo: CardInfo[];
		ondelete: (id: string) => void;
	}

	let { cardsInfo, ondelete }: Props = $props();
</script>

<Table rowKey="id" data={cardsInfo} {columns}>
	{#snippet cell({ row, key })}
		{@const value = row[key as keyof CardInfo]}
		{#if key === 'limit' && typeof value === 'number'}
			{value.toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
				minimumFractionDigits: 2
			})}
		{:else if key === 'actions'}
			<button
				onclick={() => ondelete(row.id)}
				class="cursor-pointer text-failed/60 transition-colors hover:text-failed"
				title="Deletar cartão"
			>
				<Trash2 size={16} />
			</button>
		{:else}
			{row[key as keyof CardInfo]}
		{/if}
	{/snippet}
</Table>
