import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility untuk menggabungkan Tailwind class dengan aman */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format angka ke format Rupiah */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format tanggal ke format Indonesia */
export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Potong teks panjang dengan ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/** Hitung persentase diskon */
export function hitungDiskon(hargaAsli: number, hargaDiskon: number): number {
  return Math.round(((hargaAsli - hargaDiskon) / hargaAsli) * 100);
}

/** Generate slug dari nama produk */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}
