<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function fmt(value: number): string {
		return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	const saldoPositivo = $derived(data.saldoMes >= 0);
</script>

<div class="flex flex-col gap-3 p-4">
	<!-- Mês -->
	<p class="text-[10px] font-semibold uppercase tracking-widest text-white/30">
		{capitalize(data.mesAtual)}
	</p>

	<!-- Saldo principal -->
	<div class="rounded-2xl border {saldoPositivo ? 'border-success/20 bg-success/5' : 'border-failed/20 bg-failed/5'} p-5 text-center">
		<p class="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">Saldo do mês</p>
		<p class="text-4xl font-bold tabular-nums {saldoPositivo ? 'text-success' : 'text-red-300'}">
			{saldoPositivo ? '+' : '−'} R$ {fmt(Math.abs(data.saldoMes))}
		</p>
		<p class="mt-1 text-xs text-white/30">receitas − gastos</p>
	</div>

	<!-- Gasto / Entrada -->
	<div class="grid grid-cols-2 gap-2">
		<div class="rounded-xl border border-failed/15 bg-failed/5 p-4">
			<div class="mb-1 flex items-center gap-1.5">
				<span class="text-sm text-red-300">↓</span>
				<p class="text-[10px] font-semibold uppercase tracking-widest text-white/30">Gastos</p>
			</div>
			<p class="text-lg font-bold tabular-nums text-red-300">R$ {fmt(data.gastoMes)}</p>
		</div>
		<div class="rounded-xl border border-success/15 bg-success/5 p-4">
			<div class="mb-1 flex items-center gap-1.5">
				<span class="text-sm text-success">↑</span>
				<p class="text-[10px] font-semibold uppercase tracking-widest text-white/30">Entradas</p>
			</div>
			<p class="text-lg font-bold tabular-nums text-success">R$ {fmt(data.entradaMes)}</p>
		</div>
	</div>

	<!-- Comparativo mês anterior -->
	{#if data.deltaPercent !== null}
		{@const delta = data.deltaPercent}
		{@const melhorou = delta <= 0}
		<div
			class="flex items-center gap-3 rounded-xl border px-4 py-3
				{melhorou ? 'border-success/15 bg-success/5' : 'border-failed/15 bg-failed/5'}"
		>
			<span class="text-xl font-bold {melhorou ? 'text-success' : 'text-red-300'}">
				{melhorou ? '↓' : '↑'}
			</span>
			<div>
				<p class="text-sm text-white/70">
					<span class="font-bold {melhorou ? 'text-success' : 'text-red-300'}">
						{Math.abs(delta).toFixed(1)}%
					</span>
					vs {capitalize(data.mesAnterior)}
				</p>
				<p class="text-xs text-white/30">
					Gastos anteriores: R$ {fmt(data.gastoPrevMes)}
				</p>
			</div>
		</div>
	{/if}

	<!-- Top categorias -->
	{#if data.topCategorias.length > 0}
		<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
			<p class="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
				Top categorias
			</p>
			<div class="flex flex-col gap-3.5">
				{#each data.topCategorias as cat, i}
					{@const colors = ['bg-friday-blue', 'bg-friday-orange', 'bg-success', 'bg-friday-red', 'bg-purple-500']}
					<div>
						<div class="mb-1.5 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full {colors[i] ?? 'bg-white/30'}"></div>
								<span class="text-sm text-white/75">{cat.label}</span>
							</div>
							<div class="flex items-baseline gap-2">
								<span class="text-xs text-white/35">{cat.percent.toFixed(0)}%</span>
								<span class="text-sm font-semibold tabular-nums text-white/80">
									R$ {fmt(cat.total)}
								</span>
							</div>
						</div>
						<div class="h-1 overflow-hidden rounded-full bg-white/8">
							<div
								class="h-full rounded-full transition-all {colors[i] ?? 'bg-white/30'}"
								style="width: {Math.min(cat.percent, 100).toFixed(1)}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.gastoMes === 0 && data.entradaMes === 0}
		<div class="flex flex-col items-center gap-3 py-10 text-center">
			<div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
				<span class="text-2xl opacity-30">◎</span>
			</div>
			<p class="text-sm font-medium text-white/30">Nenhuma movimentação este mês</p>
		</div>
	{/if}
</div>
