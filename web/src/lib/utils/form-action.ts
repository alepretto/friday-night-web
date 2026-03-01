import { deserialize } from '$app/forms';
import { invalidateAll } from '$app/navigation';

export async function submitAction(
	actionName: string,
	fields: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
	const formData = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		formData.set(key, value);
	}

	const res = await fetch(`?/${actionName}`, { method: 'POST', body: formData });
	const result = deserialize(await res.text());

	if (result.type === 'success') {
		await invalidateAll();
		return { success: true };
	} else if (result.type === 'failure') {
		const error = (result.data?.error as string) ?? 'Erro desconhecido';
		return { success: false, error };
	}

	return { success: false, error: 'Erro inesperado' };
}
