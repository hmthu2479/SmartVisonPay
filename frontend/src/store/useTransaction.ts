import { create } from "zustand";
import type { Transaction } from "../models/transaction";
import type { Product } from "../models/product";
const API_URL = import.meta.env.VITE_API_URL;

interface TransactionStore {
  transactions: Transaction[];
  products: Product[];
  fetchTransactions: () => Promise<void>;
  getTransactionById: (transactionId: string) => Promise<Transaction>;
  addTransaction: (t: Transaction) => Promise<void>;
  updateTransaction: (id: string, updated: Partial<Transaction>) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  products: [],

  fetchTransactions: async () => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/transaction/all`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch transactions:", res.status);
      return;
    }

    const data = await res.json();
    console.log("🚀 ~ data:", data)
    if (data.length === 0) {
      set({ transactions: [] });
    }
    set({ transactions: data });
  },

  getTransactionById: async (transactionId): Promise<Transaction> => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/transaction/${transactionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch transaction: ${res.statusText}`);
    }

    const data = await res.json();
    return data.transaction || data;
  },
  addTransaction: async (t) => {
    const token = localStorage.getItem("kioskToken");
    const res = await fetch(`${API_URL}/transaction/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({
        storeId: t.store,
        kioskCode: t.kiosk,
        customerName: t.customer,
        products: t.products,
        paymentMethod: t.paymentMethod,
        discount: t.discount || 0,
        kioskToken: token
      }),
    });

    const newTransaction = await res.json();
    if (newTransaction.zaloPay?.orderurl) {
      window.location.href = newTransaction.zaloPay.orderurl; // redirect to ZaloPay
    }
    set((state) => ({
      transactions: [...state.transactions, newTransaction],
    }));
    get().fetchTransactions()
  },

  updateTransaction: async (id, updated) => {
    const res = await fetch(`/transaction/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const updatedTransaction = await res.json();
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t._id === id ? updatedTransaction : t
      ),
    }));
  },

}));
