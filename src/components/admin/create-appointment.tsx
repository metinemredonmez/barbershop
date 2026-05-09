"use client";

import { useState } from "react";
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

const TIME_SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30",
];

type Service = { id: string; name: string; price: number };

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
  const [time, setTime] = useState("10:00");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("confirmed");

  const reset = () => {
    setCustomerName("");
    setPhone("");
    setServiceId("");
    setDate(today);
    setTime("10:00");
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
                      {s.name} — ₺{s.price}
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
                  min={today}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Saat</Label>
                <Select value={time} onValueChange={setTime}>
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
