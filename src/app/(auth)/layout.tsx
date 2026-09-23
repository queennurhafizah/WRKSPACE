import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { getBrand } from "@/lib/brand";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getBrand();

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel brand (desktop) */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-brand blur-3xl" />
          <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-sky blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-56 w-56 rounded-full bg-sage blur-3xl" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo brandName={brand.name} className="[&_span:last-child]:text-white" />
          <div>
            <div className="inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
              <Sparkles className="h-3 w-3" /> {brand.name}
            </div>
            <h2 className="mt-5 max-w-md font-display text-4xl font-extrabold leading-tight text-white">
              {brand.tagline}
            </h2>
            <p className="mt-4 max-w-sm text-white/70">
              Masuk untuk memesan space, menerapkan promo, dan mengelola
              reservasimu.
            </p>
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>
      </div>

      {/* Panel form */}
      <div className="flex flex-col">
        <div className="p-6 lg:hidden">
          <Logo brandName={brand.name} />
        </div>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="p-6 text-center text-xs text-ink/40">
          <Link href="/" className="hover:text-ink">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
