import Link from "next/link";
import { MapPin, Phone, Clock, Navigation, ArrowLeft, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Lokasi Toko | Irwa Fashion",
  description: "Kunjungi toko fisik Irwa Fashion House untuk mencoba pakaian langsung.",
};

export default function LokasiPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
        <div className="container-app">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Lokasi Toko Fisik
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kunjungi butik Irwa Fashion House untuk melihat dan mencoba koleksi pakaian pria kami secara langsung.
          </p>
        </div>
      </div>

      <div className="container-app py-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
              <MapPin size={14} /> Official Store & Outlet
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">Irwa Fashion House</h2>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Jalan Harapan Jaya No 17 B, Labu Baru Barat, Kecamatan Payung sekaki, Pekanbaru, Riau
              </p>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary shrink-0" />
                <span>Buka Setiap Hari: <strong>09.00 - 21.00 WIB</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-primary shrink-0" />
                <span>Customer Service: <strong>0831-9911-6298</strong></span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/place/Jl.+Harapan+Jaya,+Labuh+Baru+Bar.,+Kec.+Payung+Sekaki,+Kota+Pekanbaru,+Riau/@0.5239513,101.402091,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-xs px-4 py-2.5 flex items-center gap-2 rounded-xl"
              >
                <Navigation size={14} /> Buka di Google Maps
              </a>
              <a
                href="https://wa.me/6283199116298?text=Halo%20Admin%20IRWA,%20saya%20ingin%20tanya%20lokasi%20toko"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-xs px-4 py-2.5 flex items-center gap-2 rounded-xl"
              >
                <MessageCircle size={14} /> Chat Admin
              </a>
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm min-h-[260px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.4268105066803!2d101.4020909744743!3d0.5239512636748074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5abbf5a2012b5%3A0xa8a2582416448a1e!2sJl.%20Harapan%20Jaya%2C%20Labuh%20Baru%20Bar.%2C%20Payung%20Sekaki%2C%20Kota%20Pekanbaru%2C%20Riau!5e1!3m2!1sid!2sid!4v1790218889544!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
