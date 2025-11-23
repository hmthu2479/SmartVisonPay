export enum PaymentMethod {
  ZALOPAY = "ZALOPAY",
  MOMO = "MOMO",
}

export interface Transaction {
  _id?: string;
  code?:string;
  store: string; //Store address
  kiosk: string; //kiosk code
  products: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  discount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  dateTime: string;
  customer?: string | null;
  status?:string;
  pointsToUse?:string,
}

