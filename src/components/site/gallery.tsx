import { SectionHeading } from "./section-heading";
import { siteConfig } from "@/lib/site-config";
import { Scissors, Crown, Baby, Sparkles } from "lucide-react";

const styleIcon = (style: string) => {
  switch (style) {
    case "groom":
      return Crown;
    case "kids":
      return Baby;
    case "shave":
      return Sparkles;
    default:
      return Scissors;
  }
};

const styleGradient = (i: number) => {
  const gradients = [
    "from-zinc-900 via-zinc-800 to-black",
    "from-stone-900 via-stone-800 to-black",
    "from-neutral-900 via-neutral-800 to-black",
    "from-zinc-800 via-zinc-900 to-black",
    "from-stone-800 via-stone-900 to-black",
    "from-neutral-800 via-neutral-900 to-black",
    "from-zinc-900 via-black to-zinc-900",
    "from-stone-900 via-black to-stone-900",
  ];
  return gradients[i % gradients.length];
};

export function Gallery() {
  return (
    <section id="galeri" className="py-20 md:py-28">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Portfolyo"
          title="İşlerimizden Kareler"
          description="Yapılan her kesim bir imza. Aşağıda son çalışmalardan bir seçki."
        />

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {siteConfig.gallery.map((item, i) => {
            const Icon = styleIcon(item.style);
            return (
              <div
                key={item.id}
                className={`group relative aspect-square rounded-lg overflow-hidden border border-border/60 hover:border-gold/40 transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-br ${styleGradient(
                  i
                )}`}
              >
                <div className="absolute inset-0 bg-noise opacity-[0.04]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="h-12 w-12 text-gold/20 group-hover:text-gold/40 group-hover:scale-110 transition-all" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="text-xs uppercase tracking-widest text-gold/80 mb-1">
                    {item.style}
                  </div>
                  <div className="font-medium text-sm">{item.label}</div>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  {siteConfig.name}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Daha fazlası için Instagram&apos;ı takip edin:{" "}
          <a
            href={`https://instagram.com/${siteConfig.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            @{siteConfig.instagram}
          </a>
        </p>
      </div>
    </section>
  );
}
