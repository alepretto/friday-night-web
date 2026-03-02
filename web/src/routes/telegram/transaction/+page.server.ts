import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

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

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	const { token } = locals;

	const parentData = await parent();
	const selectedAccountId =
		url.searchParams.get('account_id') ?? parentData.accounts[0]?.id ?? '';

	const [tagsRes, pmRes, currenciesRes, cardsRes] = await Promise.all([
		apiFetch('/api/v1/finance/tags?size=100', token),
		apiFetch('/api/v1/finance/payment-methods?size=100', token),
		apiFetch('/api/v1/finance/currencies?size=100', token),
		selectedAccountId
			? apiFetch(`/api/v1/finance/cards?account_id=${selectedAccountId}&size=100`, token)
			: Promise.resolve(new Response(JSON.stringify({ items: [] })))
	]);

	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const pmData = pmRes.ok ? await pmRes.json() : { items: [] };
	const currenciesData = currenciesRes.ok ? await currenciesRes.json() : { items: [] };
	const cardsData = cardsRes.ok ? await cardsRes.json() : { items: [] };

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

	const activePaymentMethods = (pmData.items ?? [])
		.filter((pm: ApiPaymentMethod) => pm.active)
		.map((pm: ApiPaymentMethod) => ({ id: pm.id, label: pm.label }));

	const currencies = (currenciesData.items ?? []).map((c: ApiCurrency) => ({
		id: c.id,
		symbol: c.symbol,
		label: c.label
	}));

	const cards = (cardsData.items ?? []).map((c: ApiCard) => ({
		id: c.id,
		label: c.label
	}));

	const defaultCurrencyId =
		currencies.find((c: { id: string; symbol: string }) => c.symbol === 'BRL')?.id ??
		currencies[0]?.id ??
		'';

	return { activeTags, activePaymentMethods, currencies, cards, defaultCurrencyId, selectedAccountId };
};

async function getOrCreateCategory(token: string, label: string, type: string): Promise<string> {
	const createRes = await apiFetch('/api/v1/finance/categories', token, {
		method: 'POST',
		body: JSON.stringify({ label, type })
	});

	if (createRes.ok) {
		const cat = await createRes.json();
		return cat.id as string;
	}

	if (createRes.status === 409) {
		const listRes = await apiFetch('/api/v1/finance/categories?size=200', token);
		if (!listRes.ok) throw new Error('Erro ao buscar categorias');
		const listData = await listRes.json();
		const found = (listData.items ?? []).find(
			(c: { label: string; type: string; id: string }) =>
				c.label.toLowerCase() === label.toLowerCase() && c.type === type
		);
		if (!found) throw new Error(`Categoria '${label}' não encontrada`);
		return found.id as string;
	}

	const err = await createRes.json().catch(() => ({}));
	throw new Error((err as { message?: string }).message ?? 'Erro ao criar categoria');
}

export const actions: Actions = {
	createTransaction: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const accountId = data.get('accountId') as string;
		const tagId = data.get('tagId') as string;
		const cardId = data.get('cardId') as string;
		const paymentMethodId = data.get('paymentMethodId') as string;
		const currencyId = data.get('currencyId') as string;
		const value = data.get('value') as string;
		const description = data.get('description') as string;
		const dateTransaction = data.get('dateTransaction') as string;

		if (!accountId || !tagId || !paymentMethodId || !currencyId || !value) {
			return fail(400, { error: 'Campos obrigatórios não preenchidos' });
		}

		const body: Record<string, string | null> = {
			account_id: accountId,
			tag_id: tagId,
			payment_method_id: paymentMethodId,
			currency_id: currencyId,
			value
		};

		if (cardId) body.card_id = cardId;
		if (description?.trim()) body.description = description.trim();
		if (dateTransaction) body.date_transaction = new Date(dateTransaction).toISOString();

		const res = await apiFetch('/api/v1/finance/transactions', token, {
			method: 'POST',
			body: JSON.stringify(body)
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao criar transação' });
		}

		return { success: true };
	},

	createTag: async ({ request, locals }) => {
		const { token } = locals;
		if (!token) return fail(401, { tagError: 'Não autenticado' });

		const data = await request.formData();

		const categoryLabel = (data.get('categoryLabel') as string)?.trim();
		const subcategoryLabel = (data.get('subcategoryLabel') as string)?.trim();
		const tagType = data.get('tagType') as string;

		if (!categoryLabel || !subcategoryLabel || !tagType) {
			return fail(400, { tagError: 'Preencha categoria, subcategoria e tipo' });
		}

		try {
			const categoryId = await getOrCreateCategory(token, categoryLabel, tagType);

			const subRes = await apiFetch('/api/v1/finance/subcategories', token, {
				method: 'POST',
				body: JSON.stringify({ category_id: categoryId, label: subcategoryLabel })
			});
			if (!subRes.ok) {
				const err = await subRes.json().catch(() => ({}));
				return fail(subRes.status, {
					tagError: (err as { message?: string }).message ?? 'Erro ao criar subcategoria'
				});
			}
			const sub = await subRes.json();

			const tagRes = await apiFetch('/api/v1/finance/tags', token, {
				method: 'POST',
				body: JSON.stringify({ category_id: categoryId, subcategory_id: sub.id, active: true })
			});
			if (!tagRes.ok) {
				const err = await tagRes.json().catch(() => ({}));
				return fail(tagRes.status, {
					tagError: (err as { message?: string }).message ?? 'Erro ao criar tag'
				});
			}

			return { tagCreated: true };
		} catch (e) {
			return fail(400, { tagError: e instanceof Error ? e.message : 'Erro ao criar tag' });
		}
	}
};
