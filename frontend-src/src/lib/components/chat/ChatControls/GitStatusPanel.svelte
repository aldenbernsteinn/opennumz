<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { selectedTerminalId } from '$lib/stores';
	import {
		getGitStatus, getGitDiff, getGitLog, getCurrentBranch,
		getBranches, checkout, commitChanges, pushChanges, pullChanges,
		getGitignore, saveGitignore
	} from '$lib/apis/changes';
	import Spinner from '../../common/Spinner.svelte';
	import ConfirmDialog from '../../common/ConfirmDialog.svelte';

	const i18n = getContext('i18n');

	// State
	let loading = false;
	let currentBranch = '';
	let modified: string[] = [];
	let staged: string[] = [];
	let untracked: string[] = [];
	let branches: { name: string; upstream: string; current: boolean; date: string; remote: boolean }[] = [];
	let commits: { hash: string; message: string }[] = [];

	// UI toggles
	let showBranches = false;
	let showLog = false;
	let showGitignore = false;
	let newBranchName = '';

	// Commit
	let commitMessage = '';
	let committing = false;

	// Actions
	let pushing = false;
	let pulling = false;

	// Diff
	let selectedFile: string | null = null;
	let diffContent = '';
	let diffLoading = false;

	// Gitignore
	let gitignoreContent = '';
	let gitignoreSaving = false;

	// Confirm dialog
	let showConfirm = false;
	let confirmTitle = '';
	let confirmMessage = '';
	let confirmAction: () => void = () => {};

	// Branch switch
	let switchTarget = '';

	const token = () => localStorage.token;
	const serverId = () => $selectedTerminalId ?? '';

	const refresh = async () => {
		const sid = serverId();
		if (!sid) return;
		loading = true;
		const [statusRes, branchRes] = await Promise.all([
			getGitStatus(token(), sid),
			getCurrentBranch(token(), sid),
		]);
		modified = statusRes.modified;
		staged = statusRes.staged;
		untracked = statusRes.untracked;
		currentBranch = branchRes;
		loading = false;
	};

	const loadBranches = async () => {
		const sid = serverId();
		if (!sid) return;
		branches = await getBranches(token(), sid);
		showBranches = true;
	};

	const loadLog = async () => {
		const sid = serverId();
		if (!sid) return;
		const result = await getGitLog(token(), sid);
		commits = result.commits;
		showLog = true;
	};

	const viewDiff = async (path: string, isStagedFile = false) => {
		if (selectedFile === path) { selectedFile = null; return; }
		selectedFile = path;
		diffLoading = true;
		diffContent = await getGitDiff(token(), serverId(), undefined, path, isStagedFile);
		diffLoading = false;
	};

	const doCheckout = async (branch: string, create = false) => {
		const result = await checkout(token(), serverId(), branch, create);
		if (result.ok) {
			toast.success(`Switched to ${branch}`);
			newBranchName = '';
			await refresh();
			if (showBranches) await loadBranches();
		} else {
			toast.error(result.output || 'Checkout failed');
		}
	};

	const promptCheckout = (branch: string) => {
		switchTarget = branch;
		confirmTitle = 'Switch branch?';
		confirmMessage = `Switch to "${branch}"? Unsaved changes will be stashed.`;
		confirmAction = () => doCheckout(branch);
		showConfirm = true;
	};

	const doCommitAndPush = async () => {
		if (!commitMessage.trim()) { toast.error('Enter a commit message'); return; }
		committing = true;
		const commitResult = await commitChanges(token(), serverId(), commitMessage.trim());
		if (!commitResult.ok) {
			toast.error(commitResult.output || 'Commit failed');
			committing = false;
			return;
		}
		const pushResult = await pushChanges(token(), serverId());
		committing = false;
		if (pushResult.ok) {
			toast.success('Committed & pushed');
			commitMessage = '';
			await refresh();
		} else {
			toast.error(pushResult.output || 'Push failed (commit succeeded)');
			await refresh();
		}
	};

	const doPush = async () => {
		pushing = true;
		const result = await pushChanges(token(), serverId());
		pushing = false;
		if (result.ok) {
			toast.success('Pushed');
		} else {
			toast.error(result.output || 'Push failed');
		}
	};

	const doPull = async () => {
		pulling = true;
		const result = await pullChanges(token(), serverId());
		pulling = false;
		if (result.ok) {
			toast.success('Pulled');
			await refresh();
		} else {
			toast.error(result.output || 'Pull failed');
		}
	};

	const loadGitignore = async () => {
		gitignoreContent = await getGitignore(token(), serverId());
		showGitignore = true;
	};

	const doSaveGitignore = async () => {
		gitignoreSaving = true;
		const result = await saveGitignore(token(), serverId(), gitignoreContent);
		gitignoreSaving = false;
		if (result.ok) {
			toast.success('.gitignore saved');
			await refresh();
		} else {
			toast.error('Failed to save .gitignore');
		}
	};

	onMount(() => { refresh(); });
