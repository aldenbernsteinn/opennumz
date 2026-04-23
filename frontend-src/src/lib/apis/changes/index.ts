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
