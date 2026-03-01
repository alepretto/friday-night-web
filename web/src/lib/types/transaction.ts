export interface Transaction {
	id: string;
	dateTransaction: string;
	category: string;
	subcategory: string;
	paymentMethod: string;
	type: 'outcome' | 'income';
	value: number;
	description: string | null;
	tagId: string;
	paymentMethodId: string;
	cardId: string | null;
	currencyId: string;
}
