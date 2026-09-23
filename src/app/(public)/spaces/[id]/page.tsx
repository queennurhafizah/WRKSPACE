import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Tag, Phone } from "lucide-react";
import { spacesApi } from "@/lib/api/spaces";
import { ApiError } from "@/lib/api/client";
import type { Space } from "@/lib/types";
import { rupiah, labelTipe, resolveImageUrl, TIPE_THEME } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { SpaceThumb } from "@/components/space/space-thumb";
import { AvailabilityChecker } from "@/components/space/availability-checker";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  let space: Space;
  try {
    space = await spacesApi.detail(id);
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) notFound();
    throw e;
  }

  const theme = TIPE_THEME[space.tipe];
  const heroUrl = resolveImageUrl(space.foto_url ?? space.foto);

  return (
    <div className="container-page py-8">
      <Link
        href="/spaces"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Kolom kiri: foto + info */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
            <SpaceThumb
              foto={space.foto}
              fotoUrl={heroUrl}
              tipe={space.tipe}
              alt={space.nama_space}
              className="h-full w-full"
            />
            <div className="absolute left-4 top-4">
              <Badge className={cn(theme.soft, theme.border, theme.text)}>
                {labelTipe(space.tipe)}
              </Badge>
            </div>
          </div>

          <div className="mt-6">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {space.nama_space}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink/60">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Kapasitas {space.kapasitas} orang
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> {rupiah(space.harga_per_jam)} / jam
              </span>
            </div>

            <div className="mt-6">
              <h2 className="font-display text-lg font-bold">Fasilitas & deskripsi</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/70">
                {space.deskripsi}
              </p>
            </div>

            {space.owner && (
              <div className="mt-6 rounded-2xl border-2 border-black/[0.06] bg-white p-5">
                <h3 className="font-display text-sm font-bold text-ink">Dikelola oleh</h3>
                <p className="mt-1 text-sm text-ink/70">{space.owner.nama_coworking}</p>
                {space.owner.telp && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink/60">
                    <Phone className="h-3.5 w-3.5" /> {space.owner.telp}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Kolom kanan: cek ketersediaan (sticky di desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AvailabilityChecker spaceId={space.id} hargaPerJam={space.harga_per_jam} />
        </div>
      </div>
    </div>
  );
}
