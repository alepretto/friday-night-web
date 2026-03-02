import type { Actions, PageData } from '@sveltejs/kit';

// Tipos para os dados retornados pelo load
export interface Account {
	id: string;
	label: string;
	type: string;
}

export interface AccountType {
	id: string;
	label: string;
}

export interface PageData {
	accounts: Account[];
	accountTypes: AccountType[];
}

// Tipos para os dados retornados pelas actions
export interface ActionData {
	error?: string;
	success?: boolean;
	needsLink?: boolean;
	redirectUrl?: string;
}

// Exportar para uso no componente
export type { Actions };