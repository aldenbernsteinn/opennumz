<script lang="ts">
	export let fileChanges: {
		path: string;
		beforeContent: string | null;
		action: string;
	}[] = [];
	export let selectedPath: string | null = null;
	export let onSelect: (path: string) => void = () => {};

	const actionBadge = (action: string) => {
		switch (action) {
			case 'created': return { label: 'A', color: 'text-green-500' };
			case 'deleted': return { label: 'D', color: 'text-red-500' };
			default: return { label: 'M', color: 'text-yellow-500' };
		}
	};

	const basename = (path: string) => path.split('/').pop() ?? path;
	const dirname = (path: string) => {
		const parts = path.split('/');
		parts.pop();
		return parts.join('/') || '/';
	};
</script>

<div class="file-change-list">
	{#each fileChanges as change (change.path)}
		{@const badge = actionBadge(change.action)}
		<button
			class="flex items-center gap-2 w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
			class:bg-gray-100={selectedPath === change.path}
			class:dark:bg-gray-700={selectedPath === change.path}
			on:click={() => onSelect(change.path)}
		>
			<span class="font-bold {badge.color} w-4 flex-shrink-0">{badge.label}</span>
			<span class="font-mono truncate text-gray-700 dark:text-gray-300">
				{basename(change.path)}
			</span>
			<span class="text-gray-400 dark:text-gray-500 truncate text-[10px] ml-auto">
				{dirname(change.path)}
			</span>
			{#if change.beforeContent === null && change.action === 'modified'}
				<span class="text-[9px] text-gray-400 italic flex-shrink-0">no rollback</span>
			{/if}
		</button>
	{/each}
</div>
