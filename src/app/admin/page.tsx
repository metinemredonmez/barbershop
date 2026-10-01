import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { ONESIGNAL_APP_ID, barberPushId } from "@/lib/push";
import { AdminDashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const [appointments, services] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { date: "desc" },
      include: { service: true },
    }),
    prisma.service.findMany({ orderBy: { order: "asc" } }),
  ]);

  return <AdminDashboard
      appointments={appointments}
      services={services}
      push={{ appId: ONESIGNAL_APP_ID, externalId: barberPushId() }}
    />;
}
