<script lang="ts">
	import { TagIcon, CreditCardIcon, CoinsIcon, ArrowRightIcon } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="grid grid-cols-3 gap-4">
	<!-- Tags -->
	<a
		href="/friday/transaction-attributes/transaction-tags"
		class="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-friday-blue/30 hover:bg-friday-blue/5"
	>
		<div class="flex items-start justify-between">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-friday-blue/20 bg-friday-blue/10">
				<TagIcon size={18} class="text-friday-blue" />
			</div>
			<ArrowRightIcon size={14} class="mt-1 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-friday-blue" />
		</div>
		<div>
			<p class="text-xs font-medium uppercase tracking-widest text-white/40">Financial Tags</p>
			<p class="mt-2 text-2xl font-bold text-friday-blue">
				{data.stats.tags.active}
				<span class="text-base font-normal text-white/30">ativas</span>
			</p>
			<p class="mt-1 text-xs text-white/30">{data.stats.tags.total} no total</p>
		</div>
		<span class="text-xs text-friday-blue">Ver tags →</span>
	</a>

	<!-- Payment Methods -->
	<a
		href="/friday/transaction-attributes/payment-methods"
		class="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-friday-orange/30 hover:bg-friday-orange/5"
	>
		<div class="flex items-start justify-between">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-friday-orange/20 bg-friday-orange/10">
				<CreditCardIcon size={18} class="text-friday-orange" />
			</div>
			<ArrowRightIcon size={14} class="mt-1 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-friday-orange" />
		</div>
		<div>
			<p class="text-xs font-medium uppercase tracking-widest text-white/40">Payment Methods</p>
			<p class="mt-2 text-2xl font-bold text-friday-orange">
				{data.stats.paymentMethods.active}
				<span class="text-base font-normal text-white/30">ativos</span>
			</p>
			<p class="mt-1 text-xs text-white/30">{data.stats.paymentMethods.total} no total</p>
		</div>
		<span class="text-xs text-friday-orange">Ver métodos →</span>
	</a>

	<!-- Currencies -->
	<a
		href="/friday/transaction-attributes/currencies"
		class="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-success/30 hover:bg-success/5"
	>
		<div class="flex items-start justify-between">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl border border-success/20 bg-success/10">
				<CoinsIcon size={18} class="text-success" />
			</div>
			<ArrowRightIcon size={14} class="mt-1 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-success" />
		</div>
		<div>
			<p class="text-xs font-medium uppercase tracking-widest text-white/40">Currencies</p>
			<p class="mt-2 text-2xl font-bold text-success">
				{data.stats.currencies.total}
				<span class="text-base font-normal text-white/30">cadastradas</span>
			</p>
			<p class="mt-1 text-xs text-white/30">Fiat e criptomoedas</p>
		</div>
		<span class="text-xs text-success">Ver moedas →</span>
	</a>
</div>
