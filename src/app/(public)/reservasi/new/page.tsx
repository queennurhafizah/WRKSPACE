"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RequireMember } from "@/components/auth/require-member";
import { ReservasiForm } from "@/components/member/reservasi-form";
import { Button } from "@/components/ui/button";

export default function ReservasiBaruPage() {
  return (
    <RequireMember>
      <Suspense
        fallback={
          <div className="container-page flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        }
      >
        <ReservasiBaruContent />
      </Suspense>
    </RequireMember>
  );
}

function ReservasiBaruContent() {
  const params = useSearchParams();
  const spaceId = Number(params.get("space"));
  const tanggal = params.get("tanggal") ?? undefined;
  const jam = params.get("jam") ?? undefined;
  const durasi = Number(params.get("durasi")) || undefined;

  if (!Number.isFinite(spaceId) || spaceId <= 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">Space tidak dipilih</h1>
        <p className="mt-2 text-sm text-ink/60">
          Pilih dulu space yang ingin kamu pesan dari katalog.
        </p>
        <Link href="/spaces" className="mt-5 inline-block">
          <Button>Lihat katalog space</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <Link
        href={`/spaces/${spaceId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke detail space
      </Link>

      <div className="mt-5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Buat Reservasi
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Atur jadwal, cek ketersediaan, lalu konfirmasi pemesananmu.
        </p>
      </div>

      <div className="mt-8">
        <ReservasiForm
          spaceId={spaceId}
          initialTanggal={tanggal}
          initialJam={jam}
          initialDurasi={durasi}
        />
      </div>
    </div>
  );
}