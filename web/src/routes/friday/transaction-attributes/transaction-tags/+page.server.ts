import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { apiFetch } from '$lib/server/api';

interface ApiSubcategory {
	id: string;
	label: string;
	category_id: string;
}

interface ApiCategory {
	id: string;
	label: string;
	type: 'outcome' | 'income';
	subcategories: ApiSubcategory[];
}

interface ApiTag {
	id: string;
	category_id: string;
	subcategory_id: string;
	active: boolean;
}

async function loadData(token: string, page: string) {
	const [tagsRes, catsRes] = await Promise.all([
		apiFetch(`/finance/tags?page=${page}&size=10`, token),
		apiFetch('/finance/categories/with-subcategories', token)
	]);

	if (tagsRes.status === 401 || catsRes.status === 401) {
		throw redirect(303, '/login');
	}

	const tagsData = await tagsRes.json();
	const categories: ApiCategory[] = (await catsRes.json()) ?? [];

	const subcategoriesMap: Record<string, ApiSubcategory[]> = {};
	for (const cat of categories) {
		subcategoriesMap[cat.id] = cat.subcategories ?? [];
	}

	const tags = (tagsData.items ?? []).map((tag: ApiTag) => {
		const category = categories.find((c) => c.id === tag.category_id);
		const subcategory = (subcategoriesMap[tag.category_id] ?? []).find(
			(s) => s.id === tag.subcategory_id
		);
		return {
			id: tag.id,
			category: category?.label ?? '-',
			subcategory: subcategory?.label ?? '-',
			type: (category?.type ?? 'outcome') as 'outcome' | 'income',
			active: tag.active,
			category_id: tag.category_id,
			subcategory_id: tag.subcategory_id
		};
	});

	return {
		tags,
		categories,
		subcategoriesMap,
		pagination: {
			page: (tagsData.page as number) ?? 1,
			pages: (tagsData.pages as number) ?? 1,
			total: (tagsData.total as number) ?? 0
		}
	};
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const { token } = locals;
	if (!token) throw redirect(303, '/login');

	const page = url.searchParams.get('page') ?? '1';

	return {
		streamed: loadData(token, page)
	};
};

export const actions: Actions = {
	createTag: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const type = data.get('type') as string;
		let categoryId = (data.get('categoryId') as string) ?? '';
		const newCategory = ((data.get('newCategory') as string) ?? '').trim();
		let subcategoryId = (data.get('subcategoryId') as string) ?? '';
		const newSubcategory = ((data.get('newSubcategory') as string) ?? '').trim();

		if (!categoryId && !newCategory) {
			return fail(400, { error: 'Selecione ou crie uma categoria' });
		}
		if (!subcategoryId && !newSubcategory) {
			return fail(400, { error: 'Selecione ou crie uma subcategoria' });
		}

		if (!categoryId && newCategory) {
			const res = await apiFetch('/finance/categories', token, {
				method: 'POST',
				body: JSON.stringify({ label: newCategory, type })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, { error: err.message ?? 'Erro ao criar categoria' });
			}
			const cat = await res.json();
			categoryId = cat.id;
		}

		if (!subcategoryId && newSubcategory) {
			const res = await apiFetch('/finance/subcategories', token, {
				method: 'POST',
				body: JSON.stringify({ category_id: categoryId, label: newSubcategory })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return fail(res.status, { error: err.message ?? 'Erro ao criar subcategoria' });
			}
			const sub = await res.json();
			subcategoryId = sub.id;
		}

		const res = await apiFetch('/finance/tags', token, {
			method: 'POST',
			body: JSON.stringify({ category_id: categoryId, subcategory_id: subcategoryId, active: true })
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao criar tag' });
		}

		return { success: true };
	},

	updateTag: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();

		const tagId = data.get('tagId') as string;
		const categoryId = data.get('categoryId') as string;
		const subcategoryId = data.get('subcategoryId') as string;

		if (!tagId || !categoryId || !subcategoryId) {
			return fail(400, { error: 'Dados inválidos' });
		}

		const res = await apiFetch(`/finance/tags/${tagId}`, token, {
			method: 'PATCH',
			body: JSON.stringify({ category_id: categoryId, subcategory_id: subcategoryId })
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao atualizar tag' });
		}

		return { success: true };
	},

	toggleTag: async ({ request, locals }) => {
		const { token } = locals;
		const data = await request.formData();
		const tagId = data.get('tagId') as string;
		const active = data.get('active') === 'true';

		const endpoint = active
			? `/finance/tags/${tagId}/deactivate`
			: `/finance/tags/${tagId}/activate`;

		const res = await apiFetch(endpoint, token, { method: 'PATCH' });
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			return fail(res.status, { error: err.message ?? 'Erro ao atualizar tag' });
		}

		return { success: true };
	}
};
