import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "",
        className
      )}
    >
      {eyebrow && (
        <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted-foreground md:text-lg">{description}</p>
      )}
      <div
        className={cn(
          "mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}
