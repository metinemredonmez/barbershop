import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { siteConfig } from "@/lib/site-config";

export function WorkingHours() {
  const today = new Date().getDay();
  const dayMap = [6, 0, 1, 2, 3, 4, 5];

  return (
    <section className="py-20">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Çalışma Saatleri"
          title="Ne Zaman Açıkız?"
          description="Son randevu kapanıştan 45 dakika önce alınabilir."
        />

        <Card className="mt-12 max-w-2xl mx-auto p-2 overflow-hidden">
          <div className="divide-y divide-border/60">
            {siteConfig.workingHours.map((d, i) => {
              const isToday = dayMap[today] === i;
              return (
                <div
                  key={d.day}
                  className={`flex items-center justify-between px-6 py-4 transition-colors ${
                    isToday ? "bg-gold/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isToday && (
                      <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                    )}
                    <span
                      className={`font-medium ${
                        isToday ? "text-gold" : ""
                      }`}
                    >
                      {d.day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase tracking-widest text-gold/80 px-2 py-0.5 rounded-full border border-gold/30">
                        Bugün
                      </span>
                    )}
                  </div>
                  <div
                    className={`tabular-nums text-sm ${
                      d.closed
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {d.hours}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 px-6 py-4 bg-secondary/30 border-t border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-gold" />
            Online randevu sistemi 7/24 açık. Randevunuzu hemen alabilirsiniz.
          </div>
        </Card>
      </div>
    </section>
  );
}
