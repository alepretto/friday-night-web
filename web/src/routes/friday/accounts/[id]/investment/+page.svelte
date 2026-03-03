<script lang="ts">
	import { TrendingUpIcon, BarChart2Icon, PlusIcon } from 'lucide-svelte';
	import AporteModal from './AporteModal.svelte';
	import { showToast } from '$lib/toast.svelte';
	import { submitAction } from '$lib/utils/form-action';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const assetTypeLabel: Record<string, string> = {
		stock: 'Ação',
		etf: 'ETF',
		bond: 'Renda Fixa',
		cripto: 'Cripto'
	};

	const assetTypeColor: Record<string, string> = {
		stock: 'text-friday-blue bg-friday-blue/10',
		etf: 'text-friday-orange bg-friday-orange/10',
		bond: 'text-success bg-success/10',
		cripto: 'text-purple-400 bg-purple-400/10'
	};

	// Agrupa holdings por símbolo, somando quantidades e calculando preço médio ponderado
	const positions = $derived(() => {
		const map = new Map<
			string,
			{ symbol: string; assetType: string; totalQty: number; totalInvested: number; count: number }
		>();

		for (const h of data.holdings) {
			const key = `${h.symbol}:${h.asset_type}`;
			const qty = parseFloat(h.quantity);
			const price = parseFloat(h.price);
			const existing = map.get(key) ?? {
				symbol: h.symbol,
				assetType: h.asset_type,
				totalQty: 0,
				totalInvested: 0,
				count: 0
			};
			existing.totalQty += qty;
			existing.totalInvested += qty * price;
			existing.count++;
			map.set(key, existing);
		}

		return [...map.values()].sort((a, b) => b.totalInvested - a.totalInvested);
	});

	const totalInvestido = $derived(positions().reduce((s, p) => s + p.totalInvested, 0));

	const fmtBRL = (v: number) =>
		v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

	const fmtQty = (v: number) =>
		v % 1 === 0 ? v.toFixed(0) : v.toFixed(6).replace(/\.?0+$/, '');

	// Modal
	let modalOpen = $state(false);
	let saving = $state(false);

	async function handleSave(formData: {
		tagId: string;
		paymentMethodId: string;
		currencyId: string;
		value: string;
		symbol: string;
		assetType: string;
		quantity: string;
		price: string;
		description: string;
		dateTransaction: string;
	}) {
		saving = true;
		const { success, error } = await submitAction('createAporte', {
			tagId: formData.tagId,
			paymentMethodId: formData.paymentMethodId,
			currencyId: formData.currencyId,
			value: formData.value,
			symbol: formData.symbol,
			assetType: formData.assetType,
			quantity: formData.quantity,
			price: formData.price,
			description: formData.description,
			dateTransaction: formData.dateTransaction
		});
		saving = false;

		if (success) {
			modalOpen = false;
			showToast('Aporte registrado com sucesso!', 'success');
		} else {
			showToast(error ?? 'Erro ao registrar aporte', 'error');
		}
	}
</script>

<AporteModal
	open={modalOpen}
	{saving}
	tagId={data.investimentoTagId}
	paymentMethodId={data.transferenciaPaymentMethodId}
	currencies={data.availableCurrencies}
	defaultCurrencyId={data.defaultCurrencyId}
	onclose={() => (modalOpen = false)}
	onsave={handleSave}
/>

