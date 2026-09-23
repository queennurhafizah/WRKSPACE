"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  Receipt,
  Ticket,
  Wallet,
} from "lucide-react";
import { reservasiApi } from "@/lib/api/reservasi";
import type { Reservasi, ReservasiHistory } from "@/lib/types";
import { jam, rupiah, tanggalPanjang } from "@/lib/format";
import { statusMeta } from "@/lib/status";
import { RequireMember } from "@/components/auth/require-member";
import { Badge } from "@/components/ui/badge";
import { Field, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/feedback";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function RiwayatPage() {
  return (
    <RequireMember>
      <RiwayatContent />
    </RequireMember>
  );
}

function RiwayatContent() {
  const now = new Date();
  const [month, setMonth] = useState(10); // Default ke Oktober sesuai contoh data
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<ReservasiHistory | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reservasiApi.history(month, year);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = data?.items ?? [];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="container-page py-10">
      <Link
        href="/akun"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke reservasi saya
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Riwayat Pemesanan
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Rekap reservasi dan pengeluaranmu per bulan.
          </p>
        </div>

        {/* Filter bulan & tahun */}
        <div className="flex items-end gap-3">
          <Field label="Bulan" className="w-40">
            <Select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {BULAN.map((b, i) => (
                <option key={b} value={i + 1}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tahun" className="w-28">
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-black/[0.06] bg-white p-5 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-soft text-sky-text">
            <Receipt className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold leading-none">
              {data?.total_reservasi ?? items.length}
            </p>
            <p className="mt-1 text-xs text-ink/55">
              Total reservasi · {BULAN[month - 1]} {year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border-2 border-black/[0.06] bg-white p-5 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-sage-soft text-sage-text">
            <Wallet className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold leading-none">
              {rupiah(data?.total_pengeluaran ?? 0)}
            </p>
            <p className="mt-1 text-xs text-ink/55">Total pengeluaran</p>
          </div>
        </div>
      </div>

      {/* Daftar histori */}
      <div className="mt-8">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="h-6 w-6" />}
            title="Tidak ada riwayat"
            description={`Belum ada reservasi pada ${BULAN[month - 1]} ${year}. Coba pilih bulan lain.`}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-black/[0.06] bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-black/[0.02] text-left">
                  {["Kode / ID", "Space", "Tanggal", "Jam", "Status", "Total", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink/50"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {items.map((it) => {
                  const meta = statusMeta(it.status);
                  const spaceName =
                    it.space?.nama_space ??
                    (it as any).space_name ??
                    `Space #${it.id_space}`;

                  return (
                    <tr key={it.id} className="hover:bg-black/[0.015]">
                      <td className="px-4 py-3 font-mono text-xs text-ink/60">
                        {it.kode_booking || `#${it.id}`}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {spaceName}
                      </td>
                      <td className="px-4 py-3 text-ink/60">
                        {tanggalPanjang(it.tanggal_reservasi)}
                      </td>
                      <td className="px-4 py-3 text-ink/60">
                        {jam(it.jam_mulai)} – {jam(it.jam_selesai)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={meta.badge}>
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {rupiah(it.total_bayar)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/akun/tiket/${it.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                        >
                          <Ticket className="h-3.5 w-3.5" /> E-Ticket
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}