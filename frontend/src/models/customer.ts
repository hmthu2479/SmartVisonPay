export interface Customer {
    _id: string,
    name: string,
    points: number,
    phone: string
}
export interface CustomerDB {
    customers: Customer[]
}