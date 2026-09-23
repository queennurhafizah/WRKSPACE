"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import type { SpaceTipe } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { value: SpaceTipe | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "desk", label: "Personal Desk" },
  { value: "meeting_room", label: "Meeting Room" },
  { value: "private_office", label: "Private Office" },
];

export function SpaceFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeTipe = (params.get("tipe") as SpaceTipe | null) ?? "all";
  const [search, setSearch] = useState(params.get("search") ?? "");

  // Debounce update URL untuk pencarian
  useEffect(() => {
    const current = params.get("search") ?? "";
    if (search === current) return;
    const t = setTimeout(() => {
      pushWith({ search: search || undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function pushWith(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = activeTipe === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() =>
                pushWith({ tipe: tab.value === "all" ? undefined : tab.value })
              }
              className={cn(
                "rounded-pill border-2 px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-brand bg-brand text-white"
                  : "border-black/10 bg-white text-ink/70 hover:border-brand-border hover:text-brand-text",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="relative sm:w-72">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau fasilitas..."
          className="w-full rounded-pill border-2 border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-ink/35 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
        />
      </div>
    </div>
  );
}
