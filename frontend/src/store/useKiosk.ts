import { create } from "zustand";
import { persist } from "zustand/middleware"; // ✅ missing import
import type { Kiosk } from "../models/kiosk";

const API_URL = import.meta.env.VITE_API_URL;

interface KioskStore {
  kiosks: Kiosk[];
  fetchKiosk: () => Promise<void>;
  kioskGetByCode: Kiosk | null;
  addKiosk: (storeId: string, location: string) => Promise<void>;
  updateKiosk: (kioskId: string, storeId?: string, location?: string) => Promise<void>;
  deleteKiosk: (Ids: string[]) => Promise<void>;
  getKioskByCode: (code: string) => Promise<Kiosk | null>;
}

export const useKioskStore = create<KioskStore>()(
  persist(
    (set, get) => ({
      kiosks: [],
      kioskGetByCode: null,

      fetchKiosk: async () => {
        const token = localStorage.getItem("adminToken");

        const res = await fetch(`${API_URL}/kiosk/all`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch kiosks:", res.status);
          return;
        }

        const data = await res.json();
        set({ kiosks: data.length ? data : [] });
      },

      getKioskByCode: async (code) => {
        const token = localStorage.getItem("kioskToken");
        const res = await fetch(`${API_URL}/kiosk/code/${code}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `${token}` },
        });

        if (!res.ok) {
          console.error("Failed to get kiosk from code:", res.status);
          return null;
        }

        const data = await res.json();
        const kiosk = data ? data : null;
        set({ kioskGetByCode: kiosk });
        return kiosk;
      },

      addKiosk: async (storeId, location) => {
        const token = localStorage.getItem("adminToken");
        await fetch(`${API_URL}/kiosk/new`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `${token}` },
          body: JSON.stringify({ storeId, location }),
        });
        await get().fetchKiosk();
      },

      updateKiosk: async (kioskId, storeId, location) => {
        const token = localStorage.getItem("adminToken");
        await fetch(`${API_URL}/kiosk/update/${kioskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `${token}` },
          body: JSON.stringify({ location, storeId }),
        });
        await get().fetchKiosk();
      },

      deleteKiosk: async (Ids) => {
        const token = localStorage.getItem("adminToken");
        await fetch(`${API_URL}/kiosk/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `${token}` },
          body: JSON.stringify({ kioskIds: Ids }),
        });
        await get().fetchKiosk();
      },
    }),
    {
      name: "kiosk-storage", // ✅ localStorage key
      partialize: (state) => ({ kioskGetByCode: state.kioskGetByCode }), // ✅ only save this key
    }
  )
);
