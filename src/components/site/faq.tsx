"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28">
      <div className="container-narrow max-w-3xl">
        <SectionHeading
          eyebrow="Sıkça Sorulan Sorular"
          title="Aklındakileri Yanıtlayalım"
        />

        <div className="mt-12 space-y-3">
          {siteConfig.faqs.map((f, i) => (
            <Card
              key={i}
              className={cn(
                "overflow-hidden transition-colors",
                open === i && "border-gold/30"
              )}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="font-medium">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gold shrink-0 transition-transform duration-300",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  open === i
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-4">
                    {f.a}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
