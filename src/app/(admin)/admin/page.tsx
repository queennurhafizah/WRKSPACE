"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  MonitorPlay,
  Users,
  Tag,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { Reservasi, LaporanBulanan } from "@/lib/types";
import { rupiah, tanggalPendek, jam } from "@/lib/format";
import { statusMeta } from "@/lib/status";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [reservasi, setReservasi] = useState<Reservasi[]>([]);
  const [laporan, setLaporan] = useState<LaporanBulanan | null>(null);
  const [counts, setCounts] = useState({
    spaces: 0,
    members: 0,
    diskon: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rvs, spaces, members, diskons, rpt] = await Promise.all([
          adminApi.reservasi.list(),
          adminApi.spaces.list(),
          adminApi.members.list(),
          adminApi.diskon.list(),
          adminApi.reports.monthly().catch(() => null),
        ]);
        setReservasi(rvs.slice(0, 8));
        setLaporan(rpt);
        setCounts({
          spaces: spaces.length,
          members: members.length,
          diskon: diskons.length,
          pending: rvs.filter((r) => r.status === "belum_dikonfirm").length,
        });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Ringkasan operasional coworking space kamu.
          </p>
        </div>

        <Link href="/admin/laporan">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4 text-brand" /> Lihat Laporan
            Pendapatan
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Menunggu konfirmasi"
          value={counts.pending}
          sub="Perlu tindakan"
          icon={<Clock className="h-5 w-5" />}
          tone="butter"
        />
        <StatCard
          label="Pendapatan Bulan Ini"
          value={rupiah(laporan?.ringkasan?.realisasi_pendapatan ?? 0)}
          sub={`${laporan?.ringkasan?.total_reservasi ?? 0} total reservasi`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="sage"
        />
        <StatCard
          label="Total space"
          value={counts.spaces}
          icon={<MonitorPlay className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Total member"
          value={counts.members}
          icon={<Users className="h-5 w-5" />}
          tone="sky"
        />
      </div>

      {/* Reservasi terbaru */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Reservasi terbaru</h2>
          <Link href="/admin/reservasi">
            <Button variant="ghost" size="sm">
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {reservasi.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.07] bg-black/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide hidden md:table-cell">
                    Space
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide hidden lg:table-cell">
                    Jadwal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {reservasi.map((r) => {
                  const sm = statusMeta(r.status);
                  return (
                    <tr key={r.id} className="hover:bg-black/[0.015]">
                      <td className="px-4 py-3 font-mono text-xs text-ink/60">
                        {r.kode_booking}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.member?.nama_member ?? `#${r.id_member}`}
                      </td>
                      <td className="px-4 py-3 text-ink/60 hidden md:table-cell">
                        {r.space?.nama_space ?? `Space #${r.id_space}`}
                      </td>
                      <td className="px-4 py-3 text-ink/60 hidden lg:table-cell">
                        {tanggalPendek(r.tanggal_reservasi)}, {jam(r.jam_mulai)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {rupiah(r.total_bayar)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${sm.badge} border`}>
                          {sm.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-black/10 p-10 text-center text-ink/40">
            Belum ada reservasi.
          </div>
        )}
      </div>
    </div>
  );
}
