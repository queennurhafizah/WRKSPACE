"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { reservasiApi } from "@/lib/api/reservasi";
import { ApiError } from "@/lib/api/client";
import type { Reservasi } from "@/lib/types";
import { normalizeStatus } from "@/lib/status";
import { useAuth } from "@/components/providers/auth-provider";
import { RequireMember } from "@/components/auth/require-member";
import { ReservasiCard } from "@/components/member/reservasi-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

export default function AkunPage() {
  return (
    <RequireMember>
      <AkunContent />
    </RequireMember>
  );
}

const AKTIF = ["belum_dikonfirm", "disetujui", "aktif"];
const ARSIP = ["selesai", "dibatalkan"];

function AkunContent() {
  const { user } = useAuth();
  const [list, setList] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setList(await reservasiApi.my());
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCancel(id: number) {
    setCancelId(id);
    try {
      await reservasiApi.cancel(id);
      showToast("Reservasi berhasil dibatalkan.");
      await load();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Gagal membatalkan.", false);
    } finally {
      setCancelId(null);
    }
  }

  const aktif = list.filter((r) => AKTIF.includes(normalizeStatus(r.status)));
  const arsip = list.filter((r) => ARSIP.includes(normalizeStatus(r.status)));
  const pending = list.filter(
    (r) => normalizeStatus(r.status) === "belum_dikonfirm",
  ).length;
  const selesai = list.filter(
    (r) => normalizeStatus(r.status) === "selesai",
  ).length;

  const nama = user?.member?.nama_member ?? user?.username ?? "Member";

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-accent text-2xl text-brand-text">Halo, {nama}!</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Reservasi Saya
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Pantau status pemesanan dan cetak e-ticket kamu di sini.
          </p>
        </div>
        <Link href="/spaces">
          <Button>
            <Plus className="h-4 w-4" /> Pesan space baru
          </Button>
        </Link>
      </div>

      {/* Ringkasan */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<ListChecks className="h-5 w-5" />}
          tone="bg-brand-soft text-brand-text"
          value={list.length}
          label="Total reservasi"
        />
        <Stat
          icon={<Clock className="h-5 w-5" />}
          tone="bg-butter-soft text-butter-text"
          value={pending}
          label="Menunggu konfirmasi"
        />
        <Stat
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="bg-sage-soft text-sage-text"
          value={selesai}
          label="Selesai"
        />
      </div>

      {toast && (
        <div
          className={cn(
            "mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
            toast.ok
              ? "bg-sage-soft text-sage-deep"
              : "bg-rose-soft text-rose-text",
          )}
        >
          {toast.ok ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Konten */}
      {loading ? (
        <div className="flex h-52 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : list.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<CalendarCheck className="h-6 w-6" />}
            title="Belum ada reservasi"
            description="Kamu belum memesan space apa pun. Yuk jelajahi katalog dan pesan tempat pertamamu."
            action={
              <Link href="/spaces">
                <Button>
                  <Plus className="h-4 w-4" /> Lihat katalog space
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <Section
            title="Sedang berjalan"
            count={aktif.length}
            empty="Tidak ada reservasi yang sedang berjalan."
          >
            {aktif.map((r) => (
              <ReservasiCard
                key={r.id}
                reservasi={r}
                onCancel={handleCancel}
                canceling={cancelId === r.id}
              />
            ))}
          </Section>

          <Section
            title="Riwayat & arsip"
            count={arsip.length}
            empty="Belum ada reservasi yang selesai atau dibatalkan."
            action={
              <Link
                href="/akun/riwayat"
                className="text-sm font-semibold text-brand-text hover:underline"
              >
                Lihat riwayat lengkap →
              </Link>
            }
          >
            {arsip.map((r) => (
              <ReservasiCard key={r.id} reservasi={r} />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  tone,
  value,
  label,
}: {
  icon: React.ReactNode;
  tone: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-black/[0.06] bg-white p-5 shadow-soft">
      <span className={cn("grid h-11 w-11 place-items-center rounded-xl", tone)}>
        {icon}
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold leading-none text-ink">
          {value}
        </p>
        <p className="mt-1 text-xs text-ink/55">{label}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  empty,
  action,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">
          {title}{" "}
          <span className="ml-1 text-sm font-semibold text-ink/40">{count}</span>
        </h2>
        {action}
      </div>
      {count === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-black/10 bg-white/50 px-5 py-8 text-center text-sm text-ink/50">
          {empty}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      )}
    </section>
  );
}