</script>

<ConfirmDialog
	bind:show={showConfirm}
	title={confirmTitle}
	message={confirmMessage}
	confirmLabel="Switch"
	onConfirm={confirmAction}
/>

<div class="flex flex-col h-full overflow-y-auto text-sm">
	<!-- Header: current branch + refresh -->
	<div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center gap-2 min-w-0">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0">
				<path fill-rule="evenodd" d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-4 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM4 8.084V9.4a3 3 0 1 0 1.5.082v-2.17A3.001 3.001 0 0 0 8 4.5h1.586l-.293.293a.5.5 0 0 0 .707.707l1.146-1.146a.5.5 0 0 0 0-.708L10 2.5a.5.5 0 0 0-.707.707L9.586 3.5H8a4.5 4.5 0 0 0-4 2.084Z" clip-rule="evenodd" />
			</svg>
			{#if currentBranch}
				<span class="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{currentBranch}</span>
			{:else}
				<span class="text-xs text-gray-400 italic">no branch</span>
			{/if}
		</div>
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

	{#if loading}
		<div class="flex items-center justify-center py-8"><Spinner /></div>
	{:else}
		<!-- Branches (collapsible) -->
		<div class="border-b border-gray-100 dark:border-gray-800">
			<button
				class="flex items-center justify-between w-full px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
				on:click={() => { showBranches ? (showBranches = false) : loadBranches(); }}
			>
				Branches
				<span class="text-[10px]">{showBranches ? '▼' : '▶'}</span>
			</button>
			{#if showBranches}
				<div class="px-1 pb-2">
					<!-- Create new branch -->
					<div class="flex gap-1 px-2 pb-1.5">
						<input
							type="text"
							bind:value={newBranchName}
							placeholder="new branch name..."
							class="flex-1 text-xs px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none font-mono"
						/>
						<button
							class="text-[10px] px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
							disabled={!newBranchName.trim()}
							on:click={() => doCheckout(newBranchName.trim(), true)}
						>
							Create
						</button>
					</div>
					<!-- Branch list -->
					{#each branches as branch (branch.name)}
						{#if !branch.name.startsWith('origin/HEAD')}
							<button
								class="flex items-center justify-between w-full px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors text-left {branch.current ? 'bg-blue-50 dark:bg-blue-900/20' : ''}"
								disabled={branch.current}
								on:click={() => { if (!branch.current) promptCheckout(branch.name); }}
							>
								<div class="flex items-center gap-1.5 min-w-0">
									{#if branch.current}
										<span class="text-green-500 flex-shrink-0">●</span>
									{:else if branch.remote}
										<span class="text-gray-400 flex-shrink-0 text-[10px]">↗</span>
									{:else}
										<span class="text-gray-300 dark:text-gray-600 flex-shrink-0">○</span>
									{/if}
									<span class="font-mono truncate {branch.current ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}">
										{branch.name}
									</span>
								</div>
								<span class="text-[10px] text-gray-400 flex-shrink-0 ml-2">{branch.date}</span>
							</button>
						{/if}
					{:else}
						<div class="text-xs text-gray-400 px-2 py-1">No branches</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Changes -->
		{#if modified.length > 0 || staged.length > 0 || untracked.length > 0}
			<div class="border-b border-gray-100 dark:border-gray-800">
				{#if staged.length > 0}
					<div class="px-3 pt-2 pb-0.5">
						<span class="text-[10px] uppercase tracking-wider text-green-500 font-semibold">Staged</span>
					</div>
					{#each staged as file (file)}
						<button
							class="flex items-center gap-2 w-full px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
							class:bg-gray-100={selectedFile === file}
							class:dark:bg-gray-700={selectedFile === file}
							on:click={() => viewDiff(file, true)}
						>
							<span class="text-green-500 font-bold w-3 flex-shrink-0">S</span>
							<span class="font-mono truncate text-gray-600 dark:text-gray-400">{file}</span>
						</button>
					{/each}
				{/if}

				{#if modified.length > 0}
					<div class="px-3 pt-2 pb-0.5">
						<span class="text-[10px] uppercase tracking-wider text-yellow-500 font-semibold">Modified</span>
					</div>
					{#each modified as file (file)}
						<button
							class="flex items-center gap-2 w-full px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
							class:bg-gray-100={selectedFile === file}
							class:dark:bg-gray-700={selectedFile === file}
							on:click={() => viewDiff(file)}
						>
							<span class="text-yellow-500 font-bold w-3 flex-shrink-0">M</span>
							<span class="font-mono truncate text-gray-600 dark:text-gray-400">{file}</span>
						</button>
					{/each}
				{/if}

				{#if untracked.length > 0}
					<div class="px-3 pt-2 pb-0.5">
						<span class="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Untracked</span>
					</div>
					{#each untracked as file (file)}
						<div class="flex items-center gap-2 px-3 py-1 text-xs">
							<span class="text-gray-400 font-bold w-3 flex-shrink-0">?</span>
							<span class="font-mono truncate text-gray-500">{file}</span>
						</div>
					{/each}
				{/if}
			</div>
		{:else}
			<div class="text-xs text-gray-400 py-3 text-center border-b border-gray-100 dark:border-gray-800">Working tree clean</div>
		{/if}

		<!-- Diff viewer -->
		{#if selectedFile && !diffLoading && diffContent}
			<div class="p-2 border-b border-gray-100 dark:border-gray-800" style="max-height: 250px; overflow: auto;">
				<div class="flex items-center justify-between mb-1">
					<span class="text-[10px] font-mono text-gray-400 truncate">{selectedFile}</span>
					<button class="text-[10px] text-gray-400 hover:text-gray-600" on:click={() => (selectedFile = null)}>close</button>
				</div>
				<pre class="text-[11px] font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-400">{diffContent}</pre>
			</div>
		{:else if diffLoading}
			<div class="flex items-center justify-center py-3 text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800">Loading diff...</div>
		{/if}

		<!-- Commit & Push -->
		<div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
			<div class="flex gap-1.5">
				<input
					type="text"
					bind:value={commitMessage}
					placeholder="Commit message..."
					class="flex-1 text-xs px-2 py-1.5 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none"
					on:keydown={(e) => { if (e.key === 'Enter' && commitMessage.trim()) doCommitAndPush(); }}
				/>
				<button
					class="text-[11px] px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap {commitMessage.trim()
						? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300'
						: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}"
					disabled={!commitMessage.trim() || committing}
					on:click={doCommitAndPush}
				>
					{committing ? '...' : 'Commit & Push'}
				</button>
			</div>
		</div>

		<!-- Actions row -->
		<div class="flex gap-1.5 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
			<button
				class="flex-1 text-[11px] px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
				disabled={pulling}
				on:click={doPull}
			>
				{pulling ? '...' : 'Pull'}
			</button>
			<button
				class="flex-1 text-[11px] px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
				disabled={pushing}
				on:click={doPush}
			>
				{pushing ? '...' : 'Push'}
			</button>
		</div>

		<!-- .gitignore (collapsible) -->
		<div class="border-b border-gray-100 dark:border-gray-800">
			<button
				class="flex items-center justify-between w-full px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
				on:click={() => { showGitignore ? (showGitignore = false) : loadGitignore(); }}
			>
				.gitignore
				<span class="text-[10px]">{showGitignore ? '▼' : '▶'}</span>
			</button>
			{#if showGitignore}
				<div class="px-3 pb-2">
					<textarea
						bind:value={gitignoreContent}
						class="w-full text-[11px] font-mono p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none resize-y"
						rows="6"
					></textarea>
					<button
						class="mt-1 text-[11px] px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
						disabled={gitignoreSaving}
						on:click={doSaveGitignore}
					>
						{gitignoreSaving ? 'Saving...' : 'Save .gitignore'}
					</button>
				</div>
			{/if}
		</div>

		<!-- Log (collapsible) -->
		<div>
			<button
				class="flex items-center justify-between w-full px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
				on:click={() => { showLog ? (showLog = false) : loadLog(); }}
			>
				Log
				<span class="text-[10px]">{showLog ? '▼' : '▶'}</span>
			</button>
			{#if showLog}
				<div class="px-3 pb-2 space-y-0.5">
					{#each commits as commit (commit.hash)}
						<div class="flex items-center gap-2 py-0.5 text-xs">
							<span class="font-mono text-yellow-500 flex-shrink-0">{commit.hash.slice(0, 7)}</span>
							<span class="text-gray-600 dark:text-gray-400 truncate">{commit.message}</span>
						</div>
					{:else}
						<div class="text-xs text-gray-400 py-1">No commits</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
