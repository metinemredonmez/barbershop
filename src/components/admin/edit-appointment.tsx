"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Loader2,
  Pencil,
  Trash2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
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

type Appointment = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  note: string | null;
  date: Date | string;
  status: string;
  service: { id: string; name: string; price: number; durationMin: number };
};

type Conflict = {
  customerName: string;
  date: string;
  service: string;
};

export function EditAppointmentDialog({
  appointment,
  services,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  services: Service[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [status, setStatus] = useState("pending");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!appointment) return;
    const d = new Date(appointment.date);
    setCustomerName(appointment.customerName);
    setPhone(appointment.phone);
    setServiceId(appointment.service.id);
    setDate(format(d, "yyyy-MM-dd"));
    setTime(format(d, "HH:mm"));
    setStatus(appointment.status);
    setNote(appointment.note || "");
    setError(null);
    setConflict(null);
    setConfirmDelete(false);
  }, [appointment]);

  if (!appointment) return null;

  const submit = async () => {
    setError(null);
    setConflict(null);
    setSubmitting(true);
    try {
      const [h, m] = time.split(":").map(Number);
      const dt = new Date(`${date}T00:00:00`);
      dt.setHours(h, m, 0, 0);

      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          serviceId,
          date: dt.toISOString(),
          status,
          note: note || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.conflict) {
          setConflict(data.conflict);
        } else {
          setError(data.error || "Güncellenemedi.");
        }
        return;
      }
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Silinemedi.");
      }
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-gold" />
            Randevuyu Düzenle
          </DialogTitle>
        </DialogHeader>

        {confirmDelete ? (
          <div className="space-y-4">
            <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-red-400 mb-1">
                  Silmeyi onayla
                </div>
                <div className="text-muted-foreground">
                  <span className="text-foreground">
                    {appointment.customerName}
                  </span>{" "}
                  adına olan randevu kalıcı olarak silinecek. Bu işlem geri
                  alınamaz.
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Vazgeç
              </Button>
              <Button
                variant="destructive"
                onClick={remove}
                disabled={deleting}
              >
                {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Trash2 className="h-4 w-4 mr-1.5" />
                Evet, Sil
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ea-name">Müşteri</Label>
                <Input
                  id="ea-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ea-phone">Telefon</Label>
                <Input
                  id="ea-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hizmet</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger>
                    <SelectValue />
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
                  <Label htmlFor="ea-date">Tarih</Label>
                  <Input
                    id="ea-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="confirmed">Onaylı</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal</SelectItem>
                    <SelectItem value="no_show">Gelmedi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ea-note">Not</Label>
                <Textarea
                  id="ea-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>

              {conflict && (
                <div className="rounded-md border-2 border-yellow-500/40 bg-yellow-500/5 p-3.5 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-sm flex-1">
                    <div className="font-semibold text-yellow-400 mb-1">
                      Çakışma var
                    </div>
                    <div className="text-muted-foreground">
                      Bu saatte zaten{" "}
                      <span className="text-foreground font-medium">
                        {conflict.customerName}
                      </span>{" "}
                      için{" "}
                      <span className="text-gold">{conflict.service}</span>{" "}
                      randevusu var.
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(conflict.date), "d MMMM, HH:mm", {
                        locale: tr,
                      })}
                    </div>
                    <div className="text-xs mt-2 text-yellow-400/80">
                      Başka bir saat seç ya da çakışan randevuyu önce iptal et.
                    </div>
                  </div>
                </div>
              )}

              {error && !conflict && (
                <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>{error}</div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2 sm:justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Sil
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Vazgeç
                </Button>
                <Button variant="gold" onClick={submit} disabled={submitting}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Kaydet
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
