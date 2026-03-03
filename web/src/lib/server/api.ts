import { env } from '$env/dynamic/private';

export const API_BASE_URL = env.API_BASE_URL ?? 'http://localhost:8000';

export async function apiFetch(
	path: string,
	token: string | null,
	options: RequestInit = {}
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10_000);

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...(options.headers ?? {})
	};

	try {
		const res = await fetch(`${API_BASE_URL}${path}`, {
			...options,
			headers,
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		return res;
	} catch {
		clearTimeout(timeoutId);
		return new Response(null, { status: 500 });
	}
}
