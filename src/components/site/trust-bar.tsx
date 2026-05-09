import { siteConfig } from "@/lib/site-config";

export function TrustBar() {
  return (
    <section className="border-y border-border/60 bg-secondary/30">
      <div className="container-narrow grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60">
        {siteConfig.stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-background py-8 px-4 text-center"
          >
            <div className="font-display text-3xl md:text-4xl font-bold text-gold-gradient">
              {stat.value}
            </div>
            <div className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
