"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// OneSignal Web SDK v16 — sadece kullandığımız kısım
type OneSignalSdk = {
  init: (opts: Record<string, unknown>) => Promise<void>;
  login: (externalId: string) => Promise<void>;
  Notifications: {
    isPushSupported: () => boolean;
    requestPermission: () => Promise<void>;
  };
  User: {
    PushSubscription: {
      optedIn?: boolean;
      optIn: () => Promise<void>;
      addEventListener: (event: "change", cb: () => void) => void;
    };
  };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalSdk) => void>;
  }
}

type Status = "loading" | "unsupported" | "ios-install" | "off" | "on";

function isIosBrowserTab() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !standalone;
}

export function PushSetup({
  appId,
  externalId,
}: {
  appId: string;
  externalId: string | null;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [sdk, setSdk] = useState<OneSignalSdk | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!externalId) return;
    if (isIosBrowserTab()) {
      setStatus("ios-install");
      return;
    }
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({ appId, notifyButton: { enable: false } });
      if (!OneSignal.Notifications.isPushSupported()) {
        setStatus("unsupported");
        return;
      }
      // Bu cihazı berberin gizli kimliğine bağla
      await OneSignal.login(externalId);
      const sync = () =>
        setStatus(OneSignal.User.PushSubscription.optedIn ? "on" : "off");
      OneSignal.User.PushSubscription.addEventListener("change", sync);
      sync();
      setSdk(OneSignal);
    });
  }, [appId, externalId]);

  if (!externalId) return null;

  const enable = async () => {
    if (!sdk) return;
    setBusy(true);
    setMessage(null);
    try {
      await sdk.Notifications.requestPermission();
      await sdk.User.PushSubscription.optIn();
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/push-test", { method: "POST" });
      const data = await res.json();
      setMessage(res.ok ? "Test bildirimi gönderildi." : data.error);
    } catch {
      setMessage("Gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
      />
      <div className="flex items-center gap-2">
        {status === "on" ? (
          <Button variant="outline" size="sm" onClick={sendTest} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <BellRing className="h-4 w-4 mr-1.5 text-gold" />
            )}
            <span className="hidden sm:inline">Bildirim açık · </span>Test
          </Button>
        ) : status === "off" ? (
          <Button variant="gold" size="sm" onClick={enable} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Bell className="h-4 w-4 mr-1.5" />
            )}
            Bildirimleri Aç
          </Button>
        ) : status === "ios-install" ? (
          <span className="text-xs text-muted-foreground max-w-[220px]">
            iPhone&apos;da bildirim için: Paylaş → Ana Ekrana Ekle, sonra
            uygulamayı ana ekrandan açın.
          </span>
        ) : status === "unsupported" ? (
          <span className="text-xs text-muted-foreground">
            Bu tarayıcı bildirim desteklemiyor.
          </span>
        ) : null}
        {message && (
          <span className="text-xs text-muted-foreground">{message}</span>
        )}
      </div>
    </>
  );
}
