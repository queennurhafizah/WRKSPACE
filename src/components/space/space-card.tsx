import Link from "next/link";
import { Users } from "lucide-react";
import type { Space } from "@/lib/types";
import { rupiah, labelTipe, TIPE_THEME } from "@/lib/format";
import { SpaceThumb } from "./space-thumb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SpaceCard({ space }: { space: Space }) {
  const theme = TIPE_THEME[space.tipe];
  return (
    <Link
      href={`/spaces/${space.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-black/[0.06] bg-white shadow-soft transition-transform duration-200 hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SpaceThumb
          foto={space.foto}
          fotoUrl={space.foto_url}
          tipe={space.tipe}
          alt={space.nama_space}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge className={cn(theme.soft, theme.border, theme.text)}>
            {labelTipe(space.tipe)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold text-ink">
          {space.nama_space}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/55">
          <Users className="h-3.5 w-3.5" />
          Kapasitas {space.kapasitas} orang
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-ink/60">
          {space.deskripsi}
        </p>
        <div className="mt-auto flex items-baseline gap-1 pt-4">
          <span className="font-display text-lg font-extrabold text-ink">
            {rupiah(space.harga_per_jam)}
          </span>
          <span className="text-xs text-ink/50">/ jam</span>
        </div>
      </div>
    </Link>
  );
}
