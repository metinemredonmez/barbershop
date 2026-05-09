"use client";

import { useEffect, useState } from "react";
import { Calendar, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={`md:hidden fixed bottom-4 inset-x-4 z-30 transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
        }`}
      >
        <a
          href="#randevu"
          className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-600 text-black font-semibold shadow-lg shadow-gold/30 active:scale-[0.98] transition-transform"
        >
          <Calendar className="h-5 w-5" />
          Randevu Al
        </a>
      </div>

      <a
        href={`https://wa.me/${siteConfig.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="hidden md:flex fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white items-center justify-center shadow-xl shadow-green-500/30 hover:scale-110 transition-all"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </>
  );
}
