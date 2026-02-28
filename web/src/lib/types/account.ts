export type AccountType = 'bank' | 'investment' | 'cash' | 'benefict';

export interface Account {
	id: number;
	institution: string;
	active: boolean;
	type: AccountType;
	logoPath: string;
	subtype?: string | null;
}

export interface CardInfo {
	id: number;
	name: string;
	flag: 'visa' | 'mastercard';
	closing_day: number;
	due_day: number;
	limit: number;
	bill: number;
	total_bill: number;
}
