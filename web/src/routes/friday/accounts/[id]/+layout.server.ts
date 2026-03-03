import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';
import type { Account, AccountType } from '$lib/types/account';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const accountRes = await apiFetch(`/api/v1/finance/accounts/${params.id}`, token);

	if (accountRes.status === 401) throw redirect(303, '/login');
	if (!accountRes.ok) throw redirect(303, '/friday/accounts');

	const apiAccount = await accountRes.json();

	// Busca a instituição e todas as contas do usuário na mesma instituição em paralelo
	const [institutionRes, siblingsRes] = await Promise.all([
		apiFetch(`/api/v1/finance/financial-institutions/${apiAccount.financial_institution_id}`, token),
		apiFetch(
			`/api/v1/finance/accounts?financial_institution_id=${apiAccount.financial_institution_id}&size=20`,
			token
		)
	]);

	const institution = institutionRes.ok ? await institutionRes.json() : null;
	const siblingsData = siblingsRes.ok ? await siblingsRes.json() : { items: [] };
	const allAccounts: { id: string; type: string }[] = siblingsData.items ?? [];

	// Encontra o ID correto da conta bank e investment da mesma instituição
	const bankAccount = allAccounts.find((a) => a.type === 'bank');
	const investmentAccount = allAccounts.find((a) => a.type === 'investment');

	const account: Account = {
		id: apiAccount.id,
		institution: institution?.name ?? 'Desconhecida',
		institutionId: apiAccount.financial_institution_id,
		status: apiAccount.status,
		type: apiAccount.type as AccountType,
		logoPath: institution?.icon_url ?? '',
		subtype: apiAccount.subtype ?? null
	};

	return {
		account,
		bankAccountId: bankAccount?.id ?? null,
		investmentAccountId: investmentAccount?.id ?? null
	};
};
