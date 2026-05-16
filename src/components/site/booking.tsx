"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Check,
  Clock,
  Calendar as CalendarIcon,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatPrice } from "@/lib/utils";

type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
};

const TIME_SLOTS = [
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];

const STEPS = [
  { id: 1, label: "Hizmet" },
  { id: 2, label: "Tarih & Saat" },
  { id: 3, label: "Bilgilerin" },
  { id: 4, label: "Onay" },
];

export function Booking({ services }: { services: Service[] }) {
  const [open, setOpen] = useState(false);

  // Open dialog when URL hash is #randevu
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#randevu") {
        setOpen(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && typeof window !== "undefined" && window.location.hash === "#randevu") {
      // Clear hash when closing
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-display text-2xl">
            Randevunu 30 Saniyede Al
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Hizmetini ve saatini seç, bilgilerini gir.
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          <BookingFlow services={services} onDone={() => handleOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingFlow({
  services,
  onDone,
}: {
  services: Service[];
  onDone: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // First selected = primary serviceId
  const serviceId = selectedIds[0] || null;
  const setServiceId = (id: string | null) => {
    if (id) setSelectedIds([id]);
    else setSelectedIds([]);
  };
  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  const selectedServices = useMemo(
    () =>
      selectedIds
        .map((id) => services.find((s) => s.id === id))
        .filter((s): s is Service => !!s),
    [services, selectedIds]
  );

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.durationMin,
    0
  );
  const extraServiceIds = selectedIds.slice(1);

  const next7Days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    const dateStr = format(date, "yyyy-MM-dd");
    const dur = totalDuration > 0 ? totalDuration : 30;
    fetch(`/api/availability?date=${dateStr}&duration=${dur}`)
      .then((r) => r.json())
      .then((data) => setBusy(data.busy || []))
      .catch(() => setBusy([]))
      .finally(() => setLoadingSlots(false));
  }, [date, totalDuration]);

  const canNext = () => {
    if (step === 1) return !!serviceId;
    if (step === 2) return !!date && !!time;
    if (step === 3)
      return name.trim().length >= 2 && phone.trim().length >= 7;
    return true;
  };

  const handleSubmit = async () => {
    if (!serviceId || !date || !time) return;
    setSubmitting(true);
    setError(null);
    const [h, m] = time.split(":").map(Number);
    const dt = new Date(date);
    dt.setHours(h, m, 0, 0);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          extraServiceIds: extraServiceIds,
          date: dt.toISOString(),
          customerName: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Randevu kaydedilemedi, tekrar deneyin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setServiceId(null);
    setDate(null);
    setTime(null);
    setName("");
    setPhone("");
    setEmail("");
    setNote("");
    setDone(false);
    setError(null);
  };

  if (done && selectedService && date && time) {
    return (
      <div className="px-6 pb-6 pt-2 overflow-y-auto">
        <div className="text-center py-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
            <Check className="h-7 w-7 text-gold" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-1">
            Randevunuz Alındı
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Sayın <span className="text-foreground">{name}</span>, randevunuz için teşekkür ederiz.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left mb-6">
            <Card className="p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Hizmet{selectedServices.length > 1 ? `ler (${selectedServices.length})` : ""}
              </div>
              <div className="text-sm font-medium mt-1 line-clamp-2">
                {selectedServices.map((s) => s.name).join(" + ")}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Tarih</div>
              <div className="text-sm font-medium mt-1">{format(date, "d MMMM yyyy", { locale: tr })}</div>
            </Card>
            <Card className="p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Saat</div>
              <div className="text-sm font-medium mt-1">{time}</div>
            </Card>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">Yeni Randevu</Button>
            <Button onClick={onDone} variant="gold">Kapat</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="m-0 rounded-none border-0 overflow-hidden flex-1 flex flex-col">
          {/* Steps */}
          <div className="grid grid-cols-4 border-b border-border/60 bg-secondary/30">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest border-r border-border/60 last:border-r-0 transition-colors",
                  step >= s.id
                    ? "text-gold"
                    : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all",
                    step > s.id
                      ? "bg-gold text-black border-gold"
                      : step === s.id
                      ? "border-gold text-gold"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="h-3 w-3" /> : s.id}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            {/* Step 1: Service (multi-select) */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Hangi hizmeti almak istiyorsun?{" "}
                    <span className="text-xs text-gold/80 hidden sm:inline">
                      (birden fazla seçebilirsin)
                    </span>
                  </div>
                  {selectedIds.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold">
                      {selectedIds.length} seçili
                    </span>
                  )}
                </div>
                {services.map((s) => {
                  const checked = selectedIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3",
                        checked
                          ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                          : "border-border/60 hover:border-gold/40 hover:bg-secondary/30"
                      )}
                    >
                      <div
                        className={cn(
                          "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                          checked
                            ? "bg-gold border-gold"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {checked && (
                          <Check className="h-3.5 w-3.5 text-black stroke-[3]" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{s.name}</div>
                          {s.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {s.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display font-bold text-gold">
                            {formatPrice(s.price)}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            {s.durationMin} dk
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {selectedIds.length > 0 && (
                  <div className="sticky bottom-0 -mx-6 -mb-6 md:-mx-8 md:-mb-8 mt-4 p-4 bg-gold/10 border-t border-gold/30 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
                      <div className="text-xs text-muted-foreground">
                        Toplam ({selectedIds.length} hizmet ·{" "}
                        {totalDuration} dk)
                      </div>
                      <div className="font-display text-xl font-bold text-gold">
                        {formatPrice(totalPrice)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <CalendarIcon className="h-4 w-4 text-gold" />
                    Tarih seç
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {next7Days.map((d) => {
                      const isPast = d < startOfDay(new Date());
                      const isSunday = d.getDay() === 0;
                      const disabled = isPast || isSunday;
                      const selected =
                        date &&
                        format(d, "yyyy-MM-dd") ===
                          format(date, "yyyy-MM-dd");
                      return (
                        <button
                          key={d.toISOString()}
                          disabled={disabled}
                          onClick={() => {
                            setDate(d);
                            setTime(null);
                          }}
                          className={cn(
                            "p-3 rounded-lg border text-center transition-all",
                            disabled &&
                              "opacity-30 cursor-not-allowed border-border/40",
                            !disabled &&
                              !selected &&
                              "border-border/60 hover:border-gold/40 hover:bg-secondary/30",
                            selected &&
                              "border-gold bg-gold/10 shadow-lg shadow-gold/10"
                          )}
                        >
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {format(d, "EEE", { locale: tr })}
                          </div>
                          <div
                            className={cn(
                              "font-display text-xl font-bold mt-1",
                              selected && "text-gold"
                            )}
                          >
                            {format(d, "d")}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {format(d, "MMM", { locale: tr })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {date && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Clock className="h-4 w-4 text-gold" />
                      Saat seç
                      {loadingSlots && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {TIME_SLOTS.map((t) => {
                        const isBusy = busy.includes(t);
                        const selected = time === t;
                        return (
                          <button
                            key={t}
                            disabled={isBusy}
                            onClick={() => setTime(t)}
                            className={cn(
                              "p-2.5 rounded-md border text-sm transition-all tabular-nums",
                              isBusy &&
                                "opacity-30 cursor-not-allowed line-through",
                              !isBusy &&
                                !selected &&
                                "border-border/60 hover:border-gold/40 hover:bg-secondary/30",
                              selected &&
                                "border-gold bg-gold text-black font-bold"
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Customer info */}
            {step === 3 && (
              <div className="space-y-5 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4 text-gold" />
                  Bilgilerini gir
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad *</Label>
                  <Input
                    id="name"
                    placeholder="Mehmet Yılmaz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    placeholder="0555 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-posta <span className="text-muted-foreground">(opsiyonel)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">
                    Not <span className="text-muted-foreground">(opsiyonel)</span>
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Saç modeli, özel istek vb."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Randevuya gelmeyeceğinizi bildirmeden 2 saat içinde iptal
                  yapmazsanız bir sonraki randevunuz için kapora alınabilir.
                  Kişisel verileriniz{" "}
                  <a
                    href="/kvkk"
                    target="_blank"
                    className="text-gold hover:underline"
                  >
                    KVKK Aydınlatma Metni
                  </a>
                  &apos;ne uygun işlenir.
                </p>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && selectedService && date && time && (
              <div className="space-y-5 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Check className="h-4 w-4 text-gold" />
                  Randevu özetini onayla
                </div>
                <Card className="p-5 border-gold/30 bg-gold/5">
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        Hizmetler ({selectedServices.length})
                      </div>
                      <div className="space-y-1.5">
                        {selectedServices.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{s.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {s.durationMin} dk
                              </span>
                            </div>
                            <div className="font-medium text-gold tabular-nums">
                              {formatPrice(s.price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gold/20 pt-3 grid grid-cols-2 gap-y-2">
                      <div className="text-muted-foreground">Tarih</div>
                      <div className="text-right font-medium">
                        {format(date, "d MMMM yyyy", { locale: tr })}
                      </div>

                      <div className="text-muted-foreground">Saat</div>
                      <div className="text-right font-medium tabular-nums">
                        {time}
                      </div>

                      <div className="text-muted-foreground">
                        Toplam Süre
                      </div>
                      <div className="text-right">{totalDuration} dk</div>

                      <div className="text-muted-foreground">Müşteri</div>
                      <div className="text-right font-medium">{name}</div>

                      <div className="text-muted-foreground">Telefon</div>
                      <div className="text-right tabular-nums flex items-center justify-end gap-1">
                        <Phone className="h-3 w-3" />
                        {phone}
                      </div>
                    </div>

                    <div className="border-t border-gold/30 pt-3 flex justify-between items-center">
                      <div className="text-muted-foreground">
                        Toplam Ücret
                      </div>
                      <div className="font-display text-2xl font-bold text-gold">
                        {formatPrice(totalPrice)}
                      </div>
                    </div>
                  </div>
                </Card>

                {error && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step nav — sticky at bottom of viewport */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 p-4 border-t border-border/60 bg-card/95 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.3)]">
            <Button
              variant="ghost"
              size="sm"
              disabled={step === 1 || submitting}
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
            {canNext() && step < 4 && (
              <span className="hidden sm:flex text-xs text-gold/80 items-center gap-1 animate-pulse">
                <ChevronRight className="h-3 w-3" />
                Devam etmek için tıkla
              </span>
            )}
            {step < 4 ? (
              <Button
                variant="gold"
                disabled={!canNext()}
                onClick={() => setStep(step + 1)}
                className={canNext() ? "ring-2 ring-gold/40 ring-offset-2 ring-offset-background" : ""}
              >
                Devam
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="gold"
                size="lg"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Randevuyu Onayla
              </Button>
            )}
          </div>
      </Card>
    </>
  );
}
