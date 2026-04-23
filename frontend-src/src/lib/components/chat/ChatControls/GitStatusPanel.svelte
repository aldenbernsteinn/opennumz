<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { terminalServers, selectedTerminalId, settings } from '$lib/stores';
	import { getGitStatus, getGitDiff, getGitLog } from '$lib/apis/changes';
	import DiffViewer from '../Messages/AtpState/DiffViewer.svelte';
	import Spinner from '../../common/Spinner.svelte';

	const i18n = getContext('i18n');

	let loading = false;
	let modified: string[] = [];
	let staged: string[] = [];
	let untracked: string[] = [];
	let commits: { hash: string; message: string }[] = [];
	let showLog = false;

	let selectedFile: string | null = null;
	let diffContent = '';
	let diffLoading = false;

	const getServerId = () => {
		return $selectedTerminalId ?? '';
	};

	const refresh = async () => {
		const serverId = getServerId();
		if (!serverId) return;

		loading = true;
		const token = localStorage.token;
		const status = await getGitStatus(token, serverId);
		modified = status.modified;
		staged = status.staged;
		untracked = status.untracked;
		loading = false;
	};

	const loadLog = async () => {
		const serverId = getServerId();
		if (!serverId) return;

		const token = localStorage.token;
		const result = await getGitLog(token, serverId);
		commits = result.commits;
		showLog = true;
	};

	const viewDiff = async (path: string, isStagedFile = false) => {
		if (selectedFile === path) {
			selectedFile = null;
			return;
		}
		selectedFile = path;
		diffLoading = true;

		const serverId = getServerId();
		const token = localStorage.token;
		diffContent = await getGitDiff(token, serverId, undefined, path, isStagedFile);
		diffLoading = false;
	};

	onMount(() => {
		refresh();
	});
</script>

<div class="flex flex-col h-full overflow-y-auto text-sm">
	<div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
		<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
			Git Status
		</span>
		<div class="flex items-center gap-1">
			<button
				class="text-[11px] px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
				on:click={() => { showLog ? (showLog = false) : loadLog(); }}
			>
				{showLog ? 'Status' : 'Log'}
			</button>
			<button
				class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
				on:click={refresh}
				title="Refresh"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
					<path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.311a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm-10.625-2.85a5.5 5.5 0 019.201-2.466l.312.311H11.767a.75.75 0 000 1.5h3.634a.75.75 0 00.75-.75V3.535a.75.75 0 00-1.5 0v2.033l-.312-.311A7 7 0 002.627 8.396a.75.75 0 001.449.39z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-8">
			<Spinner />
		</div>
	{:else if showLog}
		<div class="px-3 py-2 space-y-0.5">
			{#each commits as commit (commit.hash)}
				<div class="flex items-center gap-2 py-1 text-xs">
					<span class="font-mono text-yellow-500 flex-shrink-0">{commit.hash.slice(0, 7)}</span>
					<span class="text-gray-600 dark:text-gray-400 truncate">{commit.message}</span>
				</div>
			{:else}
				<div class="text-xs text-gray-400 py-2">No commits found</div>
			{/each}
		</div>
	{:else}
		{#if modified.length === 0 && staged.length === 0 && untracked.length === 0}
			<div class="text-xs text-gray-400 py-8 text-center">
				Working tree clean
			</div>
		{:else}
			{#if staged.length > 0}
				<div class="px-3 pt-2 pb-1">
					<span class="text-[10px] uppercase tracking-wider text-green-500 font-semibold">Staged</span>
				</div>
				{#each staged as file (file)}
					<button
						class="flex items-center gap-2 w-full px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
						class:bg-gray-100={selectedFile === file}
						class:dark:bg-gray-700={selectedFile === file}
						on:click={() => viewDiff(file, true)}
					>
						<span class="text-green-500 font-bold w-3">S</span>
						<span class="font-mono truncate text-gray-600 dark:text-gray-400">{file}</span>
					</button>
				{/each}
			{/if}

			{#if modified.length > 0}
				<div class="px-3 pt-2 pb-1">
					<span class="text-[10px] uppercase tracking-wider text-yellow-500 font-semibold">Modified</span>
				</div>
				{#each modified as file (file)}
					<button
						class="flex items-center gap-2 w-full px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
						class:bg-gray-100={selectedFile === file}
						class:dark:bg-gray-700={selectedFile === file}
						on:click={() => viewDiff(file)}
					>
						<span class="text-yellow-500 font-bold w-3">M</span>
						<span class="font-mono truncate text-gray-600 dark:text-gray-400">{file}</span>
					</button>
				{/each}
			{/if}

			{#if untracked.length > 0}
				<div class="px-3 pt-2 pb-1">
					<span class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Untracked</span>
				</div>
				{#each untracked as file (file)}
					<div class="flex items-center gap-2 px-3 py-1 text-xs">
						<span class="text-gray-400 font-bold w-3">?</span>
						<span class="font-mono truncate text-gray-500">{file}</span>
					</div>
				{/each}
			{/if}
		{/if}

		{#if selectedFile && !diffLoading && diffContent}
			<div class="p-2 border-t border-gray-200 dark:border-gray-700" style="max-height: 300px; overflow: auto;">
				<pre class="text-[11px] font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-400">{diffContent}</pre>
			</div>
		{:else if diffLoading}
			<div class="flex items-center justify-center py-4 text-xs text-gray-400">
				Loading diff...
			</div>
		{/if}
	{/if}
</div>
