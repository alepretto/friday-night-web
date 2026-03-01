<script lang="ts">
	import type { AccountType } from '$lib/types/account';

	interface Props {
		logoPath: string;
		institution: string;
		type: AccountType;
		variant?: 'card' | 'page';
	}

	let { logoPath, institution, type, variant = 'card' }: Props = $props();

	const sizes = {
		card: { img: 'h-15 w-15', title: 'text-2xl', subtitle: 'text-base' },
		page: { img: 'h-25 w-25', title: 'text-4xl', subtitle: 'text-xl' }
	};

	const s = $derived(sizes[variant]);

	const deparaAccountType: Record<AccountType, string> = {
		bank: 'Conta Corrente',
		investment: 'Corretora',
		cash: 'Cash',
		benefit: 'Benefícios'
	};
</script>

<div class="flex items-center gap-5">
	<img src={logoPath} alt="" class={s.img} />
	<div class="flex flex-col">
		<span class="font-bold {s.title}">{institution}</span>
		<span class={s.subtitle}>{deparaAccountType[type]}</span>
	</div>
</div>