<div class="flex flex-col gap-6">
	<!-- Summary cards -->
	<div class="grid grid-cols-3 gap-4">
		<div class="rounded-xl border border-friday-blue/20 bg-friday-blue/10 p-5">
			<div class="mb-3 flex items-center justify-between">
				<span class="text-xs font-medium uppercase tracking-widest text-white/40">Total Investido</span>
				<div class="rounded-lg bg-friday-blue/10 p-1.5">
					<TrendingUpIcon size={16} class="text-friday-blue" />
				</div>
			</div>
			<p class="text-2xl font-bold text-friday-blue">{fmtBRL(totalInvestido)}</p>
			<p class="mt-1 text-xs text-white/30">Soma de todos os aportes</p>
		</div>

		<div class="rounded-xl border border-white/8 bg-white/[0.03] p-5">
			<div class="mb-3 flex items-center justify-between">
				<span class="text-xs font-medium uppercase tracking-widest text-white/40">Posições</span>
				<div class="rounded-lg bg-white/5 p-1.5">
					<BarChart2Icon size={16} class="text-white/30" />
				</div>
			</div>
			<p class="text-2xl font-bold text-white">{positions().length}</p>
			<p class="mt-1 text-xs text-white/30">
				{data.holdings.length} aporte{data.holdings.length !== 1 ? 's' : ''} registrado{data.holdings.length !== 1 ? 's' : ''}
			</p>
		</div>

		<div class="flex items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] p-5">
			<button
				onclick={() => (modalOpen = true)}
				class="flex cursor-pointer items-center gap-2 rounded-xl border border-friday-blue/20 bg-friday-blue/15 px-4 py-2 text-sm font-semibold text-friday-blue transition hover:bg-friday-blue/25"
			>
				<PlusIcon size={14} />
				Registrar aporte
			</button>
		</div>
	</div>

	<!-- Posições -->
	<div class="rounded-xl border border-white/8 bg-white/[0.03]">
		<div class="flex items-center justify-between border-b border-white/8 px-5 py-4">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-white/60">Posições</h2>
			{#if positions().length > 0}
				<button
					onclick={() => (modalOpen = true)}
					class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-friday-blue/20 bg-friday-blue/10 px-3 py-1 text-xs font-semibold text-friday-blue transition hover:bg-friday-blue/20"
				>
					<PlusIcon size={11} />
					Novo aporte
				</button>
			{/if}
		</div>

		{#if positions().length === 0}
			<div class="flex flex-col items-center justify-center gap-3 py-14 text-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
					<BarChart2Icon size={22} class="text-white/20" />
				</div>
				<p class="text-sm font-medium text-white/30">Nenhum ativo registrado</p>
				<p class="text-xs text-white/20">Registre seu primeiro aporte para ver as posições</p>
				<button
					onclick={() => (modalOpen = true)}
					class="mt-2 cursor-pointer rounded-lg bg-friday-blue/15 px-4 py-2 text-xs font-semibold text-friday-blue transition hover:bg-friday-blue/25"
				>
					Registrar aporte
				</button>
			</div>
		{:else}
			<div class="divide-y divide-white/5">
				{#each positions() as pos}
					<div class="flex items-center gap-4 px-5 py-4">
						<div class="w-24 shrink-0">
							<p class="font-mono text-sm font-bold text-white">{pos.symbol}</p>
							<span class="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold {assetTypeColor[pos.assetType] ?? 'text-white/40 bg-white/5'}">
								{assetTypeLabel[pos.assetType] ?? pos.assetType}
							</span>
						</div>
						<div class="flex-1">
							<p class="text-xs text-white/40">Qtd.</p>
							<p class="text-sm font-semibold text-white">{fmtQty(pos.totalQty)}</p>
						</div>
						<div class="flex-1">
							<p class="text-xs text-white/40">Preço médio</p>
							<p class="text-sm font-semibold text-white">
								{fmtBRL(pos.totalQty > 0 ? pos.totalInvested / pos.totalQty : 0)}
							</p>
						</div>
						<div class="text-right">
							<p class="text-xs text-white/40">Investido</p>
							<p class="text-sm font-bold text-friday-blue">{fmtBRL(pos.totalInvested)}</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Histórico de aportes -->
	{#if data.holdings.length > 0}
		<div class="rounded-xl border border-white/8 bg-white/[0.03]">
			<div class="border-b border-white/8 px-5 py-4">
				<h2 class="text-sm font-semibold uppercase tracking-wider text-white/60">Histórico de Aportes</h2>
			</div>
			<div class="divide-y divide-white/5">
				{#each data.holdings as h (h.id)}
					{@const qty = parseFloat(h.quantity)}
					{@const price = parseFloat(h.price)}
					<div class="flex items-center gap-4 px-5 py-3">
						<span class="w-16 shrink-0 font-mono text-xs font-bold text-white/70">{h.symbol}</span>
						<span class="flex-1 text-xs text-white/40">{fmtQty(qty)} × {fmtBRL(price)}</span>
						<span class="text-sm font-semibold text-friday-blue">{fmtBRL(qty * price)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
