import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiTransaction {
	id: string;
	tag_id: string;
	value: string;
}

interface ApiTag {
	id: string;
	category: { id: string; label: string; type: 'outcome' | 'income' };
	subcategory: { id: string; label: string };
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

	const [tagsRes, curRes, prevRes] = await Promise.all([
		apiFetch('/api/v1/finance/tags?size=100', token),
		apiFetch(
			`/api/v1/finance/transactions?account_id=${accountId}&date_start=${encodeURIComponent(fmt(curStart) + 'T00:00:00')}&date_end=${encodeURIComponent(fmt(curEnd) + 'T23:59:59')}&page=1&size=200`,
			token
		),
		apiFetch(
			`/api/v1/finance/transactions?account_id=${accountId}&date_start=${encodeURIComponent(fmt(prevStart) + 'T00:00:00')}&date_end=${encodeURIComponent(fmt(prevEnd) + 'T23:59:59')}&page=1&size=200`,
			token
		)
	]);

	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const curData = curRes.ok ? await curRes.json() : { items: [] };
	const prevData = prevRes.ok ? await prevRes.json() : { items: [] };

	const tagsMap = new Map<string, ApiTag>();
	for (const tag of tagsData.items ?? []) tagsMap.set(tag.id, tag);

	function sumByType(items: ApiTransaction[], type: 'outcome' | 'income'): number {
		return items
			.filter((t) => tagsMap.get(t.tag_id)?.category.type === type)
			.reduce((acc, t) => acc + parseFloat(t.value), 0);
	}

	const curItems: ApiTransaction[] = curData.items ?? [];
	const prevItems: ApiTransaction[] = prevData.items ?? [];

	const gastoMes = sumByType(curItems, 'outcome');
	const entradaMes = sumByType(curItems, 'income');
	const saldoMes = entradaMes - gastoMes;
	const gastoPrevMes = sumByType(prevItems, 'outcome');

	const deltaPercent =
		gastoPrevMes > 0 ? ((gastoMes - gastoPrevMes) / gastoPrevMes) * 100 : null;

	// Top 5 categories by spending (outcome only)
	const catMap = new Map<string, { label: string; total: number }>();
	for (const t of curItems) {
		const tag = tagsMap.get(t.tag_id);
		if (!tag || tag.category.type !== 'outcome') continue;
		const catId = tag.category.id;
		const existing = catMap.get(catId);
		if (existing) {
			existing.total += parseFloat(t.value);
		} else {
			catMap.set(catId, { label: tag.category.label, total: parseFloat(t.value) });
		}
	}

	const topCategorias = [...catMap.values()]
		.sort((a, b) => b.total - a.total)
		.slice(0, 5)
		.map((c) => ({
			label: c.label,
			total: c.total,
			percent: gastoMes > 0 ? (c.total / gastoMes) * 100 : 0
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
