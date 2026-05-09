import Link from "next/link";
import { Scissors, Instagram, Phone, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/20 py-14">
      <div className="container-narrow">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center shadow-lg shadow-gold/20">
                <Scissors className="h-5 w-5 text-black" />
              </div>
              <div>
                <div className="font-display text-lg font-bold tracking-wider text-gold">
                  {siteConfig.brand}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Hair Artist
                </div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium erkek bakımı ve modern barber deneyimi.
              Klasik ustura tıraşının ritüelini, modern tekniğin keskinliğiyle
              birleştiriyoruz.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">
              Hızlı Bağlantılar
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#hizmetler" className="hover:text-gold transition-colors">
                  Hizmetler
                </a>
              </li>
              <li>
                <a href="#hakkimda" className="hover:text-gold transition-colors">
                  Hakkımda
                </a>
              </li>
              <li>
                <a href="#galeri" className="hover:text-gold transition-colors">
                  Galeri
                </a>
              </li>
              <li>
                <a href="#yorumlar" className="hover:text-gold transition-colors">
                  Yorumlar
                </a>
              </li>
              <li>
                <a href="#randevu" className="hover:text-gold transition-colors">
                  Randevu Al
                </a>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-gold transition-colors"
                >
                  Yönetim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">
              İletişim
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>{siteConfig.address}</li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gold" />
                <a
                  href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                  className="hover:text-gold transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-gold" />
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-3.5 w-3.5 text-gold" />
                <a
                  href={`https://instagram.com/${siteConfig.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  @{siteConfig.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.brand}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
