import { Monitor, Users, Building2, Phone, User } from "lucide-react";
import { spacesApi } from "@/lib/api/spaces";
import { getBrand } from "@/lib/brand";
import type { SpaceType, SpaceTipe } from "@/lib/types";
import { TIPE_THEME } from "@/lib/format";
import { Blobs } from "@/components/ui/feedback";

export const dynamic = "force-dynamic";

const TIPE_ICON: Record<SpaceTipe, React.ReactNode> = {
  desk: <Monitor className="h-6 w-6" />,
  meeting_room: <Users className="h-6 w-6" />,
  private_office: <Building2 className="h-6 w-6" />,
};

export default async function AboutPage() {
  const brand = await getBrand();
  let types: SpaceType[] = [];
  try {
    types = await spacesApi.types();
  } catch {
    types = [];
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <Blobs />
        <div className="container-page py-20">
          <p className="text-sm font-medium text-ink/45">Tentang kami</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {brand.name} — ruang kerja untuk semua orang
          </h1>
          <p className="font-accent text-2xl font-bold text-brand mt-3 mb-4">
            {brand.tagline} Kami menyediakan ruang kerja yang nyaman dan
            fleksibel — mulai dari personal desk untuk fokus sendirian, meeting
            room untuk kolaborasi tim, hingga private office yang eksklusif.
          </p>
        </div>
      </section>

      {types.length > 0 && (
        <section className="container-page pb-16 mt-20">
          <div className="grid gap-4 md:grid-cols-3">
            {types.map((t) => {
              const theme = TIPE_THEME[t.tipe];
              return (
                <div key={t.tipe} className={`rounded-2xl p-6 ${theme.soft}`}>
                  <span className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${theme.icon}`}>
                    {TIPE_ICON[t.tipe]}
                  </span>
                  <h3 className={`font-display text-lg font-bold ${theme.text}`}>{t.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{t.deskripsi}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-page pb-24">
        <div className="rounded-3xl border-2 border-black/[0.06] bg-white p-8 shadow-soft">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Informasi pengelola</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand-text">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-ink/50">Penanggung jawab</p>
                <p className="font-semibold text-ink">{brand.owner}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-soft text-sky-text">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-ink/50">Kontak</p>
                <p className="font-semibold text-ink">{brand.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
