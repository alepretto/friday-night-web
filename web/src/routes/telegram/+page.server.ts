import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { API_BASE_URL } from '$lib/server/api';

export const actions: Actions = {
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

		throw redirect(303, '/telegram/transaction');
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

		throw redirect(303, '/telegram/transaction');
	}
};
