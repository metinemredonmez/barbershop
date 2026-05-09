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
import { SectionHeading } from "./section-heading";
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
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
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

  const next7Days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    const dateStr = format(date, "yyyy-MM-dd");
    fetch(`/api/availability?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setBusy(data.busy || []))
      .catch(() => setBusy([]))
      .finally(() => setLoadingSlots(false));
  }, [date]);

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
      <section id="randevu" className="py-20 md:py-28">
        <div className="container-narrow max-w-2xl">
          <Card className="p-8 md:p-12 text-center border-gold/30 bg-gradient-to-b from-gold/5 to-transparent">
            <div className="mx-auto h-16 w-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-gold" />
            </div>
            <h3 className="font-display text-3xl font-bold mb-2">
              Randevunuz Alındı
            </h3>
            <p className="text-muted-foreground mb-8">
              Sayın <span className="text-foreground">{name}</span>, randevunuz
              için teşekkür ederiz. Detaylar aşağıdadır.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Card className="p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Hizmet
                </div>
                <div className="font-medium">{selectedService.name}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Tarih
                </div>
                <div className="font-medium">
                  {format(date, "d MMMM yyyy", { locale: tr })}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Saat
                </div>
                <div className="font-medium">{time}</div>
              </Card>
            </div>
            <div className="mt-8">
              <Button onClick={reset} variant="outline">
                Yeni Randevu
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section
      id="randevu"
      className="py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background"
    >
      <div className="container-narrow max-w-3xl">
        <SectionHeading
          eyebrow="Online Randevu"
          title="Randevunu 30 Saniyede Al"
          description="Hizmetini ve saatini seç, bilgilerini gir. Hepsi bu kadar."
        />

        <Card className="mt-12 overflow-hidden">
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

          <div className="p-6 md:p-8 min-h-[400px]">
            {/* Step 1: Service */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Hangi hizmeti almak istiyorsun?
                </div>
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all",
                      serviceId === s.id
                        ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                        : "border-border/60 hover:border-gold/40 hover:bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
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
                ))}
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
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-muted-foreground">Hizmet</div>
                    <div className="text-right font-medium">
                      {selectedService.name}
                    </div>

                    <div className="text-muted-foreground">Tarih</div>
                    <div className="text-right font-medium">
                      {format(date, "d MMMM yyyy", { locale: tr })}
                    </div>

                    <div className="text-muted-foreground">Saat</div>
                    <div className="text-right font-medium tabular-nums">
                      {time}
                    </div>

                    <div className="text-muted-foreground">Süre</div>
                    <div className="text-right">
                      {selectedService.durationMin} dk
                    </div>

                    <div className="text-muted-foreground">Müşteri</div>
                    <div className="text-right font-medium">{name}</div>

                    <div className="text-muted-foreground">Telefon</div>
                    <div className="text-right tabular-nums flex items-center justify-end gap-1">
                      <Phone className="h-3 w-3" />
                      {phone}
                    </div>

                    <div className="col-span-2 border-t border-gold/20 pt-3 mt-1 flex justify-between items-center">
                      <div className="text-muted-foreground">Toplam Ücret</div>
                      <div className="font-display text-2xl font-bold text-gold">
                        {formatPrice(selectedService.price)}
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

          {/* Step nav */}
          <div className="flex items-center justify-between gap-3 p-4 border-t border-border/60 bg-secondary/20">
            <Button
              variant="ghost"
              size="sm"
              disabled={step === 1 || submitting}
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
            {step < 4 ? (
              <Button
                variant="gold"
                disabled={!canNext()}
                onClick={() => setStep(step + 1)}
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
      </div>
    </section>
  );
}
