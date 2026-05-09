"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent-v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Show after a tiny delay so it doesn't compete with hero animation
        setTimeout(() => setShow(true), 1500);
      }
    } catch {
      setShow(true);
    }
  }, []);

  const accept = (kind: "all" | "essential") => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ kind, ts: Date.now() })
      );
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="mx-auto max-w-4xl pointer-events-auto rounded-xl border border-gold/30 bg-card/95 backdrop-blur-md shadow-2xl shadow-black/50 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-10 w-10 rounded-md bg-gold/10 border border-gold/30 items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display text-lg font-semibold">
                Çerez Kullanımı
              </h3>
              <button
                onClick={() => accept("essential")}
                aria-label="Kapat"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Site deneyiminizi iyileştirmek için zorunlu ve isteğe bağlı
              çerezler kullanıyoruz. &quot;Tümünü Kabul Et&quot;e basarak
              tercihlerinizi hatırlamamıza ve site analitiğine izin vermiş
              olursunuz. Detaylı bilgi için{" "}
              <Link
                href="/cerez-politikasi"
                className="text-gold hover:underline"
              >
                Çerez Politikası
              </Link>{" "}
              ve{" "}
              <Link href="/kvkk" className="text-gold hover:underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni inceleyebilirsiniz.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => accept("all")}
                className="sm:order-2"
              >
                Tümünü Kabul Et
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => accept("essential")}
                className="sm:order-1"
              >
                Sadece Zorunlu
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="sm:order-3"
              >
                <Link href="/cerez-politikasi">Detaylar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
