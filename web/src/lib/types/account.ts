export type AccountType = 'bank' | 'investment' | 'cash' | 'benefit';
export type AccountStatus = 'activate' | 'deactivate';

export interface Account {
	id: string;
	institution: string;
	institutionId: string;
	status: AccountStatus;
	type: AccountType;
	logoPath: string;
	subtype?: string | null;
}

export interface CardInfo {
	id: string;
	label: string;
	flag: 'visa' | 'mastercard';
	close_day: number;
	due_day: number;
	limit: number;
}
