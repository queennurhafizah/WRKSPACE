import Link from "next/link";
import {
  Monitor,
  Users,
  Building2,
  ArrowRight,
  Tag,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { spacesApi } from "@/lib/api/spaces";
import { diskonApi } from "@/lib/api/diskon";
import { getBrand } from "@/lib/brand";
import type { Space, SpaceType, Diskon, SpaceTipe } from "@/lib/types";
import { rupiah, labelTipe, tanggalPendek, TIPE_THEME } from "@/lib/format";
import { Hero } from "@/components/site/hero";
import { Blobs } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpaceCard } from "@/components/space/space-card";

export const dynamic = "force-dynamic";

const TIPE_ICON: Record<SpaceTipe, React.ReactNode> = {
  desk: <Monitor className="h-6 w-6" />,
  meeting_room: <Users className="h-6 w-6" />,
  private_office: <Building2 className="h-6 w-6" />,
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

export default async function LandingPage() {
  const brand = await getBrand();
  const [types, spaces, promos] = await Promise.all([
    safe<SpaceType[]>(spacesApi.types(), []),
    safe<Space[]>(spacesApi.list(), []),
    safe<Diskon[]>(diskonApi.active(), []),
  ]);

  const featured = spaces.slice(0, 6);

  return (
    <>
      {/* ===== HERO — selalu center karena tidak ada foto hero ===== */}
      <section className="relative overflow-hidden">
        <Blobs />
        <div
          className="dot-grid pointer-events-none absolute right-0 top-0 h-52 w-52 opacity-50"
          aria-hidden
        />
        <div
          className="dot-grid pointer-events-none absolute bottom-0 left-0 h-40 w-40 opacity-40"
          aria-hidden
        />
        <div className="container-page py-20 sm:py-28 flex justify-center">
          <Hero
            brandName={brand.name}
            tagline={brand.tagline}
            centered={true}
          />
        </div>
      </section>

      {/* ===== KEUNGGULAN ===== */}
      <section className="container-page">
        <div className="grid gap-4 rounded-3xl border-2 border-black/[0.06] bg-white p-6 shadow-soft sm:grid-cols-3">
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Booking cepat"
            desc="Pilih space, tentukan jam, selesai dalam hitungan detik."
            tone="brand"
          />
          <Feature
            icon={<Clock className="h-5 w-5" />}
            title="Fleksibel per jam"
            desc="Sewa sesuai kebutuhan — dari satu jam sampai seharian."
            tone="sky"
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="E-ticket & QR"
            desc="Bukti reservasi digital dengan QR untuk check-in di lokasi."
            tone="sage"
          />
        </div>
      </section>

      {/* ===== TIPE SPACE ===== */}
      {types.length > 0 && (
        <section className="container-page py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pilih ruang yang pas buat kamu
            </h2>
            <p className="mt-3 text-ink/60">
              Tiga tipe space dengan fasilitas berbeda, siap menampung cara kerjamu.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {types.map((t) => {
              const theme = TIPE_THEME[t.tipe];
              return (
                <div key={t.tipe} className={`rounded-2xl p-6 ${theme.soft}`}>
                  <span
                    className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${theme.icon}`}
                  >
                    {TIPE_ICON[t.tipe]}
                  </span>
                  <h3 className={`font-display text-lg font-bold ${theme.text}`}>
                    {t.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {t.deskripsi}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== SPACE UNGGULAN ===== */}
      <section className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Space populer
            </h2>
            <p className="mt-3 text-ink/60">
              Ruangan dan meja yang siap kamu pesan hari ini.
            </p>
          </div>
          <Link href="/spaces" className="hidden sm:block">
            <Button variant="ghost">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SpaceCard key={s.id} space={s} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-black/10 bg-white/50 p-14 text-center">
            <p className="font-display text-lg font-bold text-ink/40">
              Belum ada space
            </p>
            <p className="mt-2 text-sm text-ink/30">
              Space akan muncul di sini setelah admin menambahkannya.
            </p>
          </div>
        )}

        <div className="mt-6 sm:hidden">
          <Link href="/spaces">
            <Button variant="ghost" className="w-full">
              Lihat semua space <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== PROMO ===== */}
      {promos.length > 0 && (
        <section className="container-page py-20">
          <div className="rounded-3xl bg-butter-soft p-8 sm:p-10">
            <div className="flex items-center gap-2 text-butter-text mb-2">
              <Tag className="h-5 w-5" />
              <span className="font-display text-sm font-bold">Promo berlangsung</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Hemat lebih banyak dengan kode promo
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promos.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border-2 border-butter-border bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-extrabold text-butter-deep">
                      {p.persentase_diskon}%
                    </span>
                    <Badge className="border-butter-border bg-butter-soft text-butter-text">
                      Aktif
                    </Badge>
                  </div>
                  <p className="mt-3 font-mono text-sm font-bold tracking-wide text-ink">
                    {p.nama_diskon}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">
                    Berlaku s.d. {tanggalPendek(p.tanggal_akhir)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA AKHIR ===== */}
      <section className="container-page pb-8 mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center sm:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute -left-10 top-0 h-56 w-56 rounded-full bg-brand blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-sky blur-3xl" />
          </div>
          <div className="relative">
            <p className="font-accent text-2xl font-bold text-brand mb-3">
              {brand.tagline}
            </p>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Siap mulai kerja di ruang yang tepat?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Daftar gratis, pilih space favoritmu, dan amankan jadwalmu sekarang.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/sign-up">
                <Button size="lg">Buat akun gratis</Button>
              </Link>
              <Link href="/spaces">
                <Button variant="sky" size="lg">
                  Jelajahi space
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  desc,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: "brand" | "sky" | "sage";
}) {
  const map = {
    brand: "bg-brand-soft text-brand-text",
    sky: "bg-sky-soft text-sky-text",
    sage: "bg-sage-soft text-sage-text",
  } as const;
  return (
    <div className="flex gap-4">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${map[tone]}`}
      >
        {icon}
      </span>
      <div>
        <h3 className="font-display text-base font-bold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink/60">{desc}</p>
      </div>
    </div>
  );
}
