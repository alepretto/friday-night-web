<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
	}

	function formatTime(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
	}

	function formatValue(value: number): string {
		return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
</script>

<div class="flex flex-col">
	{#if data.transactions.length === 0}
		<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
			<span class="text-3xl opacity-30">≡</span>
			<p class="text-sm text-white/30">Nenhuma transação este mês</p>
		</div>
	{:else}
		<div class="divide-y divide-white/[0.06]">
			{#each data.transactions as tx}
				<div class="flex items-start gap-3 px-4 py-3.5">
					<!-- Date/time -->
					<div class="flex w-10 shrink-0 flex-col items-center pt-0.5">
						<span class="text-xs font-semibold text-white/70">{formatDate(tx.date)}</span>
						<span class="text-[10px] text-white/30">{formatTime(tx.date)}</span>
					</div>

					<!-- Main info -->
					<div class="min-w-0 flex-1">
						<div class="flex items-baseline justify-between gap-2">
							<span class="truncate text-sm font-medium text-white">
								{tx.category} — {tx.subcategory}
							</span>
							<span
								class="shrink-0 text-sm font-semibold tabular-nums
									{tx.type === 'income' ? 'text-success' : 'text-failed'}"
							>
								{tx.type === 'income' ? '+' : '−'} R$ {formatValue(tx.value)}
							</span>
						</div>
						<div class="mt-0.5 flex items-center gap-2">
							<span class="text-xs text-white/30">{tx.paymentMethod}</span>
							{#if tx.description}
								<span class="text-white/20">·</span>
								<span class="truncate text-xs text-white/30">{tx.description}</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
