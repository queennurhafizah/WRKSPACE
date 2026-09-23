"use client";

import { useState } from "react";
import { Monitor, Users, Building2 } from "lucide-react";
import type { SpaceTipe } from "@/lib/types";
import { resolveImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

const TIPE_ICON: Record<SpaceTipe, React.ReactNode> = {
  desk: <Monitor className="h-8 w-8" />,
  meeting_room: <Users className="h-8 w-8" />,
  private_office: <Building2 className="h-8 w-8" />,
};

const TIPE_GRADIENT: Record<SpaceTipe, string> = {
  desk: "from-brand-soft to-brand-border text-brand-deep",
  meeting_room: "from-sky-soft to-sky-border text-sky-deep",
  private_office: "from-sage-soft to-sage-border text-sage-deep",
};

export function SpaceThumb({
  foto,
  fotoUrl,
  tipe,
  alt,
  className,
}: {
  foto?: string | null;
  fotoUrl?: string | null;
  tipe: SpaceTipe;
  alt: string;
  className?: string;
}) {
  const src = resolveImageUrl(fotoUrl ?? foto);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-gradient-to-br",
          TIPE_GRADIENT[tipe],
          className,
        )}
      >
        {TIPE_ICON[tipe]}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
