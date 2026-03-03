import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

interface ApiAccount {
	id: string;
	type: string;
	subtype: string | null;
	financial_institution_id: string;
}

interface ApiInstitution {
	id: string;
	name: string;
}

interface ApiTag {
	id: string;
	active: boolean;
	category: { id: string; label: string; type: 'outcome' | 'income' };
	subcategory: { id: string; label: string };
}

interface ApiPaymentMethod {
	id: string;
	label: string;
	active: boolean;
}

interface ApiCurrency {
	id: string;
	symbol: string;
	label: string;
}

interface ApiCard {
	id: string;
	label: string;
}

interface ApiTransactionRaw {
	id: string;
	tag_id: string;
	payment_method_id: string;
	value: string;
	description: string | null;
	date_transaction: string;
}

interface ApiCategorySummary {
	category_label: string;
	category_type: string;
	total: string;
	transaction_count: number;
	percent: string;
}

interface ApiSummary {
	total_income: string;
	total_expense: string;
	balance: string;
	transaction_count: number;
	by_category: ApiCategorySummary[];
}

export const ssr = false;

export const load: LayoutLoad = async ({ fetch, url, parent }) => {
	const { token } = await parent();
	if (!token) throw redirect(303, '/telegram');

	const headers = { Authorization: `Bearer ${token}` };
	const accountId = url.searchParams.get('account_id') ?? '';

	const now = new Date();
	const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const curEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const fmt = (d: Date) => d.toISOString().slice(0, 10);

	const dateStart = encodeURIComponent(fmt(curStart) + 'T00:00:00');
	const dateEnd = encodeURIComponent(fmt(curEnd) + 'T23:59:59');
	const prevDateStart = encodeURIComponent(fmt(prevStart) + 'T00:00:00');
	const prevDateEnd = encodeURIComponent(fmt(new Date(now.getFullYear(), now.getMonth(), 0)) + 'T23:59:59');

	const emptySummary: ApiSummary = {
		total_income: '0',
		total_expense: '0',
		balance: '0',
		transaction_count: 0,
		by_category: []
	};
	const noItems = () => new Response(JSON.stringify({ items: [] }));
	const noSummary = () => new Response(JSON.stringify(emptySummary));

	const [
		accountsRes,
		institutionsRes,
		tagsRes,
		pmRes,
		currenciesRes,
		cardsRes,
		transactionsRes,
		curSummaryRes,
		prevSummaryRes
	] = await Promise.all([
		fetch(`${API_BASE_URL}/api/v1/finance/accounts?size=100&status=activate`, { headers }),
		fetch(`${API_BASE_URL}/api/v1/finance/financial-institutions?size=100`, { headers }),
		fetch(`${API_BASE_URL}/api/v1/finance/tags?size=100`, { headers }),
		fetch(`${API_BASE_URL}/api/v1/finance/payment-methods?size=100`, { headers }),
		fetch(`${API_BASE_URL}/api/v1/finance/currencies?size=100`, { headers }),
		accountId
			? fetch(`${API_BASE_URL}/api/v1/finance/cards?account_id=${accountId}&size=100`, { headers })
			: Promise.resolve(noItems()),
		accountId
			? fetch(
					`${API_BASE_URL}/api/v1/finance/transactions?account_id=${accountId}&date_start=${dateStart}&date_end=${dateEnd}&page=1&size=30`,
					{ headers }
				)
			: Promise.resolve(noItems()),
		accountId
			? fetch(
					`${API_BASE_URL}/api/v1/finance/transactions/summary?account_id=${accountId}&date_start=${dateStart}&date_end=${dateEnd}`,
					{ headers }
				)
			: Promise.resolve(noSummary()),
		accountId
			? fetch(
					`${API_BASE_URL}/api/v1/finance/transactions/summary?account_id=${accountId}&date_start=${prevDateStart}&date_end=${prevDateEnd}`,
					{ headers }
				)
			: Promise.resolve(noSummary())
	]);

	// — Accounts —
	const accountsData = accountsRes.ok ? await accountsRes.json() : { items: [] };
	const institutionsData = institutionsRes.ok ? await institutionsRes.json() : { items: [] };
	const institutionMap = new Map<string, string>(
		(institutionsData.items ?? []).map((inst: ApiInstitution) => [inst.id, inst.name])
	);
	const accounts = (accountsData.items ?? []).map((a: ApiAccount) => {
		const instName = institutionMap.get(a.financial_institution_id);
		const base = instName ?? a.type;
		return { id: a.id, label: a.subtype ? `${base} (${a.subtype})` : base, type: a.type };
	});
	const selectedAccountId = accountId || accounts[0]?.id || '';

	// — Tags —
	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const activeTags = (tagsData.items ?? [])
		.filter((tag: ApiTag) => tag.active)
		.map((tag: ApiTag) => ({
			id: tag.id,
			categoryId: tag.category.id,
			categoryLabel: tag.category.label,
			subcategoryId: tag.subcategory.id,
			subcategoryLabel: tag.subcategory.label,
			type: tag.category.type as 'outcome' | 'income'
		}));

	// — Payment methods —
	const pmData = pmRes.ok ? await pmRes.json() : { items: [] };
	const activePaymentMethods = (pmData.items ?? [])
		.filter((pm: ApiPaymentMethod) => pm.active)
		.map((pm: ApiPaymentMethod) => ({ id: pm.id, label: pm.label }));

	// — Currencies —
	const currenciesData = currenciesRes.ok ? await currenciesRes.json() : { items: [] };
	const currencies = (currenciesData.items ?? []).map((c: ApiCurrency) => ({
		id: c.id,
		symbol: c.symbol,
		label: c.label
	}));
	const defaultCurrencyId =
		currencies.find((c: { symbol: string }) => c.symbol === 'BRL')?.id ?? currencies[0]?.id ?? '';

	// — Cards —
	const cardsData = cardsRes.ok ? await cardsRes.json() : { items: [] };
	const cards = (cardsData.items ?? []).map((c: ApiCard) => ({ id: c.id, label: c.label }));

	// — Transactions (recentes tab) —
	const txData = transactionsRes.ok ? await transactionsRes.json() : { items: [] };
	const tagsMap = new Map<string, ApiTag>();
	for (const tag of tagsData.items ?? []) tagsMap.set(tag.id, tag);
	const pmMap = new Map<string, ApiPaymentMethod>();
	for (const pm of pmData.items ?? []) pmMap.set(pm.id, pm);
	const transactions = (txData.items ?? []).map((t: ApiTransactionRaw) => {
		const tag = tagsMap.get(t.tag_id);
		const pm = pmMap.get(t.payment_method_id);
		return {
			id: t.id,
			date: t.date_transaction,
			type: (tag?.category.type ?? 'outcome') as 'outcome' | 'income',
			value: parseFloat(t.value),
			category: tag?.category.label ?? '-',
			subcategory: tag?.subcategory.label ?? '-',
			paymentMethod: pm?.label ?? '-',
			description: t.description ?? null
		};
	});

	// — Summary (resumo tab) —
	const curSummary: ApiSummary = curSummaryRes.ok ? await curSummaryRes.json() : emptySummary;
	const prevSummary: ApiSummary = prevSummaryRes.ok ? await prevSummaryRes.json() : emptySummary;

	const gastoMes = parseFloat(curSummary.total_expense);
	const entradaMes = parseFloat(curSummary.total_income);
	const saldoMes = parseFloat(curSummary.balance);
	const gastoPrevMes = parseFloat(prevSummary.total_expense);
	const deltaPercent =
		gastoPrevMes > 0 ? ((gastoMes - gastoPrevMes) / gastoPrevMes) * 100 : null;
	const topCategorias = curSummary.by_category
		.filter((c) => c.category_type === 'outcome')
		.sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
		.slice(0, 5)
		.map((c) => ({
			label: c.category_label,
			total: parseFloat(c.total),
			percent: parseFloat(c.percent)
		}));
	const mesAtual = curStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
	const mesAnterior = prevStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

	return {
		accounts,
		selectedAccountId,
		activeTags,
		activePaymentMethods,
		currencies,
		defaultCurrencyId,
		cards,
		transactions,
		gastoMes,
		entradaMes,
		saldoMes,
		gastoPrevMes,
		deltaPercent,
		topCategorias,
		mesAtual,
		mesAnterior
	};
};
