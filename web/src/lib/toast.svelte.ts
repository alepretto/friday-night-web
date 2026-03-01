let toastVisible = $state(false);
let toastMessage = $state('');
let toastType = $state<'success' | 'error'>('success');
let toastTimer: ReturnType<typeof setTimeout>;

export function showToast(message: string, type: 'success' | 'error') {
	clearTimeout(toastTimer);
	toastMessage = message;
	toastType = type;
	toastVisible = true;
	toastTimer = setTimeout(() => {
		toastVisible = false;
	}, 3000);
}

export function getToastState() {
	return {
		get visible() {
			return toastVisible;
		},
		get message() {
			return toastMessage;
		},
		get type() {
			return toastType;
		}
	};
}
