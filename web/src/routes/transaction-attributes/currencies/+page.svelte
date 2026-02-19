<script lang="ts">
	let activeTab = $state('Currencies');
	const tabs = ['Transaction Tags', 'Payment Methods', 'Currencies'];
</script>

<main class="text-white">
	<header>
		<h1>Transactions Attributes</h1>
		<p>Gerencies todos os atributos das transações aqui.</p>
	</header>

	<div class="inline-flex w-fit rounded-full border border-white/10 bg-[#4f4f4f] p-1">
		{#each tabs as tab}
			<button
				onclick={() => (activeTab = tab)}
				class="rounded-full px-20 py-2 text-sm font-medium transition-all duration-200
          {activeTab === tab
					? 'bg-[#2c303a] text-white shadow-lg'
					: 'text-white-500 hover:text-gray-300'}"
			>
				{tab}
			</button>
		{/each}
	</div>

	<section>
		<div>
			<div>
				<select name="transaction-tag-category" id="transaction-tag-category">
					<option value="">Selecione...</option>
				</select>
				<select name="transaction-tag-subcategory" id="transaction-tag-subcategory">
					<option value="">Selecione...</option>
				</select>
				<select name="transaction-tag-type" id="transaction-tag-type">
					<option value="">Selecione...</option>
				</select>
			</div>
		</div>
	</section>
</main>

<style lang="ts">
	.attributes-tabs {
		border: 1px solid white;
		display: flex;
		background-color: #4f4f4f;
		width: 30%;
		justify-content: space-between;
		padding: 3px;
		border-radius: 20px;
	}
</style>
