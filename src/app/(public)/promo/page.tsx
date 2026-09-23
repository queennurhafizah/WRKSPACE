import { Tag, TicketPercent } from "lucide-react";
import { diskonApi } from "@/lib/api/diskon";
import type { Diskon } from "@/lib/types";
import { tanggalPanjang } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";

export const dynamic = "force-dynamic";

export default async function PromoPage() {
  let promos: Diskon[] = [];
  try {
    promos = await diskonApi.active();
  } catch {
    promos = [];
  }

  return (
    <div className="container-page py-12">
      <header className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-butter-text">
          <Tag className="h-5 w-5" />
          <span className="font-display text-sm font-bold">Promo & diskon</span>
        </div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Kode promo yang sedang berlaku
        </h1>
        <p className="mt-3 text-ink/60">
          Masukkan salah satu kode di bawah saat mengisi form reservasi untuk
          mendapatkan potongan harga.
        </p>
      </header>

      {promos.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => (
            <div
              key={p.id}
              className="relative overflow-hidden rounded-2xl border-2 border-butter-border bg-butter-soft p-6"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-4xl font-extrabold text-butter-deep">
                  {p.persentase_diskon}%
                </span>
                <Badge className="border-butter-border bg-white text-butter-text">
                  Aktif
                </Badge>
              </div>
              <p className="mt-4 font-mono text-base font-bold tracking-wider text-ink">
                {p.nama_diskon}
              </p>
              <p className="mt-1 text-xs text-ink/55">
                Berlaku hingga {tanggalPanjang(p.tanggal_akhir)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={<TicketPercent className="h-6 w-6" />}
            title="Belum ada promo aktif"
            description="Pantau terus halaman ini — promo baru bisa muncul kapan saja."
          />
        </div>
      )}
    </div>
  );
}
