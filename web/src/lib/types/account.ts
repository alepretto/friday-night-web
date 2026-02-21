

export type AccountType = 'bank' | 'investment' | 'cash' | 'benefict';

export interface Account {
    id: number;
    institution: string;
    active: boolean;
    type: AccountType;
    logoPath: string;
    subtype?: string | null;
}