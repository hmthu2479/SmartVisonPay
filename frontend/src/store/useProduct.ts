import { create } from "zustand";
import type { Product } from "../models/product";

const API_URL = import.meta.env.VITE_API_URL;

interface ProductStore {
  products: Product[];
  productsInCart: Product[];
  fetchProduct: () => void;
  addProduct: (name: string, price: number, quantity?: number, storeId?: string) => void;
  updateProduct: (productId: string, name?: string, quantity?: number, storeId?: string, price?: number) => void;
  deleteProduct: (Ids: string[]) => void;
  searchProducts: (searchTerm: string) => void;
  fetchProductBystore: (storeId: string) => void;
  fetchProductsByName: (productsName: string[], storeId: string) => void;
  isAddProducts: boolean,
  setIsAddProducts: (value: boolean) => void,
  clearProducts: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  productsInCart: [],
  isAddProducts: false,
  setIsAddProducts: (value: boolean) => set({ isAddProducts: value }),
  clearProducts: () => set({ productsInCart: [] }),

  fetchProduct: async () => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/product/all`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status);
      return;
    }

    const data = await res.json();
    if (data.length === 0) {
      set({ products: [] });
    }
    set({ products: data });
  },

  fetchProductBystore: async (storeId) => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ storeId }),
    });

    if (!res.ok) {
      console.error("Failed to get products by store:", res.status);
      return;
    }

    const data = await res.json();
    if (data.length === 0) {
      set({ products: [] });
    }
    set({ products: data });
  },


  fetchProductsByName: async (productsName, storeId) => {
    const token = localStorage.getItem("kioskToken");
    if (!storeId || !productsName?.length) return;
    const { isAddProducts } = get();
    // remove duplicates before sending to API
    const uniqueNames = [...new Set(productsName)];

    const res = await fetch(`${API_URL}/product/name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ productsName: uniqueNames, storeId }),
    });

    const data = await res.json();

    // Add quantity from productsName array
    const withQuantity = data.map((p: Product) => ({
      ...p,
      quantity: productsName.filter((n) => n === p.name).length,
    }));
    if (isAddProducts) {
      set((state) => {
        const updated = [...state.productsInCart];

        withQuantity.forEach((newProd:Product) => {
          const existing = updated.find((p) => p._id === newProd._id);
          if (existing) {
            existing.quantity = (existing.quantity || 0) + (newProd.quantity || 0);
          } else {
            updated.push(newProd);
          }
        });

        return { productsInCart: updated, isAddProducts: false };
      });
    } else {
      set({ productsInCart: withQuantity });
    }
  },

  addProduct: async (name, price, quantity, storeId) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/product/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `${token}`, },
      body: JSON.stringify({ name, price, quantity, storeId }),
    });
    get().fetchProduct();
  },
  updateProduct: async (productId, name, quantity, storeId, price) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/product/update/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({ name, quantity, storeId, price }),
    });

    get().fetchProduct(); // Refresh list
  },

  deleteProduct: async (Ids) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/product/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({ productIds: Ids }),
    });

    get().fetchProduct(); // Refresh list
  },
  searchProducts: async (searchTerm) => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/search/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ searchTerm }),
    });

    if (!res.ok) {
      console.error("Failed to search products:", res.status);
      return;
    }

    const data = await res.json();
    if (data.length === 0) {
      set({ products: [] });
    }
    set({ products: data });
  }
}));