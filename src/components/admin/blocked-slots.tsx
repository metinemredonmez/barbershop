"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Ban, Clock, Coffee, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type BlockedSlot = {
  id: string;
  startAt: string | Date;
  endAt: string | Date;
  type: string;
  reason: string | null;
};

const TIME_SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00",
  "19:30", "20:00", "20:30", "21:00",
];

function todayInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function BlockedSlotsCard() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(todayInputValue());
  const [startTime, setStartTime] = useState<string>("13:00");
  const [endTime, setEndTime] = useState<string>("14:00");
  const [type, setType] = useState<"break" | "off">("break");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blocked-slots", { cache: "no-store" });
      const data = await res.json();
      setSlots(data.blockedSlots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    setError(null);
    if (!date) {
      setError("Tarih seçin.");
      return;
    }
    let startAt: Date;
    let endAt: Date;
    if (allDay) {
      startAt = new Date(`${date}T00:00:00`);
      endAt = new Date(`${date}T23:59:59`);
    } else {
      startAt = new Date(`${date}T${startTime}:00`);
      endAt = new Date(`${date}T${endTime}:00`);
      if (endAt <= startAt) {
        setError("Bitiş saati, başlangıçtan sonra olmalı.");
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          type: allDay ? "off" : type,
          reason: reason.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız.");
      setReason("");
      await load();
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    try {
      await fetch(`/api/blocked-slots/${id}`, { method: "DELETE" });
      await load();
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Coffee className="h-5 w-5 text-gold" />
          Mola & Kapalı Saatler
        </h2>
        <span className="text-xs text-muted-foreground">
          {slots.length} kayıt
        </span>
      </div>

      {/* Add form */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <Label htmlFor="bs-date" className="text-xs">
              Tarih
            </Label>
            <Input
              id="bs-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayInputValue()}
            />
          </div>
          {!allDay ? (
            <>
              <div className="md:col-span-2">
                <Label className="text-xs">Başlangıç</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Bitiş</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Tip</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as "break" | "off")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="break">Mola</SelectItem>
                    <SelectItem value="off">Kapalı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="md:col-span-6 flex items-end">
              <div className="text-sm text-muted-foreground">
                Bu gün tamamen kapalı işaretlenecek.
              </div>
            </div>
          )}
          <div className="md:col-span-3">
            <Label htmlFor="bs-reason" className="text-xs">
              Açıklama (opsiyonel)
            </Label>
            <Input
              id="bs-reason"
              placeholder="Öğle molası, doktor, izin..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-gold h-4 w-4"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            Tüm günü kapat (off)
          </label>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
            <Button
              variant="gold"
              size="sm"
              disabled={submitting}
              onClick={handleAdd}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1.5" />
              )}
              Ekle
            </Button>
          </div>
        </div>
      </Card>

      {/* List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-5 w-5 mx-auto animate-spin opacity-50" />
          </div>
        ) : slots.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Kayıtlı mola/kapalı saat yok.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {slots.map((s) => {
              const start = new Date(s.startAt);
              const end = new Date(s.endAt);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {s.type === "off" ? (
                      <Ban className="h-4 w-4 text-red-400 shrink-0" />
                    ) : (
                      <Coffee className="h-4 w-4 text-gold shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium tabular-nums">
                          {format(start, "d MMM yyyy", { locale: tr })}
                        </span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {format(start, "HH:mm")} - {format(end, "HH:mm")}
                        </span>
                        <Badge
                          variant={s.type === "off" ? "danger" : "warning"}
                        >
                          {s.type === "off" ? "Kapalı" : "Mola"}
                        </Badge>
                      </div>
                      {s.reason && (
                        <div className="text-xs text-muted-foreground italic mt-0.5">
                          {s.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
                    onClick={() => handleDelete(s.id)}
                    disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
