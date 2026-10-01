import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// iPhone'da web push sadece "Ana Ekrana Ekle" ile kurulan uygulamada çalışır;
// bunun için standalone bir manifest gerekiyor. Berber paneli açılır.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.brand} — Randevular`,
    short_name: "Randevular",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [{ src: "/logo-mark-gold.png", sizes: "295x242", type: "image/png" }],
  };
}
