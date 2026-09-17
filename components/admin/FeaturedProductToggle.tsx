"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, StarOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ProdukItem {
  id: string;
  nama: string;
  slug: string;
  hargaAsli: number;
  hargaDiskon: number | null;
  isFeatured: boolean;
  kategori: { nama: string };
  images: { url: string }[];
}

interface Props {
  products: ProdukItem[];
}

export default function FeaturedProductToggle({ products }: Props) {
  const [items, setItems] = useState<ProdukItem[]>(products);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleFeatured = async (id: string, current: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/produk/featured", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFeatured: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status");

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFeatured: !current } : item
        )
      );
      toast.success(!current ? "Produk ditambahkan ke Koleksi Terpopuler!" : "Produk dihapus dari Koleksi Terpopuler");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const featured = items.filter((i) => i.isFeatured);
  const notFeatured = items.filter((i) => !i.isFeatured);

  const ProductRow = ({ item }: { item: ProdukItem }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      item.isFeatured
        ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800/40"
        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40"
    }`}>
      {/* Gambar */}
      <div className="relative w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
        {item.images[0]?.url ? (
          <Image src={item.images[0].url} alt={item.nama} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{item.nama}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{item.kategori.nama}</p>
      </div>

      {/* Harga */}
      <div className="text-right hidden sm:block mr-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Rp {(item.hargaDiskon || item.hargaAsli).toLocaleString("id-ID")}
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => toggleFeatured(item.id, item.isFeatured)}
        disabled={loadingId === item.id}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 shrink-0 ${
          item.isFeatured
            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-gray-600 dark:text-gray-300 hover:text-yellow-600"
        }`}
        title={item.isFeatured ? "Hapus dari Koleksi Terpopuler" : "Tambah ke Koleksi Terpopuler"}
      >
        {loadingId === item.id ? (
          <Loader2 size={14} className="animate-spin" />
        ) : item.isFeatured ? (
          <><Star size={14} fill="currentColor" /> Featured</>
        ) : (
          <><StarOff size={14} /> Pin</>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-300">
        <strong>Cara kerja:</strong> Produk yang di-<strong>Pin</strong> akan muncul di section{" "}
        <em>&quot;Koleksi Terpopuler&quot;</em> di homepage. Jika tidak ada produk yang di-pin, homepage akan menampilkan produk berdasarkan penjualan terbanyak.
      </div>

      {/* Featured products */}
      {featured.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
            <Star size={14} fill="currentColor" />
            Tampil di Homepage ({featured.length} produk)
          </h3>
          <div className="space-y-2">
            {featured.map((item) => (
              <ProductRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Not featured products */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Semua Produk ({notFeatured.length} produk)
        </h3>
        <div className="space-y-2">
          {notFeatured.map((item) => (
            <ProductRow key={item.id} item={item} />
          ))}
        </div>
        {notFeatured.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Semua produk sudah di-featured</p>
        )}
      </div>
    </div>
  );
}