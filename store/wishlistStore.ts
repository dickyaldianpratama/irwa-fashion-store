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
  fetchWishlist: () => Promise<void>;
  setItems: (items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (newItems) => {
        set({ items: newItems });
      },

      addItem: (item) => {
        const currentItems = get().items;
        if (!currentItems.some((i) => i.id === item.id || (item.link && i.link === item.link))) {
          set({ items: [item, ...currentItems] });
        }
        // Sync to database if logged in
        fetch("/api/akun/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            produkId: item.id,
            nama: item.nama,
            harga: item.harga,
            gambar: item.gambar,
          }),
        }).catch(() => {});
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(
            (i) =>
              i.id !== id &&
              i.link !== `/produk/${id}` &&
              !i.link?.endsWith(`/${id}`)
          ),
        });
        // Sync delete to database if logged in
        fetch(`/api/akun/wishlist?produkId=${id}`, {
          method: "DELETE",
        }).catch(() => {});
      },

      toggleWishlist: (item) => {
        const currentItems = get().items;
        const exists = currentItems.some(
          (i) =>
            i.id === item.id ||
            i.link === `/produk/${item.id}` ||
            (item.link && i.link === item.link)
        );
        if (exists) {
          set({
            items: currentItems.filter(
              (i) =>
                i.id !== item.id &&
                i.link !== `/produk/${item.id}` &&
                (!item.link || i.link !== item.link)
            ),
          });
          fetch(`/api/akun/wishlist?produkId=${item.id}`, {
            method: "DELETE",
          }).catch(() => {});
          return false;
        } else {
          set({ items: [item, ...currentItems] });
          fetch("/api/akun/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              produkId: item.id,
              nama: item.nama,
              harga: item.harga,
              gambar: item.gambar,
            }),
          }).catch(() => {});
          return true;
        }
      },

      isWishlisted: (id) => {
        if (!id) return false;
        return get().items.some(
          (i) =>
            i.id === id ||
            i.link === `/produk/${id}` ||
            i.link?.endsWith(`/${id}`)
        );
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      fetchWishlist: async () => {
        try {
          const res = await fetch("/api/akun/wishlist");
          if (!res.ok) {
            set({ items: [] });
            return;
          }
          const resData = await res.json();
          if (resData?.success && Array.isArray(resData.data)) {
            const fetchedItems: WishlistItem[] = resData.data
              .filter((w: any) => w.produk)
              .map((w: any) => {
                const p = w.produk;
                const imgUrl =
                  p.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?q=80&w=600";
                return {
                  id: p.id,
                  type: "produk",
                  nama: p.nama,
                  link: `/produk/${p.slug}`,
                  harga: p.hargaDiskon || p.hargaAsli || 0,
                  hargaAsli: p.hargaAsli,
                  gambar: imgUrl,
                  kategori: p.kategori?.nama || "Pakaian",
                  stok: 10,
                };
              });
            set({ items: fetchedItems });
          } else {
            set({ items: [] });
          }
        } catch (e) {
          // Keep current items if network error
        }
      },
    }),
    {
      name: "irwa-wishlist-storage",
    }
  )
);
