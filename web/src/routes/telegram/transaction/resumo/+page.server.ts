import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiSummary {
	total_income: string;
	total_expense: string;
	balance: string;
	transaction_count: number;
	by_category: {
		category_label: string;
		category_type: string;
		total: string;
		transaction_count: number;
		percent: string;
	}[];
}

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	const { token } = locals;

	const parentData = await parent();
	const accountId = url.searchParams.get('account_id') ?? parentData.accounts[0]?.id ?? '';

	if (!accountId) {
		return {
			mesAtual: '',
			mesAnterior: '',
			gastoMes: 0,
			entradaMes: 0,
			saldoMes: 0,
			gastoPrevMes: 0,
			deltaPercent: null,
			topCategorias: []
		};
	}

	const now = new Date();

	// Current month range
	const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const curEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

	// Previous month range
	const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);

	const fmt = (d: Date) => d.toISOString().slice(0, 10);

	const [curRes, prevRes] = await Promise.all([
		apiFetch(
			`/api/v1/finance/transactions/summary?account_id=${accountId}&date_start=${encodeURIComponent(fmt(curStart) + 'T00:00:00')}&date_end=${encodeURIComponent(fmt(curEnd) + 'T23:59:59')}`,
			token
		),
		apiFetch(
			`/api/v1/finance/transactions/summary?account_id=${accountId}&date_start=${encodeURIComponent(fmt(prevStart) + 'T00:00:00')}&date_end=${encodeURIComponent(fmt(prevEnd) + 'T23:59:59')}`,
			token
		)
	]);

	const emptySummary: ApiSummary = {
		total_income: '0',
		total_expense: '0',
		balance: '0',
		transaction_count: 0,
		by_category: []
	};

	const curSummary: ApiSummary = curRes.ok ? await curRes.json() : emptySummary;
	const prevSummary: ApiSummary = prevRes.ok ? await prevRes.json() : emptySummary;

	const gastoMes = parseFloat(curSummary.total_expense);
	const entradaMes = parseFloat(curSummary.total_income);
	const saldoMes = parseFloat(curSummary.balance);
	const gastoPrevMes = parseFloat(prevSummary.total_expense);

	const deltaPercent =
		gastoPrevMes > 0 ? ((gastoMes - gastoPrevMes) / gastoPrevMes) * 100 : null;

	// Top 5 categories by spending (outcome only)
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
		mesAtual,
		mesAnterior,
		gastoMes,
		entradaMes,
		saldoMes,
		gastoPrevMes,
		deltaPercent,
		topCategorias
	};
};
