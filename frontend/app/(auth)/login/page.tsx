"use client";

import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultRouteByRole } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("admin@meslite.com");
  const [password, setPassword] = useState("Test1234!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace(defaultRouteByRole(session.user.role));
    }
  }, [router, session?.user, status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Giriş bilgileri doğrulanamadı.");
      return;
    }

    router.push(defaultRouteByRole(session?.user?.role));
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-[2rem] bg-gradient-to-br from-ink via-steel to-amber-700 p-10 text-white shadow-panel">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">MES-Lite</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight">Üretim akışını tek bakışta yönetin.</h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Tekstil tesisleri için tasarlanmış hafif MES-Lite paneli ile makine durumu, fire oranı,
            malzeme hareketi ve vardiya operasyonlarını aynı ekranda izleyin.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "Canlı makine görünümü",
              "Fire ve üretim trendi",
              "Rol bazlı güvenli erişim"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>
        <Card className="self-center">
          <CardHeader>
            <CardTitle>Sisteme Giriş</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button className="w-full" disabled={loading} type="submit">
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Demo kullanıcılar</p>
              <p className="mt-2">`admin@meslite.com` / `Test1234!`</p>
              <p>`manager@meslite.com` / `Test1234!`</p>
              <p>`supervisor1@meslite.com` / `Test1234!`</p>
              <p>`operator1@meslite.com` / `Test1234!`</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
