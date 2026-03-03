import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { API_BASE_URL } from '$lib/api';

export const ssr = false;

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

export const load: LayoutLoad = async ({ fetch, parent }) => {
	const { token } = await parent();

	if (!token) throw redirect(303, '/telegram');

	const [accountsRes, institutionsRes] = await Promise.all([
		fetch(`${API_BASE_URL}/api/v1/finance/accounts?size=100&status=activate`, {
			headers: { Authorization: `Bearer ${token}` }
		}),
		fetch(`${API_BASE_URL}/api/v1/finance/financial-institutions?size=100`, {
			headers: { Authorization: `Bearer ${token}` }
		})
	]);

	const accountsData = accountsRes.ok ? await accountsRes.json() : { items: [] };
	const institutionsData = institutionsRes.ok ? await institutionsRes.json() : { items: [] };

	const institutionMap = new Map<string, string>(
		(institutionsData.items ?? []).map((inst: ApiInstitution) => [inst.id, inst.name])
	);

	const accounts = (accountsData.items ?? []).map((a: ApiAccount) => {
		const instName = institutionMap.get(a.financial_institution_id);
		const base = instName ?? a.type;
		return {
			id: a.id,
			label: a.subtype ? `${base} (${a.subtype})` : base,
			type: a.type
		};
	});

	return { accounts };
};
