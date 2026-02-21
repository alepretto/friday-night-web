<script lang="ts">
	type AccountType = 'bank' | 'investment' | 'cash' | 'benefict';

	interface Account {
		id: number;
		institution: string;
		active: boolean;
		type: AccountType;
		subtype?: string | null;
	}
	const accounts: Account[] = [
		{ id: 1, institution: 'Santander', active: true, type: 'bank' },
		{ id: 2, institution: 'BTG Pactual', active: true, type: 'investment' },
		{ id: 3, institution: 'Pluxee', active: true, type: 'benefict', subtype: 'Vale Refeição' }
	];
</script>

<main>
	<header class="text-white">
		<h1 class="text-4xl font-bold">Accounts</h1>
		<p>Gerencies as contas que você possuí.</p>
	</header>

	<section class="text-white">
		<div class="flex items-center justify-end p-10">
			<button
				class="cursor-pointer rounded-3xl border border-success/60 bg-success/40 px-10 py-3 transition-colors hover:bg-success"
			>
				New Account
			</button>
		</div>

		{#if accounts.filter((a) => a.type == 'bank').length}
			<div class="my-3 border-b border-secondary/50 pb-3">
				<span class=" text-4xl font-bold">Bank</span>
			</div>
			<div class="grid grid-cols-3 gap-4">
				{#each accounts.filter((a) => a.type == 'bank') as account (account.id)}
					<div class="flex flex-col rounded-2xl border border-white/20 bg-secondary/30 px-4 py-5">
						<div class="flex items-center border-b border-b-white/20">
							<div class="p-5">
								<img src="/logo-santander 1.png" alt="" class="h-15 w-15" />
							</div>
							<div class="flex flex-col">
								<span class="text-3xl font-bold">{account.institution}</span>
								<span class="text-xl">Conta Corrente</span>
							</div>
						</div>
						<div class="flex justify-between py-6">
							<div class="flex flex-col gap-3 pl-3">
								<div>
									<span class="text-2xl font-bold">R$ 5.538,23</span>
								</div>
								<div class="flex items-center gap-5">
									<div class="h-5 w-5 rounded-full bg-success"></div>
									<span class="text-xl">Status</span>
								</div>
							</div>
							<div class="flex items-end">
								<div
									class="grid grid-cols-3 gap-2 rounded-xl border-3 border-secondary/30 bg-tertiary"
								>
									<button class="cursor-pointer px-5 py-2 text-center hover:bg-secondary">
										Ver
									</button>
									<button class="cursor-pointer px-5 py-2 text-center hover:bg-secondary">
										Editar
									</button>
									<button class="cursor-pointer px-5 py-2 text-center hover:bg-secondary"
										>Arquivar</button
									>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</main>
