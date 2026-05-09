"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  Wallet,
  Clock,
  Search,
  Phone,
  Trash2,
  AlertCircle,
  LogOut,
  Scissors,
  Filter,
  ExternalLink,
} from "lucide-react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/site-config";
import { cn, formatPrice } from "@/lib/utils";
import { CalendarView } from "./calendar";

type Appointment = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  note: string | null;
  date: Date | string;
  status: string;
  createdAt: Date | string;
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: number;
  };
};

type Service = {
  id: string;
  name: string;
  price: number;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylı",
  completed: "Tamamlandı",
  cancelled: "İptal",
  no_show: "Gelmedi",
};

const STATUS_VARIANT: Record<
  string,
  "warning" | "success" | "secondary" | "danger"
> = {
  pending: "warning",
  confirmed: "success",
  completed: "secondary",
  cancelled: "danger",
  no_show: "danger",
};

function relativeDay(date: Date) {
  if (isToday(date)) return "Bugün";
  if (isTomorrow(date)) return "Yarın";
  if (isYesterday(date)) return "Dün";
  return format(date, "d MMM", { locale: tr });
}

export function AdminDashboard({
  appointments,
  services,
}: {
  appointments: Appointment[];
  services: Service[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<Appointment | null>(null);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todays = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= today && d < tomorrow;
    });
    const completed = appointments.filter((a) => a.status === "completed");
    const pending = appointments.filter((a) => a.status === "pending");
    const monthRevenue = completed
      .filter((a) => {
        const d = new Date(a.date);
        return (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      })
      .reduce((sum, a) => sum + a.service.price, 0);

    return {
      total: appointments.length,
      todays: todays.length,
      pending: pending.length,
      revenue: monthRevenue,
    };
  }, [appointments]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.customerName.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          a.service.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [appointments, statusFilter, search]);

  const updateStatus = (id: string, status: string) => {
    startTransition(async () => {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      setConfirmDelete(null);
      router.refresh();
    });
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-30">
        <div className="container-narrow py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center">
              <Scissors className="h-4 w-4 text-black" />
            </div>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                {siteConfig.brand}
              </div>
              <div className="text-sm font-medium">Yönetim Paneli</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" target="_blank">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Siteyi Görüntüle</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      <main className="container-narrow py-8 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Toplam Randevu"
            value={stats.total.toString()}
            icon={Calendar}
          />
          <StatCard
            label="Bugünkü Randevu"
            value={stats.todays.toString()}
            icon={Clock}
            highlight
          />
          <StatCard
            label="Bekleyen"
            value={stats.pending.toString()}
            icon={Users}
          />
          <StatCard
            label="Aylık Ciro"
            value={formatPrice(stats.revenue)}
            icon={Wallet}
          />
        </section>

        {/* Calendar */}
        <CalendarView appointments={appointments} />

        {/* Filters */}
        <section>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Randevular</h2>
            <div className="flex gap-2 flex-1 sm:flex-initial sm:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="İsim, telefon, hizmet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="confirmed">Onaylı</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                  <SelectItem value="no_show">Gelmedi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Card className="mt-4 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                Kayıtlı randevu bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 border-b border-border/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 font-medium">Müşteri</th>
                      <th className="py-3 px-4 font-medium hidden md:table-cell">
                        Hizmet
                      </th>
                      <th className="py-3 px-4 font-medium">Tarih</th>
                      <th className="py-3 px-4 font-medium hidden lg:table-cell">
                        Ücret
                      </th>
                      <th className="py-3 px-4 font-medium">Durum</th>
                      <th className="py-3 px-4 font-medium text-right">
                        İşlem
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => {
                      const d = new Date(a.date);
                      return (
                        <tr
                          key={a.id}
                          className="border-b border-border/40 hover:bg-secondary/20"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium">{a.customerName}</div>
                            <a
                              href={`tel:${a.phone}`}
                              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-gold"
                            >
                              <Phone className="h-3 w-3" />
                              {a.phone}
                            </a>
                            {a.note && (
                              <div className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                                &ldquo;{a.note}&rdquo;
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div>{a.service.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {a.service.durationMin} dk
                            </div>
                          </td>
                          <td className="py-3 px-4 tabular-nums">
                            <div className="font-medium">{relativeDay(d)}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(d, "HH:mm")} ·{" "}
                              {format(d, "d MMM yyyy", { locale: tr })}
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell text-gold font-display font-bold">
                            {formatPrice(a.service.price)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={STATUS_VARIANT[a.status]}>
                              {STATUS_LABEL[a.status] || a.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 justify-end">
                              <Select
                                value={a.status}
                                onValueChange={(v) => updateStatus(a.id, v)}
                              >
                                <SelectTrigger className="h-8 w-[120px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Bekliyor
                                  </SelectItem>
                                  <SelectItem value="confirmed">
                                    Onayla
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Tamamlandı
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    İptal
                                  </SelectItem>
                                  <SelectItem value="no_show">
                                    Gelmedi
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                onClick={() => setConfirmDelete(a)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        {/* Services list */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-4">Hizmetler</h2>
          <Card className="p-2">
            <div className="divide-y divide-border/60">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Scissors className="h-4 w-4 text-gold" />
                    <div className="font-medium">{s.name}</div>
                  </div>
                  <div className="text-gold font-display font-bold">
                    {formatPrice(s.price)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Randevuyu Sil
            </DialogTitle>
            <DialogDescription>
              {confirmDelete?.customerName} adına olan randevu kalıcı olarak
              silinecek. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && remove(confirmDelete.id)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-5 relative overflow-hidden",
        highlight && "border-gold/30 bg-gradient-to-br from-gold/5 to-transparent"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 font-display text-3xl font-bold",
              highlight && "text-gold"
            )}
          >
            {value}
          </div>
        </div>
        <div
          className={cn(
            "h-9 w-9 rounded-md flex items-center justify-center",
            highlight
              ? "bg-gold/20 text-gold"
              : "bg-secondary text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
