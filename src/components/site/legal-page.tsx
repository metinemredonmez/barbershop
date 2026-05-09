import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="container-narrow max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-gold mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Ana sayfaya dön
          </Link>
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Yasal Bilgilendirme
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Son güncelleme: {updated}
          </p>
          <div className="mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />

          <article className="mt-12 prose prose-invert prose-headings:font-display prose-headings:tracking-tight prose-h2:text-2xl prose-h2:text-gold prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:text-foreground/90 prose-h3:mt-6 prose-h3:mb-2 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-gold hover:prose-a:underline max-w-none space-y-5 text-sm leading-relaxed">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
