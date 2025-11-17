import type { Store } from "./store";

export interface Product{
    _id:string;
    name:string,
    price:number,
    quantity?:number,
    store:Store
}

export interface ProductDB{
    products: Product[];
}