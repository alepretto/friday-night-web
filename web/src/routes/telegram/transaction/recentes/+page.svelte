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

	const now = new Date();
	const mesAtual = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
	function capitalize(s: string) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
</script>

<div class="flex flex-col">
	<!-- Header do mês -->
	<div class="flex items-center justify-between px-4 py-3">
		<span class="text-xs font-semibold uppercase tracking-widest text-white/30">
			{capitalize(mesAtual)}
		</span>
		<span class="text-xs text-white/25">{data.transactions.length} transações</span>
	</div>

	{#if data.transactions.length === 0}
		<div class="flex flex-col items-center justify-center gap-3 py-20 text-center">
			<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
				<span class="text-2xl opacity-30">≡</span>
			</div>
			<p class="text-sm font-medium text-white/30">Nenhuma transação este mês</p>
			<p class="text-xs text-white/20">As transações aparecerão aqui conforme você registrar</p>
		</div>
	{:else}
		<div class="divide-y divide-white/[0.05]">
			{#each data.transactions as tx}
				<div class="flex items-center gap-3 px-4 py-3">
					<!-- Tipo (indicador lateral) -->
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold
							{tx.type === 'income'
							? 'border-success/25 bg-success/10 text-success'
							: 'border-failed/25 bg-failed/10 text-red-300'}"
					>
						{tx.type === 'income' ? '↑' : '↓'}
					</div>

					<!-- Info -->
					<div class="min-w-0 flex-1">
						<div class="flex items-baseline justify-between gap-2">
							<span class="truncate text-sm font-medium text-white/85">
								{tx.category}
							</span>
							<span
								class="shrink-0 text-sm font-bold tabular-nums
									{tx.type === 'income' ? 'text-success' : 'text-red-300'}"
							>
								{tx.type === 'income' ? '+' : '−'} {formatValue(tx.value)}
							</span>
						</div>
						<div class="mt-0.5 flex items-center gap-1.5">
							<span class="text-xs text-white/30">{tx.subcategory}</span>
							<span class="text-white/15">·</span>
							<span class="text-xs text-white/25">{tx.paymentMethod}</span>
							{#if tx.description}
								<span class="text-white/15">·</span>
								<span class="truncate text-xs text-white/20 italic">{tx.description}</span>
							{/if}
						</div>
					</div>

					<!-- Data/hora -->
					<div class="flex shrink-0 flex-col items-end">
						<span class="text-xs font-medium text-white/40">{formatDate(tx.date)}</span>
						<span class="text-[10px] text-white/20">{formatTime(tx.date)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
