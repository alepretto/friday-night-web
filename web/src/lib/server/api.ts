export const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function apiFetch(
	path: string,
	token: string | null,
	options: RequestInit = {}
): Promise<Response> {
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...(options.headers ?? {})
	};

	return fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers
	});
}
