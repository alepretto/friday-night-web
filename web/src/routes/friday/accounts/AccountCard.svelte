<script lang="ts">
	type AccountType = 'bank' | 'investment' | 'cash' | 'benefict';

	interface Account {
		id: number;
		institution: string;
		active: boolean;
		type: AccountType;
		subtype?: string | null;
		logoPath: string;
	}

	interface Props {
		account: Account;
	}

	let { account }: Props = $props();

	const deparaAccountType: Record<AccountType, string> = {
		bank: 'Conta Corrent',
		investment: 'Corretora',
		cash: 'Cash',
		benefict: 'Benefícios'
	};
</script>

<div class="flex min-w-md flex-col rounded-2xl border border-white/20 bg-secondary/30 px-4 py-5">
	<div class="flex items-center gap-5 border-b border-b-white/20 pb-3">
		<div class="">
			<img src={account.logoPath} alt="" class="h-15 w-15" />
		</div>
		<div class="flex flex-col">
			<span class="text-2xl font-bold">{account.institution}</span>
			<span class="text-base">{deparaAccountType[account.type]}</span>
		</div>
	</div>
	<div class="flex justify-between py-6">
		<div class="flex flex-col gap-3 pl-3">
			<div>
				<span class="text-xl font-bold">R$ 5.538,23</span>
			</div>
			<div class="flex items-center gap-5">
				<div class="h-3 w-3 rounded-full bg-success"></div>
				<span class="text-base">Status</span>
			</div>
		</div>
		<div class="flex items-end">
			<div class="grid grid-cols-3 gap-2 rounded-xl border-3 border-secondary/30 bg-tertiary">
				<button class="cursor-pointer px-4 py-1 text-center hover:bg-secondary"> Ver </button>
				<button class="cursor-pointer px-4 py-1 text-center hover:bg-secondary"> Editar </button>
				<button class="cursor-pointer px-4 py-1 text-center hover:bg-secondary">Arquivar</button>
			</div>
		</div>
	</div>
</div>
