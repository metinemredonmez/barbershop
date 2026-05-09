"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const links = [
  { href: "#hizmetler", label: "Hizmetler" },
  { href: "#hakkimda", label: "Hakkımda" },
  { href: "#galeri", label: "Galeri" },
  { href: "#yorumlar", label: "Yorumlar" },
  { href: "#iletisim", label: "İletişim" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-lg border-b border-border/60"
          : "bg-transparent"
      )}
    >
      <div className="container-narrow flex h-16 md:h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center shadow-lg shadow-gold/20 group-hover:shadow-gold/40 transition-shadow">
            <Scissors className="h-5 w-5 text-black" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-wider text-gold">
              {siteConfig.brand}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Hair Artist
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button variant="gold" size="sm" asChild>
            <a href="#randevu">Randevu Al</a>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-lg">
          <div className="container-narrow py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-muted-foreground hover:text-gold transition-colors border-b border-border/40 last:border-0"
              >
                {l.label}
              </a>
            ))}
            <Button variant="gold" className="mt-4" asChild>
              <a href="#randevu" onClick={() => setOpen(false)}>
                Randevu Al
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
