<script lang="ts">
	let { children } = $props();

	let activeTab = $state('Currencies');
	const tabs = ['Transaction Tags', 'Payment Methods', 'Currencies'];
</script>

<div class="p-10">
	<main class="text-white">
		<header>
			<h1 class="text-4xl font-bold">Transactions Attributes</h1>
			<p>Gerencies todos os atributos das transações aqui.</p>
		</header>

		<div class="p-10">
			<div class="inline-flex w-fit rounded-full border border-white/10 bg-secondary/30 p-1">
				{#each tabs as tab (tab)}
					<button
						onclick={() => (activeTab = tab)}
						class="cursor-pointer rounded-full px-20 py-2 text-sm font-medium transition-all duration-200
              {activeTab === tab
							? 'bg-tertiary text-white shadow-lg'
							: 'text-white-500 hover:text-gray-300'}"
					>
						{tab}
					</button>
				{/each}
			</div>
		</div>

		{@render children()}
	</main>
</div>
