import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

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

export const load: PageLoad = async ({ fetch, url, parent }) => {
	const { token, accounts } = await parent();

	const selectedAccountId = url.searchParams.get('account_id') ?? accounts[0]?.id ?? '';

	const headers = { Authorization: `Bearer ${token}` };

	const [tagsRes, pmRes, currenciesRes, cardsRes] = await Promise.all([
		fetch(`${API_BASE_URL}/api/v1/finance/tags?size=100`, { headers }),
		fetch(`${API_BASE_URL}/api/v1/finance/payment-methods?size=100`, { headers }),
		fetch(`${API_BASE_URL}/api/v1/finance/currencies?size=100`, { headers }),
		selectedAccountId
			? fetch(`${API_BASE_URL}/api/v1/finance/cards?account_id=${selectedAccountId}&size=100`, {
					headers
				})
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
		currencies.find((c: { symbol: string }) => c.symbol === 'BRL')?.id ??
		currencies[0]?.id ??
		'';

	return { activeTags, activePaymentMethods, currencies, cards, defaultCurrencyId, selectedAccountId };
};
