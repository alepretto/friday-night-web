<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Filler,
		Tooltip
	} from 'chart.js';
	import { TrendingUpIcon, BarChart2Icon } from 'lucide-svelte';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

	let canvas = $state<HTMLCanvasElement | null>(null);
	let chart: Chart | null = null;

	const summaryCards = [
		{ label: 'Total Investido', value: 'R$ —', sub: 'Soma de todos os ativos', color: 'text-friday-blue', bg: 'bg-friday-blue/10 border-friday-blue/20', icon: TrendingUpIcon },
		{ label: 'Retorno Total', value: '—', sub: 'Desde o início', color: 'text-success', bg: 'bg-success/10 border-success/20', icon: TrendingUpIcon },
		{ label: 'Retorno do Mês', value: '—', sub: 'Variação mensal', color: 'text-friday-orange', bg: 'bg-friday-orange/10 border-friday-orange/20', icon: TrendingUpIcon }
	];

	// Placeholder: últimos 30 dias
	const labels = Array.from({ length: 30 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (29 - i));
		return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
	});

	const placeholderData = Array.from({ length: 30 }, (_, i) => {
		return parseFloat((100 + i * 0.5 + (Math.random() - 0.4) * 3).toFixed(2));
	});

	onMount(() => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const gradient = ctx.createLinearGradient(0, 0, 0, 200);
		gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
		gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						data: placeholderData,
						borderColor: '#3b82f6',
						borderWidth: 2,
						fill: true,
						backgroundColor: gradient,
						pointRadius: 0,
						tension: 0.4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) => `R$ ${(ctx.parsed.y ?? 0).toFixed(2)}`
						}
					}
				},
				scales: {
					x: {
						grid: { color: 'rgba(255,255,255,0.05)' },
						ticks: { color: 'rgba(255,255,255,0.3)', maxTicksLimit: 6, font: { size: 11 } }
					},
					y: {
						grid: { color: 'rgba(255,255,255,0.05)' },
						ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } }
					}
				}
			}
		});
	});

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Summary cards -->
	<div class="grid grid-cols-3 gap-4">
		{#each summaryCards as card}
			<div class="rounded-xl border {card.bg} p-5">
				<div class="mb-3 flex items-center justify-between">
					<span class="text-xs font-medium uppercase tracking-widest text-white/40">{card.label}</span>
					<div class="rounded-lg p-1.5 {card.bg}">
						<card.icon size={16} class={card.color} />
					</div>
				</div>
				<p class="text-2xl font-bold {card.color}">{card.value}</p>
				<p class="mt-1 text-xs text-white/30">{card.sub}</p>
			</div>
		{/each}
	</div>

	<!-- Gráfico de retorno diário -->
	<div class="rounded-xl border border-white/8 bg-white/[0.03] p-6">
		<h2 class="mb-1 text-sm font-semibold uppercase tracking-wider text-white/60">Retorno Diário</h2>
		<p class="mb-4 text-xs text-white/25">Dados placeholder — integração com API em breve</p>
		<div class="h-48">
			<canvas bind:this={canvas} class="h-full w-full"></canvas>
		</div>
	</div>

	<!-- Ativos (holdings) -->
	<div class="rounded-xl border border-white/8 bg-white/[0.03] p-6">
		<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">Ativos</h2>
		<div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
				<BarChart2Icon size={22} class="text-white/20" />
			</div>
			<p class="text-sm font-medium text-white/30">Nenhum ativo registrado</p>
			<p class="text-xs text-white/20">Registre transações de investimento para ver seus ativos aqui</p>
		</div>
	</div>
</div>
