import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';
import type { Transaction } from '$lib/types/transaction';

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

async function loadData(
	token: string,
	accountId: string,
	currentPage: string,
	dateStart: string | null,
	dateEnd: string | null
) {
	let transactionsUrl = `/finance/transactions?account_id=${accountId}&page=${currentPage}&size=50`;
	if (dateStart) transactionsUrl += `&date_start=${encodeURIComponent(dateStart + 'T00:00:00')}`;
	if (dateEnd) transactionsUrl += `&date_end=${encodeURIComponent(dateEnd + 'T23:59:59')}`;

	const [transactionsRes, tagsRes, pmRes] = await Promise.all([
		apiFetch(transactionsUrl, token),
		apiFetch('/finance/tags?size=200', token),
		apiFetch('/finance/payment-methods?size=200', token)
	]);

	if (transactionsRes.status === 401) return { unauthorized: true as const };

	const transactionsData = await transactionsRes.json();
	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const pmData = pmRes.ok ? await pmRes.json() : { items: [] };

	const tagsMap = new Map<string, ApiTag>();
	for (const tag of tagsData.items ?? []) {
		tagsMap.set(tag.id, tag);
	}

	const pmMap = new Map<string, ApiPaymentMethod>();
	for (const pm of pmData.items ?? []) {
		pmMap.set(pm.id, pm);
	}

	const transactions: Transaction[] = (transactionsData.items ?? []).map(
		(t: ApiTransaction) => {
			const tag = tagsMap.get(t.tag_id);
			const pm = pmMap.get(t.payment_method_id);
			return {
				id: t.id,
				dateTransaction: t.date_transaction,
				category: tag?.category.label ?? 'Desconhecida',
				subcategory: tag?.subcategory.label ?? '-',
				paymentMethod: pm?.label ?? '-',
				type: tag?.category.type ?? 'outcome',
				value: parseFloat(t.value),
				description: t.description
			};
		}
	);

	return {
		transactions,
		pagination: {
			page: (transactionsData.page as number) ?? 1,
			pages: (transactionsData.pages as number) ?? 1,
			total: (transactionsData.total as number) ?? 0
		}
	};
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const currentPage = url.searchParams.get('page') ?? '1';
	const dateStart = url.searchParams.get('date_start');
	const dateEnd = url.searchParams.get('date_end');

	return {
		streamed: loadData(token, params.id, currentPage, dateStart, dateEnd)
	};
};
