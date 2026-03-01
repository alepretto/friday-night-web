import { goto } from '$app/navigation';

export function useStreamedData<T>(getStreamed: () => Promise<T>) {
	let data = $state<T | null>(null);
	let isLoading = $state(true);

	$effect(() => {
		isLoading = true;
		Promise.resolve(getStreamed())
			.then(async (result) => {
				if (result && typeof result === 'object' && 'unauthorized' in result) {
					await fetch('/login?/logout', { method: 'POST' });
					// eslint-disable-next-line svelte/no-navigation-without-resolve -- absolute path
					goto('/login');
					return;
				}
				data = result;
				isLoading = false;
			})
			.catch((err) => {
				console.error('Erro ao carregar dados:', err);
				isLoading = false;
			});
	});

	return {
		get data() {
			return data;
		},
		get isLoading() {
			return isLoading;
		}
	};
}
