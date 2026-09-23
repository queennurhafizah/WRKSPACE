"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = await authApi.login({ username, password });
      if (auth.role !== "admin_space") {
        setError("Akun ini bukan akun pengelola space.");
        setLoading(false);
        return;
      }
      signIn(auth);
      router.replace(params.get("next") ?? "/admin");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal masuk. Coba lagi.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-pill border-2 border-sky-border bg-sky-soft px-3 py-1 text-xs font-bold text-sky-text">
        <ShieldCheck className="h-3.5 w-3.5" /> Panel Pengelola
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
        Masuk sebagai admin
      </h1>
      <p className="mt-2 text-ink/60">
        Kelola space, member, promo, dan reservasi coworking kamu.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border-2 border-rose-border bg-rose-soft px-4 py-3 text-sm font-medium text-rose-text">
            {error}
          </div>
        )}
        <Field label="Username admin" htmlFor="username" required>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </Field>

        <Button type="submit" variant="sky" disabled={loading} className="w-full" size="lg">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk ke dashboard"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Kamu member?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-text hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
