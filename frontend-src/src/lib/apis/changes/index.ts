import { WEBUI_API_BASE_URL } from '$lib/constants';

const BASE = `${WEBUI_API_BASE_URL}/changes`;

export const hasGit = async (
	token: string,
	serverId: string,
	cwd?: string
): Promise<{ has_git: boolean }> => {
	const params = new URLSearchParams();
	if (cwd) params.set('cwd', cwd);
	const url = `${BASE}/${serverId}/has-git?${params}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!res || !res.ok) return { has_git: false };
	return res.json().catch(() => ({ has_git: false }));
};

export const getGitStatus = async (
	token: string,
	serverId: string,
	cwd?: string
): Promise<{
	has_git: boolean;
	modified: string[];
	staged: string[];
	untracked: string[];
}> => {
	const params = new URLSearchParams();
	if (cwd) params.set('cwd', cwd);
	const url = `${BASE}/${serverId}/status?${params}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!res || !res.ok) return { has_git: false, modified: [], staged: [], untracked: [] };
	return res.json().catch(() => ({ has_git: false, modified: [], staged: [], untracked: [] }));
};

export const getGitDiff = async (
	token: string,
	serverId: string,
	cwd?: string,
	path?: string,
	staged?: boolean
): Promise<string> => {
	const params = new URLSearchParams();
	if (cwd) params.set('cwd', cwd);
	if (path) params.set('path', path);
	if (staged) params.set('staged', 'true');
	const url = `${BASE}/${serverId}/diff?${params}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!res || !res.ok) return '';
	const data = await res.json().catch(() => ({}));
	return data.diff ?? '';
};

export const getGitLog = async (
	token: string,
	serverId: string,
	cwd?: string,
	count?: number
): Promise<{ has_git: boolean; commits: { hash: string; message: string }[] }> => {
	const params = new URLSearchParams();
	if (cwd) params.set('cwd', cwd);
	if (count) params.set('count', String(count));
	const url = `${BASE}/${serverId}/log?${params}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!res || !res.ok) return { has_git: false, commits: [] };
	return res.json().catch(() => ({ has_git: false, commits: [] }));
};

export const getCurrentBranch = async (
	token: string,
	serverId: string,
	cwd?: string
): Promise<string> => {
	const params = new URLSearchParams();
	if (cwd) params.set('cwd', cwd);
	const url = `${BASE}/${serverId}/current-branch?${params}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!res || !res.ok) return '';
	const data = await res.json().catch(() => ({}));
	return data.branch ?? '';
};

export const getBranches = async (
	token: string,
	serverId: string,
	cwd?: string
): Promise<{ name: string; upstream: string; current: boolean; date: string; remote: boolean }[]> => {
	const params = new URLSearchParams();
	if (cwd) params.set('cwd', cwd);
	const url = `${BASE}/${serverId}/branches?${params}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!res || !res.ok) return [];
	const data = await res.json().catch(() => ({}));
	return data.branches ?? [];
};

export const checkout = async (
	token: string,
	serverId: string,
	branch: string,
	create: boolean = false,
	cwd?: string
): Promise<{ ok: boolean; output: string }> => {
	const url = `${BASE}/${serverId}/checkout`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ branch, create, cwd })
	}).catch(() => null);
	if (!res || !res.ok) return { ok: false, output: 'Request failed' };
	return res.json().catch(() => ({ ok: false, output: 'Parse error' }));
};

export const commitChanges = async (
	token: string,
	serverId: string,
	message: string,
	cwd?: string
): Promise<{ ok: boolean; output: string }> => {
	const url = `${BASE}/${serverId}/commit`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, cwd })
	}).catch(() => null);
	if (!res || !res.ok) return { ok: false, output: 'Request failed' };
	return res.json().catch(() => ({ ok: false, output: 'Parse error' }));
};

export const pushChanges = async (
	token: string,
	serverId: string,
	cwd?: string
): Promise<{ ok: boolean; output: string }> => {
	const url = `${BASE}/${serverId}/push`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ cwd })
	}).catch(() => null);
	if (!res || !res.ok) return { ok: false, output: 'Request failed' };
	return res.json().catch(() => ({ ok: false, output: 'Parse error' }));
};

export const pullChanges = async (
	token: string,
	serverId: string,
	cwd?: string
): Promise<{ ok: boolean; output: string }> => {
	const url = `${BASE}/${serverId}/pull`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ cwd })
	}).catch(() => null);
	if (!res || !res.ok) return { ok: false, output: 'Request failed' };
	return res.json().catch(() => ({ ok: false, output: 'Parse error' }));
};

export const getGitignore = async (
	token: string,
	serverId: string,
	cwd?: string
): Promise<string> => {
	const params = new URLSearchParams();
	if (cwd) params.set('cwd', cwd);
	const url = `${BASE}/${serverId}/gitignore?${params}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!res || !res.ok) return '';
	const data = await res.json().catch(() => ({}));
	return data.content ?? '';
};

export const saveGitignore = async (
	token: string,
	serverId: string,
	content: string,
	cwd?: string
): Promise<{ ok: boolean }> => {
	const url = `${BASE}/${serverId}/gitignore`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ content, cwd })
	}).catch(() => null);
	if (!res || !res.ok) return { ok: false };
	return res.json().catch(() => ({ ok: false }));
};
