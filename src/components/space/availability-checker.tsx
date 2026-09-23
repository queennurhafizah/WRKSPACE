"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { spacesApi } from "@/lib/api/spaces";
import { ApiError } from "@/lib/api/client";
import type { Availability } from "@/lib/types";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { rupiah, jam } from "@/lib/format";

export function AvailabilityChecker({
  spaceId,
  hargaPerJam,
}: {
  spaceId: number;
  hargaPerJam: number;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [jamMulai, setJamMulai] = useState("09:00");
  const [durasi, setDurasi] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await spacesApi.availability({
        id_space: spaceId,
        tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasi,
      });
      setResult(data);
    } catch (e) {
      setResult({
        available: false,
        id_space: spaceId,
        nama_space: "",
        tanggal,
        jam_mulai: jamMulai,
        jam_selesai: "",
        durasi_jam: durasi,
        harga_per_jam: hargaPerJam,
        estimasi_total: 0,
        conflicts: [],
      });
      setError(
        e instanceof ApiError
          ? e.message
          : "Gagal mengecek ketersediaan. Coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  const reservasiHref =
    `/reservasi/new?space=${spaceId}` +
    `&tanggal=${encodeURIComponent(tanggal)}` +
    `&jam=${encodeURIComponent(jamMulai)}` +
    `&durasi=${durasi}`;

  return (
    <div className="rounded-2xl border-2 border-black/[0.06] bg-white p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold">Cek ketersediaan</h3>
      <p className="mt-1 text-sm text-ink/55">
        Pilih tanggal dan jam untuk melihat estimasi biaya.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Tanggal" htmlFor="tanggal">
          <Input
            id="tanggal"
            type="date"
            min={today}
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Jam mulai" htmlFor="jam">
            <Input
              id="jam"
              type="time"
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
            />
          </Field>
          <Field label="Durasi (jam)" htmlFor="durasi">
            <Input
              id="durasi"
              type="number"
              min={1}
              max={12}
              value={durasi}
              onChange={(e) => setDurasi(Math.max(1, Number(e.target.value)))}
            />
          </Field>
        </div>

        <Button onClick={check} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Mengecek...
            </>
          ) : (
            <>
              <CalendarCheck className="h-4 w-4" /> Cek ketersediaan
            </>
          )}
        </Button>
      </div>

      {result && (
        <div
          className={`mt-5 rounded-xl border-2 p-4 ${
            result.available
              ? "border-sage-border bg-sage-soft"
              : "border-rose-border bg-rose-soft"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.available ? (
              <CheckCircle2 className="h-5 w-5 text-sage-text" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-text" />
            )}
            <span
              className={`font-display text-sm font-bold ${
                result.available ? "text-sage-deep" : "text-rose-deep"
              }`}
            >
              {result.available ? "Tersedia!" : "Tidak tersedia"}
            </span>
          </div>

          {result.available ? (
            <>
              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Jam" value={`${jam(result.jam_mulai)} – ${jam(result.jam_selesai)}`} />
                <Row label="Durasi" value={`${result.durasi_jam} jam`} />
                <Row label="Tarif" value={`${rupiah(result.harga_per_jam)} / jam`} />
                <div className="flex items-center justify-between border-t border-sage-border pt-2">
                  <dt className="font-semibold text-ink">Estimasi total</dt>
                  <dd className="font-display text-base font-extrabold text-sage-deep">
                    {rupiah(result.estimasi_total)}
                  </dd>
                </div>
              </dl>
              <Link href={reservasiHref} className="mt-4 block">
                <Button className="w-full">Pesan sekarang</Button>
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-rose-text">
              {error ?? "Space sudah dibooking pada jadwal tersebut. Coba jam lain."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/55">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}