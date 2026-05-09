"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/site-config";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş başarısız");
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-background to-background">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-gold mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Siteye dön
          </Link>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mb-4">
            <Lock className="h-6 w-6 text-gold" />
          </div>
          <h1 className="font-display text-2xl font-bold">Yönetim Paneli</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {siteConfig.brand} · Randevu yönetimi
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={loading || !password}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Giriş Yap
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Yetkisiz erişim girişimleri kayıt altına alınır.
        </p>
      </div>
    </div>
  );
}
