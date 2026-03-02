<script lang="ts">
	import {
		TrendingUpIcon,
		TrendingDownIcon,
		WalletIcon,
		ArrowRightIcon,
		TagIcon,
		CreditCardIcon,
		LayoutDashboardIcon
	} from 'lucide-svelte';

	// Static/placeholder data representing the dashboard state
	// This will be replaced with real API data when integration is completed

	const summaryCards = [
		{
			label: 'Patrimônio Total',
			value: 'R$ —',
			sub: 'Soma de todas as contas',
			icon: WalletIcon,
			color: 'text-friday-blue',
			bg: 'bg-friday-blue/10 border-friday-blue/20'
		},
		{
			label: 'Gastos do Mês',
			value: 'R$ —',
			sub: 'Saídas em março/2026',
			icon: TrendingDownIcon,
			color: 'text-failed',
			bg: 'bg-failed/10 border-failed/20'
		},
		{
			label: 'Receitas do Mês',
			value: 'R$ —',
			sub: 'Entradas em março/2026',
			icon: TrendingUpIcon,
			color: 'text-success',
			bg: 'bg-success/10 border-success/20'
		},
		{
			label: 'Saldo do Mês',
			value: 'R$ —',
			sub: 'Receitas − Gastos',
			icon: CreditCardIcon,
			color: 'text-friday-orange',
			bg: 'bg-friday-orange/10 border-friday-orange/20'
		}
	];

	const quickLinks = [
		{ label: 'Contas', icon: WalletIcon, route: '/friday/accounts', desc: 'Gerencie suas contas e cartões' },
		{ label: 'Atributos', icon: TagIcon, route: '/friday/transaction-attributes', desc: 'Tags, métodos de pagamento e moedas' }
	];
</script>

<div class="flex flex-col gap-6 text-white">
	<!-- Page header -->
	<div class="flex items-center gap-3">
		<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-friday-blue/10">
			<LayoutDashboardIcon size={18} class="text-friday-blue" />
		</div>
		<div>
			<h1 class="text-xl font-bold text-white">Dashboard</h1>
			<p class="text-sm text-white/40">Visão geral das suas finanças</p>
		</div>
	</div>

	<!-- Summary cards -->
	<div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
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

	<!-- Middle row: Quick links + Getting started -->
	<div class="grid grid-cols-3 gap-4">
		<!-- Quick links -->
		<div class="col-span-1 flex flex-col gap-3">
			<h2 class="text-sm font-semibold text-white/60 uppercase tracking-wider">Atalhos</h2>
			{#each quickLinks as link}
				<a
					href={link.route}
					class="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-all hover:border-friday-blue/30 hover:bg-friday-blue/5"
				>
					<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors group-hover:border-friday-blue/30 group-hover:bg-friday-blue/10">
						<link.icon size={16} class="text-white/50 transition-colors group-hover:text-friday-blue" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-medium text-white/80 group-hover:text-white">{link.label}</p>
						<p class="truncate text-xs text-white/30">{link.desc}</p>
					</div>
					<ArrowRightIcon size={14} class="shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-friday-blue" />
				</a>
			{/each}
		</div>

		<!-- Getting started / placeholder for charts -->
		<div class="col-span-2 rounded-xl border border-white/8 bg-white/[0.03] p-6">
			<h2 class="mb-4 text-sm font-semibold text-white/60 uppercase tracking-wider">
				Transações Recentes
			</h2>
			<div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
					<CreditCardIcon size={22} class="text-white/20" />
				</div>
				<p class="text-sm font-medium text-white/30">Nenhuma transação ainda</p>
				<p class="text-xs text-white/20">Adicione uma conta e registre sua primeira transação</p>
				<a
					href={'/friday/accounts'}
					class="mt-2 rounded-lg bg-friday-blue/15 px-4 py-2 text-xs font-semibold text-friday-blue transition hover:bg-friday-blue/25"
				>
					Ver Contas
				</a>
			</div>
		</div>
	</div>

	<!-- Bottom: Spending by category placeholder -->
	<div class="rounded-xl border border-white/8 bg-white/[0.03] p-6">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-sm font-semibold text-white/60 uppercase tracking-wider">Top Categorias — Março 2026</h2>
			<a
				href={'/friday/transaction-attributes/transaction-tags'}
				class="flex items-center gap-1 text-xs text-friday-blue transition hover:opacity-75"
			>
				Ver tags <ArrowRightIcon size={12} />
			</a>
		</div>

		<!-- Placeholder bars -->
		<div class="flex flex-col gap-3">
			{#each [
				{ label: 'Alimentação', percent: 0, color: 'bg-friday-blue' },
				{ label: 'Transporte', percent: 0, color: 'bg-friday-orange' },
				{ label: 'Saúde', percent: 0, color: 'bg-success' },
				{ label: 'Lazer', percent: 0, color: 'bg-friday-red' },
				{ label: 'Educação', percent: 0, color: 'bg-purple-500' }
			] as cat}
				<div class="flex items-center gap-4">
					<span class="w-28 shrink-0 text-sm text-white/50">{cat.label}</span>
					<div class="flex-1 overflow-hidden rounded-full bg-white/5 h-1.5">
						<div class="h-full rounded-full {cat.color}" style="width: {cat.percent}%"></div>
					</div>
					<span class="w-10 shrink-0 text-right text-xs text-white/25">—</span>
				</div>
			{/each}
		</div>

		<p class="mt-5 text-center text-xs text-white/20">
			Os dados aparecerão aqui conforme você registrar transações
		</p>
	</div>
</div>
