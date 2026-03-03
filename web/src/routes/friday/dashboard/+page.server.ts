import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals }) => {
	const { token } = locals;

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	const fmt = (d: Date) => d.toISOString().slice(0, 10);

	const [summaryRes, recentRes] = await Promise.all([
		apiFetch(
			`/api/v1/finance/transactions/summary?date_start=${encodeURIComponent(fmt(monthStart) + 'T00:00:00')}&date_end=${encodeURIComponent(fmt(monthEnd) + 'T23:59:59')}`,
			token
		),
		apiFetch('/api/v1/finance/transactions/recent?limit=10', token)
	]);

	const summary = summaryRes.ok
		? await summaryRes.json()
		: { total_income: '0', total_expense: '0', balance: '0', transaction_count: 0, by_category: [] };

	const recentTransactions = recentRes.ok ? await recentRes.json() : [];

	const topCategories = (summary.by_category ?? [])
		.filter((c: { category_type: string }) => c.category_type === 'outcome')
		.sort((a: { total: string }, b: { total: string }) => parseFloat(b.total) - parseFloat(a.total))
		.slice(0, 5)
		.map((c: { category_label: string; total: string; percent: string }) => ({
			label: c.category_label,
			total: parseFloat(c.total),
			percent: parseFloat(c.percent)
		}));

	return {
		summary: {
			totalExpense: parseFloat(summary.total_expense),
			totalIncome: parseFloat(summary.total_income),
			balance: parseFloat(summary.balance)
		},
		topCategories,
		recentTransactions: (recentTransactions as {
			id: string;
			value: string;
			description: string | null;
			date_transaction: string | null;
			account_id: string;
			category_label: string;
			category_type: string;
			subcategory_label: string;
		}[]).map((t) => ({
			id: t.id,
			value: parseFloat(t.value),
			description: t.description,
			dateTransaction: t.date_transaction,
			accountId: t.account_id,
			categoryLabel: t.category_label,
			categoryType: t.category_type,
			subcategoryLabel: t.subcategory_label
		}))
	};
};
