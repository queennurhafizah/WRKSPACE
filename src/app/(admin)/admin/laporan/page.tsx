"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  Receipt,
  Printer,
  Loader2,
  Banknote,
  Layers,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { LaporanBulanan } from "@/lib/types";
import { rupiah, tanggalPendek } from "@/lib/format";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const TIPE_SPACE_LABEL: Record<string, string> = {
  desk: "Desk / Working Space",
  meeting_room: "Meeting Room",
  private_office: "Private Office",
  event_space: "Event Space",
};

export default function LaporanPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [laporan, setLaporan] = useState<LaporanBulanan | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.reports.monthly(month, year);
      setLaporan(data);
    } catch {
      setLaporan(null);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void loadLaporan();
  }, [loadLaporan]);

  const handlePrint = () => {
    window.print();
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const totalReservasi = laporan?.ringkasan?.total_reservasi ?? 0;
  const estimasiTotal = laporan?.ringkasan?.estimasi_pendapatan_total ?? 0;
  const realisasiPendapatan = laporan?.ringkasan?.realisasi_pendapatan ?? 0;
  const statusCounts = laporan?.ringkasan?.status_reservasi;

  const perTipeSpace = laporan?.pendapatan_per_tipe_space
    ? Object.entries(laporan.pendapatan_per_tipe_space).map(([key, val]) => ({
        key,
        label: TIPE_SPACE_LABEL[key] || key.replace("_", " "),
        count: val.count,
        total_income: val.total_income,
      }))
    : [];

  const trenHarian = laporan?.tren_harian ?? [];

  return (
    <div className="space-y-6 print:m-0 print:p-0 print:w-full print:bg-white text-ink">
      {/* CSS Khusus Cetak Dokumen PDF */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 12px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Sembunyikan Navigasi Admin */
          aside, nav, header, .print\\:hidden {
            display: none !important;
          }
          /* Hilangkan Padding Layar */
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          /* Border & Tabel Cetak Rapi */
          .print-card {
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            background: #ffffff !important;
            border-radius: 8px !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-table th, .print-table td {
            border-bottom: 1px solid #e5e7eb !important;
            padding: 6px 10px !important;
          }
          /* Mencegah Konten Terpotong Tengah Halaman */
          .avoid-break {
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Header & Filter Web (Disembunyikan saat cetak) */}
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Laporan Pendapatan Bulanan
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Rekapitulasi pendapatan dan statistik penggunaan space per bulan.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <Field label="Bulan" className="w-36">
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
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Cetak Laporan PDF
          </Button>
        </div>
      </div>

      {/* KOP LAPORAN (Hanya Muncul Saat Cetak PDF) */}
      <div className="hidden print:block border-b-2 border-black pb-3 mb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-wide text-black">
              LAPORAN PENDAPATAN COWORKING
            </h1>
            <p className="text-sm font-medium text-gray-700">
              Periode Rekapitulasi: <span className="font-bold">{BULAN[month - 1]} {year}</span>
            </p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold text-black">Status: Resmi</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center print:hidden">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : (
        <>
          {/* Ringkasan Utama Card */}
          <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3 print:gap-3 avoid-break">
            <StatCard
              label="Realisasi Pendapatan"
              value={rupiah(realisasiPendapatan)}
              sub={`Estimasi Potensial: ${rupiah(estimasiTotal)}`}
              icon={<TrendingUp className="h-5 w-5" />}
              tone="sage"
            />
            <StatCard
              label="Total Reservasi"
              value={`${totalReservasi} Transaksi`}
              sub={`Periode ${BULAN[month - 1]} ${year}`}
              icon={<Receipt className="h-5 w-5" />}
              tone="sky"
            />
            <StatCard
              label="Reservasi Selesai"
              value={`${statusCounts?.selesai ?? 0} Selesai`}
              sub={`${statusCounts?.aktif ?? 0} Aktif, ${statusCounts?.belum_dikonfirm ?? 0} Pending`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="butter"
            />
          </div>

          {/* Ringkasan Finansial & Status */}
          <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-3 avoid-break">
            <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-soft print-card">
              <h2 className="font-display text-base font-bold flex items-center gap-2 mb-3">
                <Banknote className="h-4 w-4 text-brand print:hidden" /> Ringkasan Finansial
              </h2>
              <div className="divide-y divide-black/[0.05] text-xs">
                <div className="py-2 flex justify-between items-center">
                  <span className="text-ink/60">Estimasi Pendapatan Total</span>
                  <span className="font-medium">{rupiah(estimasiTotal)}</span>
                </div>
                <div className="py-2 flex justify-between items-center font-bold text-sm bg-emerald-50/50 px-2.5 rounded-lg text-emerald-800 print:bg-gray-100 print:text-black">
                  <span>Realisasi Pendapatan Masuk</span>
                  <span>{rupiah(realisasiPendapatan)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-soft print-card">
              <h2 className="font-display text-base font-bold flex items-center gap-2 mb-3">
                <CalendarCheck className="h-4 w-4 text-brand print:hidden" /> Status Reservasi
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-900 flex justify-between items-center print:bg-gray-50 print:border print:border-gray-200">
                  <span>Belum Dikonfirm</span>
                  <span className="font-bold">{statusCounts?.belum_dikonfirm ?? 0}</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-900 flex justify-between items-center print:bg-gray-50 print:border print:border-gray-200">
                  <span>Disetujui</span>
                  <span className="font-bold">{statusCounts?.disetujui ?? 0}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 flex justify-between items-center print:bg-gray-50 print:border print:border-gray-200">
                  <span>Aktif / Selesai</span>
                  <span className="font-bold">{(statusCounts?.aktif ?? 0) + (statusCounts?.selesai ?? 0)}</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-900 flex justify-between items-center print:bg-gray-50 print:border print:border-gray-200">
                  <span>Dibatalkan</span>
                  <span className="font-bold">{statusCounts?.dibatalkan ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Breakdown per Tipe Space */}
          <div className="space-y-3 avoid-break">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand print:hidden" /> Pendapatan Per Tipe Space
            </h2>

            {perTipeSpace.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white print-card">
                <table className="w-full text-xs print-table">
                  <thead>
                    <tr className="border-b border-black/[0.07] bg-black/[0.02] print:bg-gray-100">
                      <th className="px-4 py-2 text-left font-semibold text-ink/70">Tipe Space</th>
                      <th className="px-4 py-2 text-left font-semibold text-ink/70">Total Pemesanan</th>
                      <th className="px-4 py-2 text-right font-semibold text-ink/70">Total Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {perTipeSpace.map((item) => (
                      <tr key={item.key}>
                        <td className="px-4 py-2 font-medium capitalize">{item.label}</td>
                        <td className="px-4 py-2 text-ink/70">{item.count} kali</td>
                        <td className="px-4 py-2 font-semibold text-right">{rupiah(item.total_income)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-black/10 p-6 text-center text-ink/40 text-xs">
                Tidak ada data pemesanan pada periode ini.
              </div>
            )}
          </div>

          {/* Tren Harian */}
          {trenHarian.length > 0 && (
            <div className="space-y-3 avoid-break">
              <h2 className="font-display text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand print:hidden" /> Tren Harian
              </h2>
              <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white print-card">
                <table className="w-full text-xs print-table">
                  <thead>
                    <tr className="border-b border-black/[0.07] bg-black/[0.02] print:bg-gray-100">
                      <th className="px-4 py-2 text-left font-semibold text-ink/70">Tanggal</th>
                      <th className="px-4 py-2 text-left font-semibold text-ink/70">Jumlah Reservasi</th>
                      <th className="px-4 py-2 text-right font-semibold text-ink/70">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {trenHarian.map((row) => (
                      <tr key={row.tanggal}>
                        <td className="px-4 py-2 font-medium">{tanggalPendek(row.tanggal)}</td>
                        <td className="px-4 py-2 text-ink/70">{row.total_reservations} reservasi</td>
                        <td className="px-4 py-2 font-semibold text-right">{rupiah(row.total_income)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}