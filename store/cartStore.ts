import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Unique ID (gabungan productId + size + color)
  productId: string;
  nama: string;
  harga: number;
  gambar: string;
  ukuran: string;
  warna: string;
  jumlah: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, jumlah: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const id = `${item.productId}-${item.ukuran}-${item.warna}`;
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === id);

        if (existingItem) {
          // Jika item dengan ukuran & warna sama sudah ada, tambah jumlahnya
          set({
            items: currentItems.map((i) =>
              i.id === id ? { ...i, jumlah: i.jumlah + item.jumlah } : i
            ),
          });
        } else {
          // Jika barang baru
          set({ items: [...currentItems, { ...item, id }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, jumlah) => {
        if (jumlah < 1) return; // Tidak boleh kurang dari 1, kalau mau hapus pakai removeItem
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, jumlah } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.jumlah, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.harga * item.jumlah, 0);
      },
    }),
    {
      name: "toko-online-cart", // Kunci penyimpanan di LocalStorage
    }
  )
);
