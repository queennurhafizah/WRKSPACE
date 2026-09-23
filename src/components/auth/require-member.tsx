"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

/**
 * Pembungkus halaman khusus member. Alur:
 * - Masih memuat sesi → tampilkan spinner.
 * - Belum login       → arahkan ke /sign-in?next=<halaman ini>.
 * - Login sebagai admin → tampilkan pesan + tautan ke dashboard admin.
 * - Login sebagai member → render isi halaman.
 */
export function RequireMember({ children }: { children: React.ReactNode }) {
  const { user, loading, isMember, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <div className="container-page flex min-h-[55vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-ink/60">Mengarahkan ke halaman masuk…</p>
        <Link href="/sign-in">
          <Button variant="outline">
            <LogIn className="h-4 w-4" /> Masuk
          </Button>
        </Link>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-soft text-sky-text">
          <LayoutDashboard className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-display text-xl font-extrabold">Halaman khusus member</h1>
          <p className="mt-1 text-sm text-ink/60">
            Kamu masuk sebagai pengelola. Area ini hanya untuk akun member.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="sky">Ke dashboard admin</Button>
        </Link>
      </div>
    );
  }

  if (!isMember) return null;
  return <>{children}</>;
}