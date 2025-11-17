import type { Store } from "./store";

export interface Kiosk {
    _id: string,
    store?: Store,
    code: string,
    location: string,
}
export interface KioskDB{
    kiosks: Kiosk[];
}