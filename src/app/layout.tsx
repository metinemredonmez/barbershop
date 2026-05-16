import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/site/cookie-banner";
import { OneSignalInit } from "@/components/onesignal-init";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const brand = process.env.NEXT_PUBLIC_BARBER_BRAND || "ALI BARBER";
const tagline =
  process.env.NEXT_PUBLIC_BARBER_TAGLINE || "Premium Erkek Bakımı";

export const metadata: Metadata = {
  title: `${brand} — ${tagline}`,
  description:
    "Anatomik saç kesimi, sakal tasarımı ve klasik ustura tıraşı. Online randevu al, sıra bekleme.",
  openGraph: {
    title: `${brand} — ${tagline}`,
    description:
      "Anatomik saç kesimi, sakal tasarımı ve klasik ustura tıraşı. Online randevu al, sıra bekleme.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground`}
      >
        {children}
        <CookieBanner />
        <OneSignalInit />
      </body>
    </html>
  );
}
