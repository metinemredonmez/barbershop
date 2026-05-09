import { SectionHeading } from "./section-heading";
import { siteConfig } from "@/lib/site-config";

export function Gallery() {
  return (
    <section id="galeri" className="py-20 md:py-28">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Saç Şekilleri"
          title="Stil & İlham"
          description="Sunduğumuz hizmetlerden ve stillerden örnekler. Daha fazlası için Instagram'ı takip edebilirsin."
        />

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {siteConfig.gallery.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-border/60 hover:border-gold/40 transition-all hover:scale-[1.02] cursor-pointer bg-secondary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="text-[10px] uppercase tracking-widest text-gold/80 mb-1">
                  {item.style}
                </div>
                <div className="font-medium text-sm">{item.label}</div>
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                {siteConfig.name}
              </div>
            </div>
          ))}
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
