import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiAccount {
	id: string;
	type: string;
	subtype: string | null;
	financial_institution_id: string;
}

interface ApiInstitution {
	id: string;
	name: string;
}

export const load: LayoutServerLoad = async ({ locals }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const [accountsRes, institutionsRes] = await Promise.all([
		apiFetch('/api/v1/finance/accounts?size=100&status=activate', token),
		apiFetch('/api/v1/finance/financial-institutions?size=100', token)
	]);

	if (accountsRes.status === 401) throw redirect(303, '/login');

	const accountsData = accountsRes.ok ? await accountsRes.json() : { items: [] };
	const institutionsData = institutionsRes.ok ? await institutionsRes.json() : { items: [] };

	const institutionMap = new Map<string, string>(
		(institutionsData.items ?? []).map((inst: ApiInstitution) => [inst.id, inst.name])
	);

	const accounts = (accountsData.items ?? []).map((a: ApiAccount) => ({
		id: a.id,
		label: institutionMap.get(a.financial_institution_id)
			? `${institutionMap.get(a.financial_institution_id)}${a.subtype ? ` (${a.subtype})` : ''}`
			: `${a.type}${a.subtype ? ` (${a.subtype})` : ''}`,
		type: a.type
	}));

	return { accounts };
};
