import { Suspense } from "react";
import { LayoutGrid } from "lucide-react";
import { spacesApi } from "@/lib/api/spaces";
import type { Space, SpaceTipe } from "@/lib/types";
import { SpaceCard } from "@/components/space/space-card";
import { SpaceFilter } from "@/components/space/space-filter";
import { EmptyState } from "@/components/ui/feedback";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tipe?: string; search?: string }>;
}

export default async function SpacesPage({ searchParams }: PageProps) {
  const { tipe, search } = await searchParams;

  let spaces: Space[] = [];
  try {
    spaces = await spacesApi.list({
      tipe: tipe as SpaceTipe | undefined,
      search,
    });
  } catch {
    spaces = [];
  }

  return (
    <div className="container-page py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Katalog space
        </h1>
        <p className="mt-3 text-ink/60">
          Temukan meja atau ruangan yang sesuai kebutuhanmu, lalu cek
          ketersediaannya secara langsung.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<div className="h-12" />}>
          <SpaceFilter />
        </Suspense>
      </div>

      {spaces.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((s) => (
            <SpaceCard key={s.id} space={s} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={<LayoutGrid className="h-6 w-6" />}
            title="Tidak ada space ditemukan"
            description="Coba ubah filter tipe atau kata kunci pencarianmu."
          />
        </div>
      )}
    </div>
  );
}
