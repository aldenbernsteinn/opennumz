import { WEBUI_BASE_URL } from '$lib/constants';

export type NumzModelInfo = {
	name: string;
	displayName: string;
	description: string;
	contextWindow: number;
	vramGB: number;
	active: boolean;
};

export type NumzModelsResponse = {
	active: string;
	models: NumzModelInfo[];
};

export type SwitchResponse = {
	success: boolean;
	active: string;
	message: string;
};

export const getNumzModels = async (token: string = ''): Promise<NumzModelsResponse> => {
	const res = await fetch(`${WEBUI_BASE_URL}/api/numz/models`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		}
	});
	if (!res.ok) throw new Error(`Failed to fetch numz models: ${res.status}`);
	return res.json();
};

export const switchNumzModel = async (
	token: string,
	model: string
): Promise<SwitchResponse> => {
	const res = await fetch(`${WEBUI_BASE_URL}/api/numz/switch`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ model })
	});
	if (!res.ok) throw new Error(`Failed to switch model: ${res.status}`);
	return res.json();
};
