"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function SignInForm() {
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
      // Halaman ini khusus member. Akun admin wajib lewat /admin-login.
      if (auth.role !== "member") {
        setError(
          "Akun ini adalah akun pengelola. Silakan masuk lewat halaman login admin.",
        );
        setLoading(false);
        return;
      }
      signIn(auth);
      router.replace(params.get("next") ?? "/akun");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal masuk. Coba lagi.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Selamat datang kembali
      </h1>
      <p className="mt-2 text-ink/60">Masuk untuk melanjutkan reservasimu.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border-2 border-rose-border bg-rose-soft px-4 py-3 text-sm font-medium text-rose-text">
            {error}
          </div>
        )}
        <Field label="Username" htmlFor="username" required>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username kamu"
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

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Belum punya akun?{" "}
        <Link href="/sign-up" className="font-semibold text-brand-text hover:underline">
          Daftar sekarang
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-ink/40">
        Pengelola space?{" "}
        <Link href="/admin-login" className="font-semibold hover:text-ink">
          Masuk sebagai admin
        </Link>
      </p>
    </div>
  );
}
