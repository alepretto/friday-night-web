import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

interface ApiTransaction {
	id: string;
	tag_id: string;
	payment_method_id: string;
	value: string;
	description: string | null;
	date_transaction: string;
}

interface ApiTag {
	id: string;
	category: { id: string; label: string; type: 'outcome' | 'income' };
	subcategory: { id: string; label: string };
}

interface ApiPaymentMethod {
	id: string;
	label: string;
}

export const load: PageLoad = async ({ fetch, url, parent }) => {
	const { token, accounts } = await parent();

	const accountId = url.searchParams.get('account_id') ?? accounts[0]?.id ?? '';

	if (!accountId) return { transactions: [] };

	const now = new Date();
	const dateStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
	const dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

	const headers = { Authorization: `Bearer ${token}` };

	const [transactionsRes, tagsRes, pmRes] = await Promise.all([
		fetch(
			`${API_BASE_URL}/api/v1/finance/transactions?account_id=${accountId}&date_start=${encodeURIComponent(dateStart + 'T00:00:00')}&date_end=${encodeURIComponent(dateEnd + 'T23:59:59')}&page=1&size=30`,
			{ headers }
		),
		fetch(`${API_BASE_URL}/api/v1/finance/tags?size=100`, { headers }),
		fetch(`${API_BASE_URL}/api/v1/finance/payment-methods?size=100`, { headers })
	]);

	const transactionsData = transactionsRes.ok ? await transactionsRes.json() : { items: [] };
	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const pmData = pmRes.ok ? await pmRes.json() : { items: [] };

	const tagsMap = new Map<string, ApiTag>();
	for (const tag of tagsData.items ?? []) tagsMap.set(tag.id, tag);

	const pmMap = new Map<string, ApiPaymentMethod>();
	for (const pm of pmData.items ?? []) pmMap.set(pm.id, pm);

	const transactions = (transactionsData.items ?? []).map((t: ApiTransaction) => {
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

	return { transactions };
};
