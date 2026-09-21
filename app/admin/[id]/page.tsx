import { redirect } from "next/navigation";

export default async function AdminLegacyOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/pesanan/${id}`);
}
