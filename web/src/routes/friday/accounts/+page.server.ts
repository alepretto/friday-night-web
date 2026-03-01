import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';
import type { Account, AccountType } from '$lib/types/account';

interface ApiAccount {
	id: string;
	financial_institution_id: string;
	status: 'activate' | 'deactivate';
	type: AccountType;
	subtype: string | null;
}

interface ApiInstitution {
	id: string;
	name: string;
	icon_url: string | null;
}

async function loadData(token: string) {
	const [accountsRes, institutionsRes] = await Promise.all([
		apiFetch('/finance/accounts?size=100', token),
		apiFetch('/finance/financial-institutions?size=100', token)
	]);

	if (accountsRes.status === 401 || institutionsRes.status === 401) {
		return { unauthorized: true as const };
	}

	const accountsData = await accountsRes.json();
	const institutionsData = await institutionsRes.json();

	const institutionMap = new Map<string, ApiInstitution>();
	for (const inst of institutionsData.items ?? []) {
		institutionMap.set(inst.id, inst);
	}

	const accounts: Account[] = (accountsData.items ?? []).map((a: ApiAccount) => {
		const inst = institutionMap.get(a.financial_institution_id);
		return {
			id: a.id,
			institution: inst?.name ?? 'Desconhecida',
			institutionId: a.financial_institution_id,
			status: a.status,
			type: a.type,
			logoPath: inst?.icon_url ?? '',
			subtype: a.subtype
		};
	});

	const institutions = (institutionsData.items ?? []).map((i: ApiInstitution) => ({
		id: i.id,
		name: i.name
	}));

	return { accounts, institutions };
}

export const load: PageServerLoad = async ({ locals }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	return { streamed: loadData(token) };
};

export const actions: Actions = {
	createAccount: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const financialInstitutionId = data.get('financialInstitutionId') as string;
		const type = data.get('type') as string;
		const subtype = ((data.get('subtype') as string) ?? '').trim() || null;

		if (!financialInstitutionId || !type) {
			return fail(400, { error: 'Instituição e tipo são obrigatórios' });
		}

		const res = await apiFetch('/finance/accounts', token, {
			method: 'POST',
			body: JSON.stringify({
				financial_institution_id: financialInstitutionId,
				status: 'activate',
				type,
				subtype
			})
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao criar conta' });
		}

		return { success: true };
	},

	archiveAccount: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();
		const accountId = data.get('accountId') as string;

		const res = await apiFetch(`/finance/accounts/${accountId}/archive`, token, {
			method: 'PATCH'
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao arquivar conta' });
		}

		return { success: true };
	},

	activateAccount: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();
		const accountId = data.get('accountId') as string;

		const res = await apiFetch(`/finance/accounts/${accountId}/activate`, token, {
			method: 'PATCH'
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao ativar conta' });
		}

		return { success: true };
	}
};
