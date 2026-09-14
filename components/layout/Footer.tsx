import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

// --- Custom Brand Icons SVG ---
const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.1C2.5 7.1 2.3 5.4 3 4.6 3.8 3.6 4.9 3.6 5.4 3.5 8 3.3 12 3.3 12 3.3s4 0 6.6.2c.5.1 1.6.1 2.4 1.1.7.8.5 2.5.5 2.5s.2 2 .2 4v2c0 2-.2 4-.2 4s.2 1.7-.5 2.5c-.8 1-1.9 1-2.4 1.1-2.6.2-6.6.2-6.6.2s-4 0-6.6-.2c-.5-.1-1.6-.1-2.4-1.1-.7-.8-.5-2.5-.5-2.5s-.2-2-.2-4v-2c0-2 .2-4 .2-4z" />
    <polygon points="9.75 15.02 15.5 11.96 9.75 8.89 9.75 15.02" />
  </svg>
);
// ------------------------------

const linksToko = [
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Panduan Belanja", href: "/panduan" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontak Kami", href: "/kontak" },
  { label: "Lokasi Toko", href: "/lokasi" },
];

const linksPelanggan = [
  { label: "Akun Saya", href: "/akun" },
  { label: "Riwayat Pesanan", href: "/akun/pesanan" },
  { label: "Wishlist", href: "/akun/wishlist" },
  { label: "Poin & Reward", href: "/akun/poin" },
  { label: "Tukar Ukuran", href: "/akun/tukar-ukuran" },
];

const linksKategori = [
  { label: "Kemeja", href: "/kategori/kemeja" },
  { label: "Kaos", href: "/kategori/kaos" },
  { label: "Celana", href: "/kategori/celana" },
  { label: "Jaket", href: "/kategori/jaket" },
  { label: "Shop The Look", href: "/shop-the-look" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-app py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kolom 1: Info Toko */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="relative w-10 h-10 overflow-hidden bg-white rounded-lg shadow-sm">
                <Image 
                  src="/images/irwa-logo.png" 
                  alt="Irwa Fashion House Logo" 
                  fill 
                  className="object-contain scale-[2] group-hover:scale-[2.1] transition-transform"
                  sizes="40px"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white leading-none">IRWA</span>
                <span className="text-xs font-light text-gray-400 leading-none">FASHION <span className="text-[9px]">HOUSE</span></span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Toko pakaian pria berkualitas dengan pilihan lengkap — kemeja, kaos, celana, jaket & aksesoris.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>Jl. Contoh No. 123, Kota Anda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <a href="tel:+6281234567890" className="hover:text-white transition-colors">
                  0812-3456-7890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <a href="mailto:info@tokoonline.com" className="hover:text-white transition-colors">
                  info@tokoonline.com
                </a>
              </div>
            </div>
          </div>

          {/* Kolom 2: Link Toko */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Informasi</h4>
            <ul className="space-y-2">
              {linksToko.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                  >
                    <ChevronRight size={12} className="text-primary" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Akun Pelanggan */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Akun Pelanggan</h4>
            <ul className="space-y-2">
              {linksPelanggan.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                  >
                    <ChevronRight size={12} className="text-primary" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Kategori & Sosmed */}
          <div className="space-y-6">
            <div>
              <h4 className="font-heading font-semibold text-white mb-4">Kategori</h4>
              <ul className="space-y-2">
                {linksKategori.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                    >
                      <ChevronRight size={12} className="text-primary" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-white mb-3">Ikuti Kami</h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: InstagramIcon, href: "#", label: "Instagram" },
                  { icon: FacebookIcon, href: "#", label: "Facebook" },
                  { icon: YoutubeIcon, href: "#", label: "YouTube" },
                  { icon: MessageCircle, href: "#", label: "WhatsApp" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="w-8 h-8 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-app py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Toko Online. Semua hak dilindungi.</span>
          <div className="flex items-center gap-4">
            <Link href="/privasi" className="hover:text-gray-300 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat" className="hover:text-gray-300 transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
