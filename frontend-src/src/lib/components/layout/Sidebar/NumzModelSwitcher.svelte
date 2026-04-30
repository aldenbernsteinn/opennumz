<script lang="ts">
	import { onMount } from 'svelte';
	import { getNumzModels, switchNumzModel } from '$lib/apis/numz';
	import type { NumzModelInfo } from '$lib/apis/numz';
	import Spinner from '$lib/components/common/Spinner.svelte';

	let models: NumzModelInfo[] = [];
	let activeModel = '';
	let switching = false;
	let error = '';

	async function loadModels() {
		try {
			const res = await getNumzModels(localStorage.token);
			models = res.models;
			activeModel = res.active;
			error = '';
		} catch (e) {
			error = 'Failed to load models';
		}
	}

	async function handleSwitch(name: string) {
		if (switching || name === activeModel) return;
		switching = true;
		error = '';
		try {
			const res = await switchNumzModel(localStorage.token, name);
			if (res.success) {
				activeModel = res.active;
				// Reload page models so chat selector updates
				window.location.reload();
			} else {
				error = res.message;
			}
		} catch (e) {
			error = 'Switch failed';
		} finally {
			switching = false;
		}
	}

	onMount(loadModels);
</script>

{#if models.length > 1}
	<div class="px-2 py-1">
		<div class="text-xs font-medium text-gray-400 dark:text-gray-500 px-1.5 mb-1">Server Model</div>
		<div class="flex flex-col gap-0.5">
			{#each models as model}
				<button
					class="flex items-center gap-2 px-1.5 py-1 rounded-lg text-xs w-full transition
						{model.name === activeModel
							? 'bg-gray-200/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100'
							: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-900/50'}
						{switching ? 'opacity-50 cursor-wait' : 'cursor-pointer'}"
					disabled={switching}
					on:click={() => handleSwitch(model.name)}
				>
					<span class="w-1.5 h-1.5 rounded-full flex-shrink-0
						{model.name === activeModel ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"
					></span>
					<span class="truncate flex-1 text-left">{model.displayName}</span>
					{#if switching && model.name !== activeModel && model.name === models.find(m => m.name !== activeModel)?.name}
						<Spinner className="size-3" />
					{/if}
				</button>
			{/each}
		</div>
		{#if error}
			<div class="text-xs text-red-500 px-1.5 mt-1">{error}</div>
		{/if}
	</div>
{/if}
