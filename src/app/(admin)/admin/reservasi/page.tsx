"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2, CheckCircle2, XCircle, LogIn,
  LogOut, Filter, RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Reservasi, ReservasiStatus } from "@/lib/types";
import { rupiah, tanggalPendek, jam } from "@/lib/format";
import { statusMeta, normalizeStatus } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, Field } from "@/components/ui/form";
import { Spinner } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "belum_dikonfirm", label: "Menunggu konfirmasi" },
  { value: "disetujui", label: "Disetujui" },
  { value: "aktif", label: "Aktif / Digunakan" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

export default function AdminReservasiPage() {
  const [list, setList] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Filter
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [status, setStatus] = useState("");

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.reservasi.list({
        month,
        year,
        status: status as ReservasiStatus || undefined,
      });
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [month, year, status]);

  useEffect(() => { void load(); }, [load]);

  async function doAction(
    id: number,
    action: "approve" | "reject" | "checkin" | "checkout",
  ) {
    setActionId(id);
    try {
      if (action === "approve")
        await adminApi.reservasi.updateStatus(id, "disetujui");
      else if (action === "reject")
        await adminApi.reservasi.updateStatus(id, "dibatalkan");
      else if (action === "checkin")
        await adminApi.reservasi.checkIn(id);
      else
        await adminApi.reservasi.checkOut(id);

      showToast(
        action === "checkin" ? "Check-in berhasil!"
          : action === "checkout" ? "Check-out berhasil!"
          : action === "approve" ? "Reservasi disetujui!"
          : "Reservasi dibatalkan.",
        action !== "reject",
      );
      await load();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Gagal.", false);
    } finally {
      setActionId(null);
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString("id-ID", { month: "long" }),
  }));

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Manajemen Reservasi
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Konfirmasi, check-in, dan check-out tamu.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-black/[0.07] bg-white p-4">
        <Filter className="h-4 w-4 text-ink/40 self-center" />
        <div className="flex flex-wrap gap-3 flex-1">
          <Field className="w-36">
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </Field>
          <Field className="w-28">
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </Field>
          <Field className="w-52">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "rounded-xl px-4 py-3 text-sm font-semibold",
          toast.ok ? "bg-sage-soft text-sage-deep" : "bg-rose-soft text-rose-deep",
        )}>
          {toast.msg}
        </div>
      )}

      {/* Tabel */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner className="h-6 w-6 text-brand" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/10 p-12 text-center text-ink/40">
          Tidak ada reservasi untuk filter ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-black/[0.07] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.07] bg-black/[0.02]">
                {["Kode", "Member", "Space", "Jadwal", "Total", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink/50 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {list.map((r) => {
                const sm = statusMeta(r.status);
                const norm = normalizeStatus(r.status);
                const busy = actionId === r.id;
                return (
                  <tr key={r.id} className="hover:bg-black/[0.015]">
                    <td className="px-4 py-3 font-mono text-xs text-ink/60 whitespace-nowrap">
                      {r.kode_booking}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      <div>{r.member?.nama_member ?? `#${r.id_member}`}</div>
                      <div className="text-xs text-ink/40">{r.member?.telp}</div>
                    </td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                      {r.space?.nama_space ?? `Space #${r.id_space}`}
                    </td>
                    <td className="px-4 py-3 text-ink/60 whitespace-nowrap">
                      <div>{tanggalPendek(r.tanggal_reservasi)}</div>
                      <div className="text-xs">{jam(r.jam_mulai)} – {jam(r.jam_selesai)}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {rupiah(r.total_bayar)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${sm.badge} border whitespace-nowrap`}>
                        {sm.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {norm === "belum_dikonfirm" && (
                          <>
                            <ActionBtn
                              onClick={() => doAction(r.id, "approve")}
                              busy={busy}
                              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                              label="Setujui"
                              tone="sage"
                            />
                            <ActionBtn
                              onClick={() => doAction(r.id, "reject")}
                              busy={busy}
                              icon={<XCircle className="h-3.5 w-3.5" />}
                              label="Tolak"
                              tone="rose"
                            />
                          </>
                        )}
                        {norm === "disetujui" && (
                          <ActionBtn
                            onClick={() => doAction(r.id, "checkin")}
                            busy={busy}
                            icon={<LogIn className="h-3.5 w-3.5" />}
                            label="Check-in"
                            tone="sky"
                          />
                        )}
                        {norm === "aktif" && (
                          <ActionBtn
                            onClick={() => doAction(r.id, "checkout")}
                            busy={busy}
                            icon={<LogOut className="h-3.5 w-3.5" />}
                            label="Check-out"
                            tone="grape"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  onClick, busy, icon, label, tone,
}: {
  onClick: () => void;
  busy: boolean;
  icon: React.ReactNode;
  label: string;
  tone: "sage" | "rose" | "sky" | "grape";
}) {
  const map = {
    sage:  "bg-sage-soft border-sage-border text-sage-deep hover:bg-sage/20",
    rose:  "bg-rose-soft border-rose-border text-rose-deep hover:bg-rose/20",
    sky:   "bg-sky-soft border-sky-border text-sky-deep hover:bg-sky/20",
    grape: "bg-grape-soft border-grape-border text-grape-deep hover:bg-grape/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
        map[tone],
      )}
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : icon}
      {label}
    </button>
  );
}
