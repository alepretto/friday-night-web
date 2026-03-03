import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { API_BASE_URL, apiFetch } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals }) => {
	const { token } = locals;

	if (!token) {
		return { accounts: [], accountTypes: [] };
	}

	try {
		const [accountsRes, typesRes, institutionsRes] = await Promise.all([
			apiFetch('/api/v1/finance/accounts?size=100', token),
			apiFetch('/api/v1/finance/accounts/types', token),
			apiFetch('/api/v1/finance/financial-institutions?size=100', token)
		]);

		const accountsData = accountsRes.ok ? await accountsRes.json() : { items: [] };
		const typesData = typesRes.ok ? await typesRes.json() : { types: [] };
		const institutionsData = institutionsRes.ok ? await institutionsRes.json() : { items: [] };

		// Criar mapa de id -> nome da instituição
		const institutionMap = new Map<string, string>(
			(institutionsData.items ?? []).map((inst: any) => [inst.id, inst.name])
		);

		const accounts = (accountsData.items ?? []).map((acc: any) => {
			const instName = institutionMap.get(acc.financial_institution_id) ?? acc.financial_institution_id;
			return {
				id: acc.id,
				label: acc.subtype ? `${instName} (${acc.subtype})` : instName,
				type: acc.type
			};
		});

		const accountTypes = (typesData.types ?? []).map((t: any) => ({
			id: t.id,
			label: t.label
		}));

		return { accounts, accountTypes };
	} catch {
		return { accounts: [], accountTypes: [] };
	}
};

export const actions: Actions = {
	selectAccount: async ({ request, cookies }) => {
		const data = await request.formData();
		const accountId = data.get('accountId') as string;
		const init_data = data.get('init_data') as string;

		if (!accountId || !init_data) {
			return fail(400, { error: 'Dados inválidos' });
		}

		// Retornar dados para o frontend fazer o redirecionamento
		return { 
			redirectUrl: `/telegram/transaction?account_id=${accountId}`,
			success: true 
		};
	},

	auth: async ({ request, cookies }) => {
		const data = await request.formData();
		const init_data = data.get('init_data') as string;

		if (!init_data) {
			return fail(400, { error: 'initData ausente' });
		}

		let response: Response;
		try {
			response = await fetch(`${API_BASE_URL}/api/v1/auth/telegram`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ init_data })
			});
		} catch {
			return fail(503, { error: 'Não foi possível conectar ao servidor' });
		}

		if (response.status === 404) {
			return fail(404, { needsLink: true });
		}

		if (!response.ok) {
			const err = await response.json().catch(() => ({}));
			return fail(response.status, { error: err.message ?? 'Erro na autenticação Telegram' });
		}

		const { access_token } = await response.json();

		cookies.set('auth_token', access_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'none',
			secure: true
		});

		// Retornar sucesso em vez de redirecionar para permitir que o frontend mostre o seletor de contas
		return { success: true };
	},

	link: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const init_data = data.get('init_data') as string;

		if (!email || !password || !init_data) {
			return fail(400, { needsLink: true, error: 'Todos os campos são obrigatórios' });
		}

		// Step 1: login to get access_token
		let loginResponse: Response;
		try {
			loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
		} catch {
			return fail(503, { needsLink: true, error: 'Não foi possível conectar ao servidor' });
		}

		if (!loginResponse.ok) {
			return fail(401, { needsLink: true, error: 'Credenciais inválidas' });
		}

		const { access_token } = await loginResponse.json();

		// Step 2: link Telegram account
		let linkResponse: Response;
		try {
			linkResponse = await fetch(`${API_BASE_URL}/api/v1/users/me/telegram`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`
				},
				body: JSON.stringify({ init_data })
			});
		} catch {
			return fail(503, { needsLink: true, error: 'Não foi possível vincular a conta' });
		}

		if (!linkResponse.ok) {
			const err = await linkResponse.json().catch(() => ({}));
			return fail(linkResponse.status, {
				needsLink: true,
				error: err.message ?? 'Erro ao vincular conta Telegram'
			});
		}

		cookies.set('auth_token', access_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'none',
			secure: true
		});

		// Retornar sucesso em vez de redirecionar
		return { success: true };
	}
};