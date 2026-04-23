<script lang="ts">
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import {
		terminalServers,
		selectedTerminalId,
		settings,
		showFileNavDir
	} from '$lib/stores';
	import { readFile, uploadToTerminal, deleteEntry } from '$lib/apis/terminal';
	import FileChangeList from './FileChangeList.svelte';
	import DiffViewer from './DiffViewer.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';

	const i18n = getContext('i18n');

	export let fileChanges: {
		path: string;
		beforeContent: string | null;
		action: string;
	}[] = [];

	let selectedPath: string | null = null;
	let diffOldContent = '';
	let diffNewContent = '';
	let diffLoading = false;
	let showRollbackConfirm = false;
	let rollingBack = false;

	const getTerminal = (): { url: string; key: string } | null => {
		const systemTerminal = $selectedTerminalId
			? (($terminalServers ?? []).find((t) => t.id === $selectedTerminalId) ?? null)
			: ($terminalServers?.[0] ?? null);

		const userTerminal = ($settings?.terminalServers ?? []).find(
			(s) => s.url === $selectedTerminalId
		);

		const isSystem = !!systemTerminal;
		const url = systemTerminal?.url ?? userTerminal?.url ?? '';
		const key = isSystem ? localStorage.token : (userTerminal?.key ?? '');
		return url ? { url, key } : null;
	};

	const selectFile = async (path: string) => {
		if (selectedPath === path) {
			selectedPath = null;
			return;
		}
		selectedPath = path;
		diffLoading = true;

		const change = fileChanges.find((c) => c.path === path);
		if (!change) {
			diffLoading = false;
			return;
		}

		// "before" content from snapshot
		diffOldContent = change.beforeContent ?? '';

		// "after" content = current file on disk
		const terminal = getTerminal();
		if (terminal) {
			const current = await readFile(terminal.url, terminal.key, path);
			diffNewContent = current ?? '';
		} else {
			diffNewContent = '';
		}

		diffLoading = false;
	};

	$: hasRollbackData = fileChanges.some((c) => c.beforeContent !== null || c.action === 'created');

	const doRollback = async () => {
		const terminal = getTerminal();
		if (!terminal) {
			toast.error('No terminal connection');
			return;
		}

		rollingBack = true;
		let errors = 0;

		for (const change of fileChanges) {
			if (change.action === 'created') {
				// File was created — delete it to rollback
				const result = await deleteEntry(terminal.url, terminal.key, change.path);
				if (!result) errors++;
			} else if (change.beforeContent !== null) {
				// File was modified — restore beforeContent
				const fileName = change.path.split('/').pop() ?? 'file';
				const dir = change.path.substring(0, change.path.lastIndexOf('/') + 1) || '/';
				const file = new File([change.beforeContent], fileName, { type: 'text/plain' });
				const result = await uploadToTerminal(terminal.url, terminal.key, dir, file);
				if (!result) errors++;
			}
		}

		rollingBack = false;
		showRollbackConfirm = false;

		if (errors > 0) {
			toast.error(`Rollback completed with ${errors} error(s)`);
		} else {
			toast.success('Rolled back successfully');
		}

		// Refresh file explorer
		showFileNavDir.set('/');

		// Reset diff view
		selectedPath = null;
	};
</script>

<ConfirmDialog
	bind:show={showRollbackConfirm}
	title="Rollback files?"
	message="This will restore all files to their state before this message. This cannot be undone."
	confirmLabel="Rollback"
	onConfirm={doRollback}
/>

<div class="atp-state-panel" transition:slide={{ duration: 200 }}>
	<div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
		<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
			ATP-STATE
		</span>
		<div class="flex items-center gap-2">
			<span class="text-[10px] text-gray-400">
				{fileChanges.length} file{fileChanges.length !== 1 ? 's' : ''} changed
			</span>
			{#if hasRollbackData}
				<button
					class="text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
					disabled={rollingBack}
					on:click={() => (showRollbackConfirm = true)}
				>
					{rollingBack ? 'Rolling back...' : 'Rollback'}
				</button>
			{/if}
		</div>
	</div>

	<FileChangeList
		{fileChanges}
		{selectedPath}
		onSelect={selectFile}
	/>

	{#if selectedPath && !diffLoading}
		<div class="p-2" style="max-height: 400px; overflow: auto;">
			<DiffViewer
				oldContent={diffOldContent}
				newContent={diffNewContent}
				filename={selectedPath}
				onClose={() => (selectedPath = null)}
			/>
		</div>
	{:else if diffLoading}
		<div class="flex items-center justify-center py-4 text-xs text-gray-400">
			Loading diff...
		</div>
	{/if}
</div>

<style>
	.atp-state-panel {
		border: 1px solid rgba(128, 128, 128, 0.2);
		border-radius: 0.375rem;
		margin-top: 0.5rem;
		overflow: hidden;
		background: var(--bg, transparent);
	}
</style>
