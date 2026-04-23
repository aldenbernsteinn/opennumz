<script lang="ts">
	import '$lib/utils/codemirror';
	import { EditorView } from 'codemirror';
	import { EditorState, Compartment } from '@codemirror/state';
	import { LanguageDescription } from '@codemirror/language';
	import { languages } from '@codemirror/language-data';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { MergeView } from '@codemirror/merge';
	import { onMount, onDestroy } from 'svelte';

	export let oldContent: string = '';
	export let newContent: string = '';
	export let filename: string = '';
	export let onClose: (() => void) | null = null;

	let container: HTMLDivElement;
	let mergeView: MergeView | null = null;

	const detectLanguageExtension = async (path: string) => {
		if (!path) return [];
		const match = LanguageDescription.matchFilename(languages, path);
		if (match) {
			const lang = await match.load();
			if (lang) return [lang];
		}
		return [];
	};

	const sharedTheme = EditorView.theme({
		'&': { fontSize: '0.75rem' },
		'.cm-content': {
			padding: '0.5rem 0',
			fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
		},
		'.cm-scroller': { overflow: 'auto' },
		'.cm-focused': { outline: 'none' }
	});

	onMount(async () => {
		const isDark = document.documentElement.classList.contains('dark');
		const langExt = await detectLanguageExtension(filename);
		const themeExt = isDark ? oneDark : [];

		const extensions = [
			sharedTheme,
			themeExt,
			...langExt,
			EditorState.readOnly.of(true),
		];

		mergeView = new MergeView({
			a: {
				doc: oldContent,
				extensions,
			},
			b: {
				doc: newContent,
				extensions,
			},
			parent: container,
			collapseUnchanged: { margin: 3, minSize: 4 },
		});

		// Watch dark mode
		const observer = new MutationObserver(() => {
			// MergeView doesn't support compartment reconfigure easily,
			// so we rebuild on theme change
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => {
			observer.disconnect();
		};
	});

	onDestroy(() => {
		mergeView?.destroy();
		mergeView = null;
	});
</script>

<div class="diff-viewer flex flex-col h-full">
	<div class="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs">
		<span class="font-mono text-gray-600 dark:text-gray-400 truncate">{filename}</span>
		{#if onClose}
			<button
				class="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
				on:click={onClose}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
					<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
				</svg>
			</button>
		{/if}
	</div>
	<div bind:this={container} class="diff-container flex-1 overflow-auto" />
</div>

<style>
	.diff-viewer {
		border: 1px solid;
		border-color: var(--border-color, rgba(128,128,128,0.2));
		border-radius: 0.375rem;
		overflow: hidden;
	}
	.diff-container :global(.cm-mergeView) {
		height: 100%;
	}
	.diff-container :global(.cm-mergeViewEditor) {
		height: 100%;
	}
	.diff-container :global(.cm-editor) {
		height: 100%;
	}
</style>
