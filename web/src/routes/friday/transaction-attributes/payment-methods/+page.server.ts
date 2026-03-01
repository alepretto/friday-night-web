import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiPaymentMethod {
	id: string;
	label: string;
	active: boolean;
}

async function loadData(token: string, page: string) {
	const res = await apiFetch(`/finance/payment-methods?page=${page}&size=20`, token);

	if (res.status === 401) throw redirect(303, '/login');

	const data = await res.json();

	return {
		methods: (data.items ?? []) as ApiPaymentMethod[],
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
	createPaymentMethod: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const label = ((data.get('label') as string) ?? '').trim();

		if (!label) {
			return fail(400, { error: 'Descrição é obrigatória' });
		}

		const res = await apiFetch('/finance/payment-methods', token, {
			method: 'POST',
			body: JSON.stringify({ label, active: true })
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao criar método de pagamento' });
		}

		return { success: true };
	},

	togglePaymentMethod: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();
		const methodId = data.get('methodId') as string;
		const active = data.get('active') === 'true';

		const endpoint = active
			? `/finance/payment-methods/${methodId}/deactivate`
			: `/finance/payment-methods/${methodId}/activate`;

		const res = await apiFetch(endpoint, token, { method: 'PATCH' });

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao atualizar método de pagamento' });
		}

		return { success: true };
	}
};
