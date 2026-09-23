"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Loader2,
  Tag,
  TicketPercent,
  XCircle,
} from "lucide-react";
import { spacesApi } from "@/lib/api/spaces";
import { diskonApi } from "@/lib/api/diskon";
import { reservasiApi } from "@/lib/api/reservasi";
import { ApiError } from "@/lib/api/client";
import type { Availability, Diskon, DiskonCheckResult, Space } from "@/lib/types";
import {
  hitungJamSelesai,
  jam,
  labelTipe,
  rupiah,
  tanggalPanjang,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface Props {
  spaceId: number;
  initialTanggal?: string;
  initialJam?: string;
  initialDurasi?: number;
}

export function ReservasiForm({
  spaceId,
  initialTanggal,
  initialJam,
  initialDurasi,
}: Props) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [space, setSpace] = useState<Space | null>(null);
  const [spaceError, setSpaceError] = useState<string | null>(null);
  const [promos, setPromos] = useState<Diskon[]>([]);

  const [tanggal, setTanggal] = useState(initialTanggal || today);
  const [jamMulai, setJamMulai] = useState(initialJam || "09:00");
  const [durasi, setDurasi] = useState(initialDurasi && initialDurasi > 0 ? initialDurasi : 2);
  const [kodePromo, setKodePromo] = useState("");

  const [avail, setAvail] = useState<Availability | null>(null);
  const [availError, setAvailError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Promo yang berhasil divalidasi (null = belum ada / belum diterapkan)
  const [applied, setApplied] = useState<DiskonCheckResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);

  // Muat detail space + daftar promo aktif
  useEffect(() => {
    spacesApi
      .detail(spaceId)
      .then(setSpace)
      .catch((e) =>
        setSpaceError(
          e instanceof ApiError
            ? e.message
            : "Gagal memuat data space. Coba lagi.",
        ),
      );
    diskonApi.active().then(setPromos).catch(() => setPromos([]));
  }, [spaceId]);

  // Setiap kali parameter jadwal berubah, hasil cek lama tidak berlaku lagi
  function resetCheck() {
    setAvail(null);
    setAvailError(null);
  }

  async function cek() {
    setChecking(true);
    setAvailError(null);
    setAvail(null);
    try {
      const data = await spacesApi.availability({
        id_space: spaceId,
        tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasi,
      });
      setAvail(data);
    } catch (e) {
      setAvailError(
        e instanceof ApiError
          ? e.message
          : "Space tidak tersedia pada jadwal tersebut.",
      );
    } finally {
      setChecking(false);
    }
  }

  // Ubah kode promo → batalkan promo yang sudah diterapkan
  function ubahPromo(v: string) {
    setKodePromo(v.toUpperCase());
    setApplied(null);
    setPromoError(null);
  }

  // Validasi kode promo ke backend & simpan potongannya
  async function terapkanPromo(kode?: string) {
    const target = (kode ?? kodePromo).trim();
    if (!target) return;
    setKodePromo(target.toUpperCase());
    setPromoChecking(true);
    setPromoError(null);
    setApplied(null);
    try {
      const d = await diskonApi.check(target);
      if (!d.persentase_diskon) {
        // Server bilang request sukses tapi tidak ada potongan yang bisa
        // dibaca — anggap kode tidak valid daripada diam-diam pesan tanpa
        // diskon.
        setPromoError("Kode promo tidak valid atau sudah kedaluwarsa.");
        return;
      }
      setApplied(d);
    } catch (e) {
      setPromoError(
        e instanceof ApiError ? e.message : "Kode promo tidak valid.",
      );
    } finally {
      setPromoChecking(false);
    }
  }

  async function pesan() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await reservasiApi.create({
        id_space: spaceId,
        tanggal_reservasi: tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasi,
        id_diskon: applied?.id,
        kode_promo: (applied?.nama_diskon ?? kodePromo).trim() || undefined,
      });
      // Berhasil → lanjut ke halaman pembayaran (simulasi) sebelum e-ticket
      router.replace(`/reservasi/${created.id}/bayar`);
    } catch (e) {
      setSubmitError(
        e instanceof ApiError ? e.message : "Gagal membuat reservasi.",
      );
      setSubmitting(false);
    }
  }

  if (spaceError) {
    return (
      <div className="rounded-2xl border-2 border-rose-border bg-rose-soft p-6 text-center">
        <XCircle className="mx-auto h-8 w-8 text-rose-text" />
        <p className="mt-2 font-semibold text-rose-deep">{spaceError}</p>
        <Link href="/spaces" className="mt-4 inline-block">
          <Button variant="outline">Kembali ke katalog</Button>
        </Link>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex h-56 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const jamSelesai = hitungJamSelesai(jamMulai, durasi);

  // Rincian harga (potongan promo dihitung di sini untuk pratinjau)
  const subtotal = avail?.estimasi_total ?? 0;
  const persen = applied?.persentase_diskon ?? 0;
  const potongan = Math.round((subtotal * persen) / 100);
  const totalBayar = subtotal - potongan;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      {/* Ringkasan space */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border-2 border-black/[0.06] bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-text">
            {labelTipe(space.tipe)}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            {space.nama_space}
          </h2>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink/60">
            <Tag className="h-4 w-4" /> {rupiah(space.harga_per_jam)} / jam ·
            kapasitas {space.kapasitas} orang
          </p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/70">
            {space.deskripsi}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border-2 border-black/[0.06] bg-white p-6 shadow-soft">
        <h3 className="font-display text-lg font-bold">Detail pemesanan</h3>

        <div className="mt-5 space-y-4">
          <Field label="Tanggal reservasi" required>
            <Input
              type="date"
              min={today}
              value={tanggal}
              onChange={(e) => {
                setTanggal(e.target.value);
                resetCheck();
              }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jam mulai" required>
              <Input
                type="time"
                value={jamMulai}
                onChange={(e) => {
                  setJamMulai(e.target.value);
                  resetCheck();
                }}
              />
            </Field>
            <Field label="Durasi (jam)" required hint={`Selesai ± ${jamSelesai}`}>
              <Input
                type="number"
                min={1}
                max={12}
                value={durasi}
                onChange={(e) => {
                  setDurasi(Math.max(1, Number(e.target.value)));
                  resetCheck();
                }}
              />
            </Field>
          </div>

          <Field label="Kode promo" hint="Opsional — punya kode? Terapkan untuk lihat potongannya.">
            <div className="flex gap-2">
              <Input
                value={kodePromo}
                onChange={(e) => ubahPromo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void terapkanPromo();
                  }
                }}
                placeholder="mis. DISKONHEMAT20"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => terapkanPromo()}
                disabled={promoChecking || !kodePromo.trim() || !!applied}
              >
                {promoChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Terapkan"
                )}
              </Button>
            </div>
          </Field>

          {/* Status promo */}
          {applied && (
            <div className="flex items-center justify-between rounded-xl border-2 border-sage-border bg-sage-soft px-4 py-2.5 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sage-deep">
                <CheckCircle2 className="h-4 w-4" />
                {applied.nama_diskon} · potongan {applied.persentase_diskon}%
              </span>
              <button
                type="button"
                onClick={() => ubahPromo("")}
                className="text-xs font-semibold text-rose-text hover:underline"
              >
                Hapus
              </button>
            </div>
          )}
          {promoError && (
            <p className="flex items-center gap-1.5 text-sm text-rose-text">
              <XCircle className="h-4 w-4" /> {promoError}
            </p>
          )}

          {/* Saran promo aktif */}
          {promos.length > 0 && !applied && (
            <div className="flex flex-wrap gap-2">
              {promos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => terapkanPromo(p.nama_diskon)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-pill border-2 px-3 py-1.5 text-xs font-semibold transition-colors",
                    "border-black/10 text-ink/60 hover:bg-black/5",
                  )}
                >
                  <TicketPercent className="h-3.5 w-3.5" />
                  {p.nama_diskon} · {p.persentase_diskon}%
                </button>
              ))}
            </div>
          )}

          {/* Tombol cek ketersediaan */}
          <Button
            variant="secondary"
            onClick={cek}
            disabled={checking}
            className="w-full"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Mengecek…
              </>
            ) : (
              <>
                <CalendarCheck className="h-4 w-4" /> Cek ketersediaan
              </>
            )}
          </Button>

          {/* Hasil cek */}
          {availError && (
            <div className="flex items-start gap-2 rounded-xl border-2 border-rose-border bg-rose-soft p-4 text-sm">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-text" />
              <div>
                <p className="font-bold text-rose-deep">Tidak tersedia</p>
                <p className="text-rose-text">{availError}</p>
              </div>
            </div>
          )}

          {/* Tersedia */}
          {avail && avail.available && (
            <div className="rounded-xl border-2 border-sage-border bg-sage-soft p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-sage-text" />
                <span className="font-display text-sm font-bold text-sage-deep">
                  Tersedia untuk dipesan!
                </span>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Tanggal" value={tanggalPanjang(avail.tanggal)} />
                <Row
                  label="Jam"
                  value={`${jam(avail.jam_mulai)} – ${jam(avail.jam_selesai)}`}
                />
                <Row label="Durasi" value={`${avail.durasi_jam} jam`} />
                <Row
                  label="Tarif"
                  value={`${rupiah(avail.harga_per_jam)} / jam`}
                />
                <div className="border-t border-sage-border pt-2">
                  <Row label="Subtotal" value={rupiah(subtotal)} />
                  {applied && (
                    <div className="flex items-center justify-between">
                      <dt className="text-sage-text">
                        Diskon {applied.nama_diskon} ({persen}%)
                      </dt>
                      <dd className="font-medium text-sage-text">
                        − {rupiah(potongan)}
                      </dd>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-sage-border pt-2">
                  <dt className="font-semibold text-ink">Total bayar</dt>
                  <dd className="font-display text-base font-extrabold text-sage-deep">
                    {rupiah(totalBayar)}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-sage-text">
                * Total final tetap dihitung ulang oleh server saat konfirmasi.
              </p>
            </div>
          )}

          {/* Tidak tersedia (backend balas is_available: false) */}
          {avail && !avail.available && (
            <div className="rounded-xl border-2 border-rose-border bg-rose-soft p-4 text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-text" />
                <span className="font-display font-bold text-rose-deep">
                  Jadwal ini sudah dibooking
                </span>
              </div>
              <p className="mt-1 text-rose-text">
                Coba ubah jam mulai atau tanggal, lalu cek lagi.
              </p>
              {avail.conflicts.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-rose-text">
                  {avail.conflicts.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose" />
                      Terisi {jam(c.jam_mulai)} – {jam(c.jam_selesai)}
                      {c.status ? ` (${c.status})` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {submitError && (
            <div className="flex items-start gap-2 rounded-xl border-2 border-rose-border bg-rose-soft p-4 text-sm">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-text" />
              <p className="text-rose-text">{submitError}</p>
            </div>
          )}

          {/* Konfirmasi */}
          <Button
            onClick={pesan}
            disabled={submitting || !avail?.available}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses…
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" /> Lanjut ke pembayaran
              </>
            )}
          </Button>
          {!avail?.available && (
            <p className="text-center text-xs text-ink/45">
              Cek ketersediaan dulu sampai muncul “Tersedia” sebelum lanjut ke pembayaran.
            </p>
          )}
        </div>
      </div>
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