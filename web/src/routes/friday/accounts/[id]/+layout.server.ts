import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';
import type { Account, AccountType } from '$lib/types/account';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const accountRes = await apiFetch(`/finance/accounts/${params.id}`, token);
	if (accountRes.status === 401) throw redirect(303, '/login');
	if (!accountRes.ok) throw redirect(303, '/friday/accounts');

	const apiAccount = await accountRes.json();

	const institutionRes = await apiFetch(
		`/finance/financial-institutions/${apiAccount.financial_institution_id}`,
		token
	);
	const institution = institutionRes.ok ? await institutionRes.json() : null;

	const account: Account = {
		id: apiAccount.id,
		institution: institution?.name ?? 'Desconhecida',
		institutionId: apiAccount.financial_institution_id,
		status: apiAccount.status,
		type: apiAccount.type as AccountType,
		logoPath: institution?.icon_url ?? '',
		subtype: apiAccount.subtype ?? null
	};

	return { account };
};
