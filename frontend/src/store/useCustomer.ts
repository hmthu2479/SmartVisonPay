import { create } from "zustand";
import type { Customer } from "../models/customer";

const API_URL = import.meta.env.VITE_API_URL;

interface CustomerStore {
  customers: Customer[];
  fetchCustomer: () => void;
  customerGetByPhone?: Customer | null;
  addCustomer: (name: string, phone: string) => void;
  updateCustomer: (customerId: string, name?: string, points?: string) => void;
  deleteCustomer: (Ids: string[]) => void;
  searchCustomers: (searchTerm: string) => void;
  getCustomerByPhone: (phone?: string) => Promise<Customer | null>;
  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  customerGetByPhone: null,
  clearCustomer: () => set({ customerGetByPhone: null }),
  fetchCustomer: async () => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/customer/all`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch customers:", res.status);
      return;
    }

    const data = await res.json();
    console.log("🚀 ~ data:", data)
    if (data.length === 0) {
      set({ customers: [] });
    }
    set({ customers: data });
  },

  getCustomerByPhone: async (phone) => {
    const token = localStorage.getItem("kioskToken");
    const res = await fetch(`${API_URL}/customer/phone/${phone}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
    });

    if (!res.ok) {
      console.error("Failed to get customer from phone:", res.status);
      set({ customerGetByPhone: null });
      return null;
    }

    const data: Customer = await res.json();
    set({ customerGetByPhone: data });
    return data;
  },
  addCustomer: async (name, phone) => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("kioskToken");
    const res = await fetch(`${API_URL}/customer/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `${token}`, },
      body: JSON.stringify({ name, phone }),
    });
    console.log("🚀 ~ res:", res)
    get().fetchCustomer();
  },
  updateCustomer: async (customerId, name, points) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/customer/update/${customerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({ name, points }),
    });

    get().fetchCustomer(); // Refresh list
  },


  deleteCustomer: async (Ids) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API_URL}/customer/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `${token}` },
      body: JSON.stringify({ customerIds: Ids }),
    });

    get().fetchCustomer(); // Refresh list
  },
  searchCustomers: async (searchTerm) => {
    console.log("🚀 ~ searchTerm:", searchTerm)
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/search/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ searchTerm }),
    });

    if (!res.ok) {
      console.error("Failed to search customers:", res.status);
      return;
    }

    const data = await res.json();
    console.log("🚀 ~ data:", data)
    if (data.length === 0) {
      set({ customers: [] });
    }
    set({ customers: data });
  }
}));