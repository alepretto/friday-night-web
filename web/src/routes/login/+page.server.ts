import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { API_BASE_URL } from '$lib/server/api';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('username') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Usuário e senha são obrigatórios' });
		}

		let response: Response;
		try {
			response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
		} catch {
			return fail(503, { error: 'Não foi possível conectar ao servidor' });
		}

		if (!response.ok) {
			return fail(401, { error: 'Credenciais inválidas' });
		}

		const { access_token } = await response.json();

		cookies.set('auth_token', access_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: false
		});

		throw redirect(303, '/friday/dashboard');
	},

	logout: async ({ cookies }) => {
		cookies.delete('auth_token', { path: '/' });
		throw redirect(303, '/login');
	}
};
