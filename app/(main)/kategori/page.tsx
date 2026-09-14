import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";

export default function KategoriPage() {
  const categories = [
    { name: "Kemeja", count: 120, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80" },
    { name: "Kaos", count: 85, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80" },
    { name: "Celana", count: 64, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80" },
    { name: "Jaket", count: 42, image: "https://images.unsplash.com/photo-1551028719-0125867117c7?w=400&q=80" },
  ];

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <LayoutGrid size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori Belanja</h1>
          <p className="text-gray-500 text-sm mt-1">Jelajahi koleksi terbaik kami</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <Link key={idx} href={`/`} className="group block relative rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-white font-bold text-xl mb-1">{cat.name}</h2>
              <p className="text-white/80 text-sm">{cat.count} Produk</p>
            </div>
            <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
