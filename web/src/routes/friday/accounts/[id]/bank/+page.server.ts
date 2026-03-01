import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';
import type { Transaction } from '$lib/types/transaction';
import type { CardInfo } from '$lib/types/account';

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

interface ApiCard {
	id: string;
	label: string;
	flag: 'mastercard' | 'visa';
	close_day: number;
	due_day: number;
	limit: string;
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

	const [transactionsRes, tagsRes, pmRes, cardsRes] = await Promise.all([
		apiFetch(transactionsUrl, token),
		apiFetch('/finance/tags?size=200', token),
		apiFetch('/finance/payment-methods?size=200', token),
		apiFetch(`/finance/cards?account_id=${accountId}&size=100`, token)
	]);

	if (transactionsRes.status === 401) return { unauthorized: true as const };

	const transactionsData = await transactionsRes.json();
	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const pmData = pmRes.ok ? await pmRes.json() : { items: [] };
	const cardsData = cardsRes.ok ? await cardsRes.json() : { items: [] };

	const tagsMap = new Map<string, ApiTag>();
	for (const tag of tagsData.items ?? []) tagsMap.set(tag.id, tag);

	const pmMap = new Map<string, ApiPaymentMethod>();
	for (const pm of pmData.items ?? []) pmMap.set(pm.id, pm);

	const transactions: Transaction[] = (transactionsData.items ?? []).map((t: ApiTransaction) => {
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
	});

	const cards: CardInfo[] = (cardsData.items ?? []).map((c: ApiCard) => ({
		id: c.id,
		label: c.label,
		flag: c.flag,
		close_day: c.close_day,
		due_day: c.due_day,
		limit: parseFloat(c.limit)
	}));

	return {
		transactions,
		cards,
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

export const actions: Actions = {
	createCard: async ({ request, locals, params }) => {
		const { token } = locals;
		const data = await request.formData();

		const label = data.get('label') as string;
		const flag = data.get('flag') as string;
		const close_day = parseInt(data.get('close_day') as string);
		const due_day = parseInt(data.get('due_day') as string);
		const limit = parseFloat(data.get('limit') as string);

		if (!label?.trim() || !flag || isNaN(close_day) || isNaN(due_day) || isNaN(limit)) {
			return fail(400, { error: 'Todos os campos são obrigatórios' });
		}

		const res = await apiFetch('/finance/cards', token, {
			method: 'POST',
			body: JSON.stringify({
				account_id: params.id,
				label: label.trim(),
				flag,
				close_day,
				due_day,
				limit
			})
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao criar cartão' });
		}

		return { success: true };
	},

	deleteCard: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();
		const cardId = data.get('cardId') as string;

		if (!cardId) return fail(400, { error: 'ID do cartão não informado' });

		const res = await apiFetch(`/finance/cards/${cardId}`, token, { method: 'DELETE' });

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao deletar cartão' });
		}

		return { success: true };
	}
};
