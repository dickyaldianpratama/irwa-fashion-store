import prisma from "@/lib/prisma";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminPelangganClient from "@/components/admin/AdminPelangganClient";
import { checkAdminAuth } from "@/lib/admin-auth";

export const metadata = {
  title: "Manajemen Pelanggan - Admin IRWA",
  description: "Kelola data pelanggan, profil ukuran, poin membership, dan riwayat transaksi",
};

export default async function AdminPelangganPage() {
  const { isAdmin } = await checkAdminAuth();

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      poin: true,
      ukuran: true,
      alamat: {
        orderBy: { isUtama: "desc" },
        take: 3,
      },
      pesanan: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalHarga: true,
          statusPesanan: true,
          createdAt: true,
        },
      },
    },
  });

  const validStatuses = ["DELIVERED", "SHIPPED", "READY_FOR_PICKUP", "PROCESSING", "PAID"];

  const formattedCustomers = customers.map((c) => {
    const validOrders = c.pesanan.filter((o) => validStatuses.includes(o.statusPesanan));
    const totalSpent = validOrders.reduce((sum, o) => sum + o.totalHarga, 0);
    const lastOrder = c.pesanan.length > 0 ? c.pesanan[0] : null;
    const alamatUtama = c.alamat.find((a) => a.isUtama) || c.alamat[0] || null;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || "-",
      avatar: c.avatar,
      birthDate: c.birthDate ? c.birthDate.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      poin: c.poin ? c.poin.saldo : 0,
      levelMember: c.poin ? c.poin.levelMember : "BRONZE",
      ukuran: c.ukuran ? {
        tinggiBadan: c.ukuran.tinggiBadan,
        beratBadan: c.ukuran.beratBadan,
        lingkarDada: c.ukuran.lingkarDada,
        lingkarPinggang: c.ukuran.lingkarPinggang,
        lebarBahu: c.ukuran.lebarBahu,
        panjangLengan: c.ukuran.panjangLengan,
      } : null,
      alamatUtama: alamatUtama ? {
        penerima: alamatUtama.penerima,
        telepon: alamatUtama.telepon,
        kota: alamatUtama.kota,
        kodePos: alamatUtama.kodePos,
        alamatLengkap: alamatUtama.alamatLengkap,
      } : null,
      totalOrders: validOrders.length,
      allOrdersCount: c.pesanan.length,
      totalSpent,
      lastOrderDate: lastOrder ? lastOrder.createdAt.toISOString() : null,
      recentOrders: c.pesanan.slice(0, 5).map((o) => ({
        id: o.id,
        totalHarga: o.totalHarga,
        statusPesanan: o.statusPesanan,
        createdAt: o.createdAt.toISOString(),
      })),
    };
  });

  return <AdminPelangganClient initialCustomers={formattedCustomers} />;
}
