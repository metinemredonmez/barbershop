"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, CalendarPlus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Service = {
  id: string;
  name: string;
  price: number;
  durationMin: number;
};

export function CreateAppointmentButton({ services }: { services: Service[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Tarih veya hizmet değişince availability'i çek
  useEffect(() => {
    if (!open || !date) return;
    setLoadingSlots(true);
    const svc = services.find((s) => s.id === serviceId);
    const dur = svc?.durationMin || 30;
    fetch(`/api/availability?date=${date}&duration=${dur}`)
      .then((r) => r.json())
      .then((data) => {
        const list: string[] = data.available || [];
        setAvailableSlots(list);
        // Seçili saat artık uygun değilse temizle
        if (time && !list.includes(time)) setTime("");
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date, serviceId, services]);

  const reset = () => {
    setCustomerName("");
    setPhone("");
    setServiceId("");
    setDate(today);
    setTime("");
    setNote("");
    setStatus("confirmed");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!customerName.trim() || !phone.trim() || !serviceId) {
      setError("Müşteri adı, telefon ve hizmet zorunludur.");
      return;
    }
    if (!time) {
      setError("Lütfen bir saat seçin.");
      return;
    }
    setSubmitting(true);
    try {
      const [h, m] = time.split(":").map(Number);
      const dt = new Date(`${date}T00:00:00`);
      dt.setHours(h, m, 0, 0);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          date: dt.toISOString(),
          customerName: customerName.trim(),
          phone: phone.trim(),
          note: note.trim() || null,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Randevu oluşturulamadı.");
      reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Randevu oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />
        Yeni Randevu
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-gold" />
              Yeni Randevu Oluştur
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ca-name">Müşteri Adı *</Label>
              <Input
                id="ca-name"
                placeholder="Ad Soyad"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-phone">Telefon *</Label>
              <Input
                id="ca-phone"
                placeholder="0555 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hizmet *</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Hizmet seç" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — ₺{s.price} · {s.durationMin} dk
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ca-date">Tarih</Label>
                <Input
                  id="ca-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  Saat
                  {loadingSlots && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </Label>
                <Select
                  value={time}
                  onValueChange={setTime}
                  disabled={loadingSlots || availableSlots.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        availableSlots.length === 0
                          ? "Müsait saat yok"
                          : "Saat seç"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Durum</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Onaylı</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-note">
                Not <span className="text-muted-foreground">(opsiyonel)</span>
              </Label>
              <Textarea
                id="ca-note"
                placeholder="Saç modeli, özel istek..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>{error}</div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button variant="gold" onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Randevuyu Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
