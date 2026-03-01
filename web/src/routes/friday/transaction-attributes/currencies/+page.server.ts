import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiCurrency {
	id: string;
	label: string;
	symbol: string;
	type: 'fiat' | 'cripto';
}

async function loadData(token: string, page: string) {
	const res = await apiFetch(`/finance/currencies?page=${page}&size=10`, token);

	if (res.status === 401) return { unauthorized: true as const };

	const data = await res.json();

	const currencies = (data.items ?? []).map((c: ApiCurrency) => ({
		id: c.id,
		label: c.label,
		symbol: c.symbol,
		type: c.type === 'cripto' ? 'crypto' : c.type
	}));

	return {
		currencies,
		pagination: {
			page: (data.page as number) ?? 1,
			pages: (data.pages as number) ?? 1,
			total: (data.total as number) ?? 0
		}
	};
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const page = url.searchParams.get('page') ?? '1';

	return {
		streamed: loadData(token, page)
	};
};

export const actions: Actions = {
	createCurrency: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const label = ((data.get('label') as string) ?? '').trim();
		const symbol = ((data.get('symbol') as string) ?? '').trim();
		const type = data.get('type') as string;

		if (!label || !symbol || !type) {
			return fail(400, { error: 'Todos os campos são obrigatórios' });
		}

		const apiType = type === 'crypto' ? 'cripto' : type;

		const res = await apiFetch('/finance/currencies', token, {
			method: 'POST',
			body: JSON.stringify({ label, symbol, type: apiType })
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao criar moeda' });
		}

		return { success: true };
	},

	updateCurrency: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const currencyId = data.get('currencyId') as string;
		const label = ((data.get('label') as string) ?? '').trim();
		const symbol = ((data.get('symbol') as string) ?? '').trim();
		const type = data.get('type') as string;

		if (!currencyId || !label || !symbol || !type) {
			return fail(400, { error: 'Todos os campos são obrigatórios' });
		}

		const apiType = type === 'crypto' ? 'cripto' : type;

		const res = await apiFetch(`/finance/currencies/${currencyId}`, token, {
			method: 'PATCH',
			body: JSON.stringify({ label, symbol, type: apiType })
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao atualizar moeda' });
		}

		return { success: true };
	}
};
