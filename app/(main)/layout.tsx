import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import CartDrawer from "@/components/cart/CartDrawer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      
      {/* Bottom Navigation Khusus Mobile */}
      <MobileNav />

      {/* Sidebar Keranjang Global */}
      <CartDrawer />
    </div>
  );
}
