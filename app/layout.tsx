import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

import FCMHandler from "@/components/notifikasi/FCMHandler";

export const metadata: Metadata = {
  title: {
    default: "Irwa Fashion House - Pakaian Pria Berkualitas",
    template: "%s | Irwa Fashion",
  },
  description:
    "Temukan koleksi pakaian pria terlengkap - kemeja, kaos, celana, jaket. Gratis ongkir, bisa tukar ukuran, dan tersedia layanan alterasi.",
  keywords: ["pakaian pria", "kemeja pria", "celana pria", "jaket pria", "irwa fashion", "fashion house"],
  openGraph: {
    title: "Irwa Fashion House - Pakaian Pria Berkualitas",
    description: "Koleksi pakaian pria terlengkap dengan harga terbaik.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans bg-white text-gray-800 antialiased overflow-x-hidden">
        <NextTopLoader
          color="#2563EB"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563EB,0 0 5px #2563EB"
        />
        <FCMHandler />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              borderRadius: "10px",
            },
            success: {
              iconTheme: { primary: "#28A745", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#DC3545", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
