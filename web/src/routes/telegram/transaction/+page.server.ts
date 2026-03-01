import { fail, redirect } from '@sveltejs/kit';
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

interface ApiAccount {
	id: string;
	type: string;
	subtype: string | null;
	financial_institution: { name: string } | null;
}

export const load: PageServerLoad = async ({ locals }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const [tagsRes, pmRes, currenciesRes, accountsRes] = await Promise.all([
		apiFetch('/api/v1/finance/tags?size=100', token),
		apiFetch('/api/v1/finance/payment-methods?size=100', token),
		apiFetch('/api/v1/finance/currencies?size=100', token),
		apiFetch('/api/v1/finance/accounts?size=100', token)
	]);

	if (tagsRes.status === 401) throw redirect(303, '/login');

	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const pmData = pmRes.ok ? await pmRes.json() : { items: [] };
	const currenciesData = currenciesRes.ok ? await currenciesRes.json() : { items: [] };
	const accountsData = accountsRes.ok ? await accountsRes.json() : { items: [] };

	const activeTags = (tagsData.items ?? [])
		.filter((tag: ApiTag) => tag.active)
		.map((tag: ApiTag) => ({
			id: tag.id,
			categoryId: tag.category.id,
			categoryLabel: tag.category.label,
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

	const accounts = (accountsData.items ?? []).map((a: ApiAccount) => ({
		id: a.id,
		label: a.financial_institution?.name
			? `${a.financial_institution.name} (${a.type})`
			: a.type
	}));

	const defaultCurrencyId =
		currencies.find((c: { id: string; symbol: string; label: string }) => c.symbol === 'BRL')?.id ??
		currencies[0]?.id ??
		'';

	return { activeTags, activePaymentMethods, currencies, accounts, defaultCurrencyId };
};

export const actions: Actions = {
	createTransaction: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const accountId = data.get('accountId') as string;
		const tagId = data.get('tagId') as string;
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
	}
};
