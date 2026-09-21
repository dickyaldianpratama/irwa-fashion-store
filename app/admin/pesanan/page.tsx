import prisma from "@/lib/prisma";
import AdminPesananClient from "@/components/admin/AdminPesananClient";
import { checkTransactionStatus } from "@/lib/midtrans";

export const metadata = {
  title: "Manajemen Pesanan - Admin IRWA",
  description: "Kelola status dan pengiriman pesanan pelanggan",
};

export default async function AdminPesananPage() {
  const orders = await prisma.pesanan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      items: {
        include: {
          varian: {
            include: {
              produk: {
                include: {
                  images: { where: { isUtama: true }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
  });

  // Sync unpaid midtrans status jika diperlukan
  const unpaidOrders = orders.filter((o) => o.statusPesanan === "UNPAID");
  if (unpaidOrders.length > 0) {
    await Promise.all(
      unpaidOrders.map(async (order) => {
        try {
          const midtransStatus = await checkTransactionStatus(order.id);
          if (midtransStatus) {
            const txStatus = midtransStatus.transaction_status;
            let method = midtransStatus.payment_type;
            if (
              method === "bank_transfer" &&
              midtransStatus.va_numbers &&
              midtransStatus.va_numbers.length > 0
            ) {
              method = `VA ${midtransStatus.va_numbers[0].bank.toUpperCase()}`;
            } else if (method === "echannel") {
              method = "Mandiri Bill";
            }

            if (txStatus === "settlement" || txStatus === "capture") {
              order.statusPesanan = "PAID";
              order.metodePembayaran = method;
              await prisma.pesanan.update({
                where: { id: order.id },
                data: { statusPesanan: "PAID", metodePembayaran: method },
              });
            } else if (
              txStatus === "expire" ||
              txStatus === "cancel" ||
              txStatus === "deny"
            ) {
              order.statusPesanan = "CANCELLED";
              await prisma.pesanan.update({
                where: { id: order.id },
                data: { statusPesanan: "CANCELLED" },
              });
            }
          }
        } catch (e) {}
      })
    );
  }

  const formatted = orders.map((order) => ({
    id: order.id,
    status: order.statusPesanan,
    statusPesanan: order.statusPesanan,
    tipePengiriman: order.tipePengiriman,
    resiKurir: order.resiKurir,
    totalHarga: order.totalHarga,
    metodePembayaran: order.metodePembayaran || "Transfer Bank",
    paymentReference: order.paymentReference,
    createdAt: order.createdAt.toISOString(),
    tanggal: new Date(order.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    waktu:
      new Date(order.createdAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB",
    user: order.user,
    totalItems: order.items.reduce((sum, it) => sum + it.jumlah, 0),
    itemsPreview: order.items.slice(0, 3).map((it) => ({
      nama: it.varian?.produk?.nama || "Produk",
      ukuran: it.varian?.ukuran || "-",
      warna: it.varian?.warna || "-",
      qty: it.jumlah,
      image: it.varian?.produk?.images?.[0]?.url || "",
    })),
  }));

  return <AdminPesananClient initialOrders={formatted} />;
}
