import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('auth_token') ?? null;
	event.locals.token = token;

	const { pathname } = event.url;

	if (pathname.startsWith('/friday') && !token) {
		throw redirect(303, '/login');
	}

	if (pathname === '/login' && token) {
		throw redirect(303, '/friday/dashboard');
	}

	return resolve(event);
};
