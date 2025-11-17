import { create } from "zustand";
import type { Store } from "../models/store";

const API_URL = import.meta.env.VITE_API_URL;

interface ShopStore {
  stores: Store[];
  fetchShop: () => void;
  addShop: (address: string) => void;
  updateShop: (storeId: string, address: string) => void;
  deleteShop: (Ids: string[]) => void;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  stores: [],
  fetchShop: async () => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/store/all`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch stores:", res.status);
      return;
    }

    const data = await res.json();
    if (data.length === 0) {
      set({ stores: [] });
    }
    set({ stores: data });
  },


  addShop: async (address) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/store/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({ address }),
    });
    get().fetchShop(); // Refresh list
  },
  updateShop: async (storeId, address) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/store/update/${storeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({ address }),
    });

    get().fetchShop(); // Refresh list
  },


  deleteShop: async (Ids) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/store/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({ storeIds: Ids }),
    });
    get().fetchShop(); // Refresh list
  },
}));