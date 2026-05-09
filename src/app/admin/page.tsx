import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = cookies().get("admin-auth")?.value;
  if (auth !== "ok") {
    redirect("/admin/login");
  }

  const [appointments, services] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { date: "desc" },
      include: { service: true },
    }),
    prisma.service.findMany({ orderBy: { order: "asc" } }),
  ]);

  return <AdminDashboard appointments={appointments} services={services} />;
}
