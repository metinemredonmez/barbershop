"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatPrice } from "@/lib/utils";

type Appointment = {
  id: string;
  customerName: string;
  phone: string;
  date: Date | string;
  status: string;
  service: { name: string; durationMin: number; price: number };
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-400",
  confirmed: "bg-green-400",
  completed: "bg-zinc-400",
  cancelled: "bg-red-400",
  no_show: "bg-red-500",
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

export function CalendarView({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const [cursor, setCursor] = useState(new Date());
  const [popupDay, setPopupDay] = useState<Date | null>(null);

  const grid = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      days.push(d);
      d = new Date(d);
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const k = format(new Date(a.date), "yyyy-MM-dd");
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    map.forEach((arr) => {
      arr.sort(
        (x, y) => new Date(x.date).getTime() - new Date(y.date).getTime()
      );
    });
    return map;
  }, [appointments]);

  const monthCount = appointments.filter((a) =>
    isSameMonth(new Date(a.date), cursor)
  ).length;

  const dayList =
    (popupDay && byDay.get(format(popupDay, "yyyy-MM-dd"))) || [];

  const dayRevenue = dayList
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.service.price, 0);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Takvim</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {monthCount} randevu · {format(cursor, "MMMM yyyy", { locale: tr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor(addMonths(cursor, -1))}
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date())}
          >
            Bugün
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor(addMonths(cursor, 1))}
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40 border-b border-border/60">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
            <div
              key={d}
              className="py-3 border-r border-border/40 last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const items = byDay.get(key) || [];
            const isOut = !isSameMonth(day, cursor);
            const today = isToday(day);

            return (
              <button
                key={key}
                onClick={() => setPopupDay(day)}
                className={cn(
                  "relative min-h-[88px] sm:min-h-[110px] p-2 text-left border-r border-b border-border/40 last:border-r-0 transition-colors hover:bg-secondary/30",
                  isOut && "bg-secondary/10 text-muted-foreground/60",
                  today && "bg-gold/[0.04]"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      today &&
                        "h-6 w-6 rounded-full bg-gold text-black flex items-center justify-center"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {items.length > 0 && (
                    <Badge variant="gold" className="text-[9px] px-1.5 py-0">
                      {items.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {items.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px] truncate rounded px-1 py-0.5 bg-background/60 border border-border/40"
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          STATUS_DOT[a.status] || "bg-zinc-400"
                        )}
                      />
                      <span className="font-medium tabular-nums">
                        {format(new Date(a.date), "HH:mm")}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {a.customerName}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-[10px] text-gold pl-1">
                      +{items.length - 3} daha
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day popup */}
      <Dialog
        open={!!popupDay}
        onOpenChange={(o) => !o && setPopupDay(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CalIcon className="h-5 w-5 text-gold" />
              {popupDay &&
                format(popupDay, "d MMMM yyyy, EEEE", { locale: tr })}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3 -mt-1 mb-2">
            <div className="rounded-md border border-border/60 bg-secondary/30 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Toplam Randevu
              </div>
              <div className="font-display text-2xl font-bold mt-1">
                {dayList.length}
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-secondary/30 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Tamamlanan
              </div>
              <div className="font-display text-2xl font-bold mt-1">
                {dayList.filter((a) => a.status === "completed").length}
              </div>
            </div>
            <div className="rounded-md border border-gold/30 bg-gold/5 p-3">
              <div className="text-[10px] uppercase tracking-widest text-gold">
                Günlük Ciro
              </div>
              <div className="font-display text-2xl font-bold mt-1 text-gold">
                {formatPrice(dayRevenue)}
              </div>
            </div>
          </div>

          {dayList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Bu gün için randevu yok.
            </p>
          ) : (
            <div className="max-h-[55vh] overflow-y-auto -mx-6 px-6 divide-y divide-border/60">
              {dayList.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 py-3 first:pt-2"
                >
                  <div className="font-display font-bold text-gold tabular-nums w-16 text-lg">
                    {format(new Date(a.date), "HH:mm")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{a.customerName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{a.service.name}</span>
                      <span>·</span>
                      <span>{a.service.durationMin} dk</span>
                      <span>·</span>
                      <span className="text-gold">
                        {formatPrice(a.service.price)}
                      </span>
                    </div>
                    <a
                      href={`tel:${a.phone}`}
                      className="text-[11px] text-muted-foreground hover:text-gold transition-colors flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="h-3 w-3" />
                      {a.phone}
                    </a>
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status] || "secondary"}>
                    {STATUS_LABEL[a.status] || a.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
