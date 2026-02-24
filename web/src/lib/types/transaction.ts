

export interface Transaction {
    id: number
    dateTransaction: string
    category: string
    subcategory: string
    paymentMethod: string
    type: 'outcome' | 'income'
    value: number
    description: string | null
}