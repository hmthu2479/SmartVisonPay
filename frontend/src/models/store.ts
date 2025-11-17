import type { KioskDB } from "./kiosk";
import type { ProductDB } from "./product";

export interface Store{
    _id:string,
    address:string,
    products:ProductDB,
    kiosks: KioskDB
}
export interface StoreDB{
    stores: Store[]
}