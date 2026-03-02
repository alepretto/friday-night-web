<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatCurrency(value: number): string {
		return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<!-- Month heading -->
	<p class="text-xs font-medium uppercase tracking-widest text-white/30">
		{capitalize(data.mesAtual)}
	</p>

	<!-- Saldo do mês -->
	<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
		<p class="mb-1 text-xs font-medium uppercase tracking-widest text-white/30">Saldo do mês</p>
		<p
			class="text-4xl font-bold tabular-nums
				{data.saldoMes >= 0 ? 'text-success' : 'text-failed'}"
		>
			{data.saldoMes >= 0 ? '+' : '−'} R$ {formatCurrency(Math.abs(data.saldoMes))}
		</p>
	</div>

	<!-- Gasto / Entrada lado a lado -->
	<div class="grid grid-cols-2 gap-3">
		<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
			<p class="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/30">Gastos</p>
			<p class="text-xl font-semibold tabular-nums text-failed">
				R$ {formatCurrency(data.gastoMes)}
			</p>
		</div>
		<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
			<p class="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/30">Entradas</p>
			<p class="text-xl font-semibold tabular-nums text-success">
				R$ {formatCurrency(data.entradaMes)}
			</p>
		</div>
	</div>

	<!-- Comparativo com mês anterior -->
	{#if data.deltaPercent !== null}
		<div class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
			<span class="text-lg {data.deltaPercent > 0 ? 'text-failed' : 'text-success'}">
				{data.deltaPercent > 0 ? '↑' : '↓'}
			</span>
			<div>
				<p class="text-sm text-white/70">
					<span class="font-semibold {data.deltaPercent > 0 ? 'text-failed' : 'text-success'}">
						{Math.abs(data.deltaPercent).toFixed(1)}%
					</span>
					vs {capitalize(data.mesAnterior)}
				</p>
				<p class="text-xs text-white/30">
					Gastos: R$ {formatCurrency(data.gastoPrevMes)} no mês anterior
				</p>
			</div>
		</div>
	{/if}

	<!-- Top categorias -->
	{#if data.topCategorias.length > 0}
		<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
			<p class="mb-3 text-[10px] font-medium uppercase tracking-widest text-white/30">
				Top categorias
			</p>
			<div class="flex flex-col gap-3">
				{#each data.topCategorias as cat}
					<div>
						<div class="mb-1 flex items-center justify-between">
							<span class="text-sm text-white/80">{cat.label}</span>
							<div class="flex items-baseline gap-2">
								<span class="text-xs text-white/40">{cat.percent.toFixed(0)}%</span>
								<span class="text-sm font-medium tabular-nums text-white">
									R$ {formatCurrency(cat.total)}
								</span>
							</div>
						</div>
						<div class="h-1 overflow-hidden rounded-full bg-white/10">
							<div
								class="h-full rounded-full bg-friday-blue"
								style="width: {Math.min(cat.percent, 100).toFixed(1)}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.gastoMes === 0 && data.entradaMes === 0}
		<div class="flex flex-col items-center gap-3 py-8 text-center">
			<span class="text-3xl opacity-30">◎</span>
			<p class="text-sm text-white/30">Nenhuma movimentação este mês</p>
		</div>
	{/if}
</div>
