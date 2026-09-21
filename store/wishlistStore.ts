import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string; // unique ID (produkId atau koleksiId)
  type: "produk" | "koleksi";
  nama: string;
  link: string; // url menuju halaman produk/koleksi
  harga: number;
  hargaAsli?: number | null;
  gambar: string;
  kategori?: string | null;
  stok?: number | null;
  ukuranDefault?: string;
  warnaDefault?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => boolean; // return true jika ditambah, false jika dihapus
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const currentItems = get().items;
        if (!currentItems.some((i) => i.id === item.id)) {
          set({ items: [item, ...currentItems] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      toggleWishlist: (item) => {
        const currentItems = get().items;
        const exists = currentItems.some((i) => i.id === item.id);
        if (exists) {
          set({ items: currentItems.filter((i) => i.id !== item.id) });
          return false;
        } else {
          set({ items: [item, ...currentItems] });
          return true;
        }
      },

      isWishlisted: (id) => {
        return get().items.some((i) => i.id === id);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "irwa-wishlist-storage",
    }
  )
);
