"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  QrCode,
  ShieldCheck,
  Ticket,
  Wallet,
  XCircle,
} from "lucide-react";
import { reservasiApi } from "@/lib/api/reservasi";
import { ApiError } from "@/lib/api/client";
import type { Reservasi } from "@/lib/types";
import {
  jam,
  labelTipe,
  resolveImageUrl,
  rupiah,
  tanggalPanjang,
  TIPE_THEME,
} from "@/lib/format";
import { normalizeStatus, statusMeta } from "@/lib/status";
import { SpaceThumb } from "@/components/space/space-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MetodeId = "qris" | "transfer" | "tempat";

const METODE_LIST: {
  id: MetodeId;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "qris",
    label: "QRIS",
    desc: "Scan & bayar dari e-wallet atau m-banking apa pun.",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    id: "transfer",
    label: "Transfer Bank (Virtual Account)",
    desc: "VA otomatis untuk BCA, BNI, BRI, dan Mandiri.",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "tempat",
    label: "Bayar di Tempat",
    desc: "Bayar tunai langsung ke admin saat check-in.",
    icon: <Wallet className="h-5 w-5" />,
  },
];

const DURASI_SESI_DETIK = 15 * 60; // 15 menit — waktu simulasi sebelum sesi bayar berakhir

export function PaymentView({ id }: { id: number }) {
  const router = useRouter();

  const [reservasi, setReservasi] = useState<Reservasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [metode, setMetode] = useState<MetodeId>("qris");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(DURASI_SESI_DETIK);

  // Muat data reservasi yang sudah dibuat
  useEffect(() => {
    if (!id) return;
    reservasiApi
      .detail(id)
      .then((data) => {
        if (data) {
          setReservasi(data);
        } else {
          setLoadError("Data reservasi kosong.");
        }
      })
      .catch((e) =>
        setLoadError(
          e instanceof ApiError ? e.message : "Gagal memuat data reservasi.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Hitung mundur sesi pembayaran (hanya berjalan jika status masih belum_dikonfirm)
  useEffect(() => {
    if (!reservasi || normalizeStatus(reservasi.status) !== "belum_dikonfirm") {
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [reservasi?.id, reservasi?.status]);

  async function konfirmasiPembayaran() {
    setConfirmError(null);
    setConfirming(true);
    try {
      // Simulasi delay pembayaran, lalu arahkan ke e-ticket
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.replace(`/akun/tiket/${id}?baru=1`);
    } catch {
      setConfirmError("Gagal memproses pembayaran. Coba lagi.");
      setConfirming(false);
    }
  }

  async function batalkan() {
    setCanceling(true);
    setConfirmError(null);
    try {
      await reservasiApi.cancel(id);
      router.replace("/akun");
    } catch (e) {
      setConfirmError(
        e instanceof ApiError ? e.message : "Gagal membatalkan reservasi.",
      );
      setCanceling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (loadError || !reservasi) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border-2 border-rose-border bg-rose-soft p-6 text-center">
        <XCircle className="mx-auto h-8 w-8 text-rose-text" />
        <p className="mt-2 font-semibold text-rose-deep">
          {loadError ?? "Reservasi tidak ditemukan."}
        </p>
        <Link href="/akun" className="mt-4 inline-block">
          <Button variant="outline">Kembali ke reservasi saya</Button>
        </Link>
      </div>
    );
  }

  // Penggunaan safe normalizeStatus yang aman dari nilai undefined/null
  const status = normalizeStatus(reservasi.status);
  const meta = statusMeta(reservasi.status);
  const theme = reservasi.space?.tipe ? TIPE_THEME[reservasi.space.tipe] : undefined;
  const expired = status === "belum_dikonfirm" && secondsLeft <= 0;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Jika reservasi sudah bukan dalam status menunggu konfirmasi
  if (status !== "belum_dikonfirm") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-black/[0.06] bg-white p-8 text-center shadow-soft">
        <span className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl border-2", meta.badgeClass)}>
            
          {status === "dibatalkan" ? (
            <XCircle className="h-7 w-7" />
          ) : (
            <CheckCircle2 className="h-7 w-7" />
          )}
        </span>
        <h1 className="mt-4 font-display text-xl font-extrabold text-ink">
          Reservasi ini sudah {meta.label.toLowerCase()}
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Kode booking <span className="font-mono font-semibold">{reservasi.kode_booking || "-"}</span>{" "}
          tidak lagi menunggu pembayaran.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {status !== "dibatalkan" && (
            <Link href={`/akun/tiket/${reservasi.id}`}>
              <Button>
                <Ticket className="h-4 w-4" /> Lihat e-ticket
              </Button>
            </Link>
          )}
          <Link href="/akun">
            <Button variant="outline">Reservasi saya</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stepper alur */}
      <ol className="mb-8 flex items-center justify-center gap-2 text-xs font-semibold text-ink/40 sm:gap-3">
        <Step done label="Detail Reservasi" />
        <Bar />
        <Step active label="Pembayaran" />
        <Bar />
        <Step label="E-Ticket" />
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Ringkasan pesanan */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border-2 border-black/[0.06] bg-white shadow-soft">
            <div className="relative aspect-[16/9]">
              <SpaceThumb
                foto={reservasi.space?.foto}
                fotoUrl={resolveImageUrl(reservasi.space?.foto)}
                tipe={reservasi.space?.tipe ?? "desk"}
                alt={reservasi.space?.nama_space ?? "Space"}
                className="h-full w-full"
              />
              {theme && reservasi.space?.tipe && (
                <div className="absolute left-3 top-3">
                  <Badge className={cn(theme.soft, theme.border, theme.text)}>
                    {labelTipe(reservasi.space.tipe)}
                  </Badge>
                </div>
              )}
            </div>
            <div className="p-5">
              <p className="font-mono text-xs font-semibold text-ink/45">
                {reservasi.kode_booking || "-"}
              </p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-ink">
                {reservasi.space?.nama_space ?? `Space #${reservasi.id_space}`}
              </h2>
              <Badge className={cn("mt-3", meta.badgeClass)}>{meta.label}</Badge>

              <dl className="mt-4 space-y-2 border-t border-black/[0.06] pt-4 text-sm">
                <Row label="Tanggal" value={tanggalPanjang(reservasi.tanggal_reservasi)} />
                <Row
                  label="Jam"
                  value={`${jam(reservasi.jam_mulai)} – ${jam(reservasi.jam_selesai)}`}
                />
                <Row label="Durasi" value={`${reservasi.durasi_jam ?? 1} jam`} />
              </dl>
            </div>
          </div>

          <button
            type="button"
            onClick={batalkan}
            disabled={canceling || confirming}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-text hover:bg-rose-soft disabled:opacity-50"
          >
            {canceling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Batalkan reservasi
          </button>
        </div>

        {/* Pembayaran */}
        <div className="space-y-5">
          {/* Countdown sesi */}
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-semibold",
              expired
                ? "border-rose-border bg-rose-soft text-rose-deep"
                : secondsLeft <= 60
                  ? "border-butter-border bg-butter-soft text-butter-deep"
                  : "border-sky-border bg-sky-soft text-sky-deep",
            )}
          >
            <Clock className="h-4 w-4 shrink-0" />
            {expired ? (
              <span>
                Sesi pembayaran berakhir. Reservasi tetap tersimpan berstatus
                menunggu konfirmasi — silakan konfirmasi ulang atau hubungi pengelola.
              </span>
            ) : (
              <span>
                Selesaikan pembayaran dalam{" "}
                <span className="font-mono">
                  {mm}:{ss}
                </span>
              </span>
            )}
          </div>

          {/* Rincian tagihan */}
          <div className="rounded-3xl border-2 border-black/[0.06] bg-white p-6 shadow-soft">
            <h3 className="font-display text-lg font-bold text-ink">Rincian tagihan</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={rupiah(reservasi.total_harga_awal ?? 0)} />
              {(reservasi.potongan_diskon ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-sage-text">Diskon</dt>
                  <dd className="font-medium text-sage-text">
                    − {rupiah(reservasi.potongan_diskon)}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-black/10 pt-4">
              <span className="font-display font-bold text-ink">Total bayar</span>
              <span className="font-display text-2xl font-extrabold text-brand-text">
                {rupiah(reservasi.total_bayar ?? 0)}
              </span>
            </div>
          </div>

          {/* Metode pembayaran */}
          <div className="rounded-3xl border-2 border-black/[0.06] bg-white p-6 shadow-soft">
            <h3 className="font-display text-lg font-bold text-ink">Metode pembayaran</h3>
            <div className="mt-4 space-y-3">
              {METODE_LIST.map((m) => {
                const selected = metode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetode(m.id)}
                    disabled={expired}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-50",
                      selected
                        ? "border-brand bg-brand-soft"
                        : "border-black/10 hover:bg-black/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                        selected ? "bg-brand text-white" : "bg-black/5 text-ink/50",
                      )}
                    >
                      {m.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-ink">{m.label}</span>
                      <span className="block text-xs text-ink/50">{m.desc}</span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                        selected ? "border-brand bg-brand" : "border-black/20",
                      )}
                    >
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {confirmError && (
            <div className="flex items-start gap-2 rounded-xl border-2 border-rose-border bg-rose-soft p-4 text-sm">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-text" />
              <p className="text-rose-text">{confirmError}</p>
            </div>
          )}

          <Button
            onClick={konfirmasiPembayaran}
            disabled={confirming || canceling || expired}
            className="w-full"
            size="lg"
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses pembayaran…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Konfirmasi pembayaran
              </>
            )}
          </Button>

          <p className="flex items-start gap-1.5 text-center text-xs text-ink/45">
            <ArrowLeft className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Ini simulasi pembayaran untuk keperluan demo. Reservasi kamu akan
            berstatus &ldquo;Menunggu Konfirmasi&rdquo; hingga disetujui oleh pengelola.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({
  label,
  active,
  done,
}: {
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full border-2 text-[10px]",
          done
            ? "border-sage bg-sage text-white"
            : active
              ? "border-brand bg-brand text-white"
              : "border-black/15 text-ink/40",
        )}
      >
        {done ? <CheckCircle2 className="h-3 w-3" /> : null}
      </span>
      <span className={cn(active && "text-ink")}>{label}</span>
    </li>
  );
}

function Bar() {
  return <span className="h-px w-6 bg-black/15 sm:w-10" />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/55">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}