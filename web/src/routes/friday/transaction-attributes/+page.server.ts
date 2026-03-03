import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const [tagsRes, tagsActiveRes, pmRes, pmActiveRes, currRes] = await Promise.all([
		apiFetch('/api/v1/finance/tags?size=1', token),
		apiFetch('/api/v1/finance/tags?size=1&active=true', token),
		apiFetch('/api/v1/finance/payment-methods?size=1', token),
		apiFetch('/api/v1/finance/payment-methods?size=1&active=true', token),
		apiFetch('/api/v1/finance/currencies?size=1', token)
	]);

	const [tags, tagsActive, pm, pmActive, curr] = await Promise.all([
		tagsRes.ok ? tagsRes.json() : { total: 0 },
		tagsActiveRes.ok ? tagsActiveRes.json() : { total: 0 },
		pmRes.ok ? pmRes.json() : { total: 0 },
		pmActiveRes.ok ? pmActiveRes.json() : { total: 0 },
		currRes.ok ? currRes.json() : { total: 0 }
	]);

	return {
		stats: {
			tags: { total: tags.total ?? 0, active: tagsActive.total ?? 0 },
			paymentMethods: { total: pm.total ?? 0, active: pmActive.total ?? 0 },
			currencies: { total: curr.total ?? 0 }
		}
	};
};
