import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.pesanan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        items: {
          include: {
            varian: {
              include: {
                produk: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
        alterasi: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const formattedOrder = {
      id: order.id,
      status: order.statusPesanan,
      statusPesanan: order.statusPesanan,
      tipePengiriman: order.tipePengiriman,
      resiKurir: order.resiKurir,
      pickupCode: order.pickupCode,
      metodePembayaran: order.metodePembayaran || "Transfer Bank",
      paymentReference: order.paymentReference,
      paymentUrl: order.paymentUrl,
      alamatPengiriman: order.alamatPengiriman,
      totalHarga: order.totalHarga,
      createdAt: order.createdAt,
      tanggal: new Date(order.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      waktu:
        new Date(order.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB",
      user: order.user,
      alterasi: order.alterasi,
      items: order.items.map((item: any) => ({
        id: item.id,
        nama: item.varian?.produk?.nama || "Produk",
        ukuran: item.varian?.ukuran || "-",
        warna: item.varian?.warna || "-",
        harga: item.hargaSatuan,
        qty: item.jumlah,
        image: item.varian?.produk?.images?.[0]?.url || "",
      })),
    };

    return NextResponse.json({ success: true, data: formattedOrder });
  } catch (error: any) {
    console.error("Error fetching admin order:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, resiKurir } = body;

    const allowedStatuses = [
      "UNPAID",
      "PAID",
      "PROCESSING",
      "READY_FOR_PICKUP",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    const updateData: any = {};

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Status pesanan tidak valid" }, { status: 400 });
      }
      updateData.statusPesanan = status;
    }

    if (resiKurir !== undefined) {
      updateData.resiKurir = resiKurir ? resiKurir.trim() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diperbarui" }, { status: 400 });
    }

    const updatedOrder = await prisma.pesanan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
