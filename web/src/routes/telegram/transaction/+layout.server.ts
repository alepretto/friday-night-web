import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiAccount {
	id: string;
	type: string;
	financial_institution: { name: string } | null;
}

export const load: LayoutServerLoad = async ({ locals }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const res = await apiFetch('/api/v1/finance/accounts?size=100&status=activate', token);
	if (res.status === 401) throw redirect(303, '/login');

	const data = res.ok ? await res.json() : { items: [] };

	const accounts = (data.items ?? []).map((a: ApiAccount) => ({
		id: a.id,
		label: a.financial_institution?.name
			? `${a.financial_institution.name} (${a.type})`
			: a.type,
		type: a.type
	}));

	return { accounts };
};
