import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiHolding {
	id: string;
	transaction_id: string;
	symbol: string;
	asset_type: 'cripto' | 'stock' | 'etf' | 'bond';
	quantity: string;
	price: string;
	created_at: string;
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

export const load: PageServerLoad = async ({ locals, params }) => {
	const { token } = locals;

	const [holdingsRes, tagsRes, pmRes, currenciesRes] = await Promise.all([
		apiFetch(`/api/v1/finance/holdings?account_id=${params.id}`, token),
		apiFetch('/api/v1/finance/tags?size=100', token),
		apiFetch('/api/v1/finance/payment-methods?size=100', token),
		apiFetch('/api/v1/finance/currencies?size=100', token)
	]);

	const holdings: ApiHolding[] = holdingsRes.ok ? await holdingsRes.json() : [];

	const tagsData = tagsRes.ok ? await tagsRes.json() : { items: [] };
	const investimentoTagId: string =
		(tagsData.items ?? []).find(
			(t: ApiTag) => t.active && t.category.label.toLowerCase() === 'investimento'
		)?.id ?? '';

	const pmData = pmRes.ok ? await pmRes.json() : { items: [] };
	const transferenciaPaymentMethodId: string =
		(pmData.items ?? []).find((pm: ApiPaymentMethod) =>
			pm.active &&
			(pm.label.toLowerCase().includes('transfer') )
		)?.id ?? '';

	const currenciesData = currenciesRes.ok ? await currenciesRes.json() : { items: [] };
	const availableCurrencies = (currenciesData.items ?? []).map(
		(c: { id: string; symbol: string; label: string }) => ({
			id: c.id,
			symbol: c.symbol,
			label: c.label
		})
	);
	const defaultCurrencyId: string =
		availableCurrencies.find((c: { symbol: string }) => c.symbol === 'BRL')?.id ??
		availableCurrencies[0]?.id ??
		'';

	return { holdings, availableCurrencies, defaultCurrencyId, investimentoTagId, transferenciaPaymentMethodId };
};

export const actions: Actions = {
	createAporte: async ({ request, locals, params }) => {
		const { token } = locals;
		const data = await request.formData();

		const tagId = data.get('tagId') as string;
		const paymentMethodId = data.get('paymentMethodId') as string;
		const currencyId = data.get('currencyId') as string;
		const value = data.get('value') as string;
		const description = data.get('description') as string;
		const dateTransaction = data.get('dateTransaction') as string;
		const symbol = (data.get('symbol') as string)?.trim().toUpperCase();
		const assetType = data.get('assetType') as string;
		const quantity = data.get('quantity') as string;
		const price = data.get('price') as string;

		if (!tagId || !paymentMethodId || !currencyId || !value || !symbol || !assetType || !quantity || !price) {
			return fail(400, { error: 'Todos os campos obrigatórios devem ser preenchidos' });
		}

		// 1. Criar a transação
		const txBody: Record<string, string | null> = {
			account_id: params.id,
			tag_id: tagId,
			payment_method_id: paymentMethodId,
			currency_id: currencyId,
			value
		};
		if (description?.trim()) txBody.description = description.trim();
		if (dateTransaction) txBody.date_transaction = new Date(dateTransaction).toISOString();

		const txRes = await apiFetch('/api/v1/finance/transactions', token, {
			method: 'POST',
			body: JSON.stringify(txBody)
		});

		if (!txRes.ok) {
			const err = await txRes.json().catch(() => ({}));
			return fail(txRes.status, { error: err.message ?? 'Erro ao criar transação' });
		}

		const tx = await txRes.json();

		// 2. Criar o holding vinculado à transação
		const holdingRes = await apiFetch('/api/v1/finance/holdings', token, {
			method: 'POST',
			body: JSON.stringify({
				transaction_id: tx.id,
				symbol,
				asset_type: assetType,
				quantity,
				price
			})
		});

		if (!holdingRes.ok) {
			const err = await holdingRes.json().catch(() => ({}));
			return fail(holdingRes.status, { error: err.message ?? 'Erro ao registrar ativo' });
		}

		return { success: true };
	}
};
