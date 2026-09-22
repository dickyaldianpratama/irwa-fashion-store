import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
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

    return NextResponse.json({
      success: true,
      totalCustomers: formattedCustomers.length,
      customers: formattedCustomers,
    });
  } catch (error: any) {
    console.error("Error fetching admin customer data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("id");

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    if (customerId === user.id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun admin diri sendiri!" }, { status: 400 });
    }

    // Hapus data pelanggan dan seluruh relasi terkait secara aman dalam transaksi database
    await prisma.$transaction([
      prisma.wishlist.deleteMany({ where: { userId: customerId } }),
      prisma.voucherUser.deleteMany({ where: { userId: customerId } }),
      prisma.ulasan.deleteMany({ where: { userId: customerId } }),
      prisma.ukuranUser.deleteMany({ where: { userId: customerId } }),
      prisma.alamat.deleteMany({ where: { userId: customerId } }),
      prisma.poin.deleteMany({ where: { userId: customerId } }),
      prisma.itemPesanan.deleteMany({
        where: { pesanan: { userId: customerId } },
      }),
      prisma.alterasiRequest.deleteMany({
        where: { pesanan: { userId: customerId } },
      }),
      prisma.pesanan.deleteMany({ where: { userId: customerId } }),
      prisma.user.delete({ where: { id: customerId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Pelanggan berhasil dihapus permanen dari database",
    });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus pelanggan" },
      { status: 500 }
    );
  }
}

