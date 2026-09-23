"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Printer,
  QrCode,
  Sparkles,
  Ticket,
  XCircle,
} from "lucide-react";
import { reservasiApi } from "@/lib/api/reservasi";
import { ApiError } from "@/lib/api/client";
import { normalizeETicket } from "@/lib/api/normalize-eticket";
import type { ETicket } from "@/lib/types";
import { jam, labelTipe, rupiah, tanggalPanjang } from "@/lib/format";
import { statusMeta } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ETicketView({ id, baru }: { id: number; baru?: boolean }) {
  const [ticket, setTicket] = useState<ETicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    reservasiApi
      .eTicket(id)
      .then((data) => {
        if (data) {
          setTicket(normalizeETicket(data));
        } else {
          setError("Data e-ticket tidak ditemukan.");
        }
      })
      .catch((e) => {
        setError(
          e instanceof ApiError ? e.message : "Gagal memuat e-ticket.",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center print:hidden">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border-2 border-rose-border bg-rose-soft p-6 text-center print:hidden">
        <XCircle className="mx-auto h-8 w-8 text-rose-text" />
        <p className="mt-2 font-semibold text-rose-deep">
          {error ?? "E-ticket tidak dapat ditemukan."}
        </p>
        <Link href="/akun" className="mt-4 inline-block">
          <Button variant="outline">Kembali ke riwayat saya</Button>
        </Link>
      </div>
    );
  }

  const meta = statusMeta(ticket.status_reservasi);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Banner Notifikasi (Sembunyi saat di-print) */}
      {baru && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-sage-border bg-sage-soft p-4 text-sage-text print:hidden">
          <Sparkles className="h-5 w-5 shrink-0 text-sage-text" />
          <p className="text-sm font-semibold">
            Reservasi berhasil dibuat! Silakan simpan atau cetak e-ticket ini sebagai bukti reservasi.
          </p>
        </div>
      )}

      {/* Tombol Navigasi Kembali (Sembunyi saat di-print) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/akun/riwayat"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Riwayat
        </Link>
        <Button onClick={() => window.print()} variant="outline" size="sm">
          <Printer className="h-4 w-4" /> Cetak / Download PDF
        </Button>
      </div>

      {/* Area Kartu E-Ticket Digital (Hanya ini yang akan tercetak di PDF) */}
      <div className="overflow-hidden rounded-3xl border-2 border-black/[0.08] bg-white shadow-soft print:m-0 print:w-full print:border-none print:shadow-none print:rounded-none">
        {/* Header Tiket */}
        <div className="bg-brand p-6 text-white sm:p-8 print:p-6 print:bg-brand">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Ticket className="h-3.5 w-3.5" /> E-Ticket Bukti Reservasi
              </span>
              <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {ticket.coworking_space?.nama || "Coworking Space"}
              </h1>
              <p className="mt-1 text-xs text-white/80">
                Telp/Hubungi: {ticket.coworking_space?.telepon || "-"}
              </p>
            </div>
            <div className="text-right">
              <Badge className={cn("px-3 py-1 text-xs font-bold", meta.badge)}>
                {meta.label}
              </Badge>
              <p className="mt-2 font-mono text-xs font-semibold text-white/80">
                {ticket.e_ticket_number || ticket.kode_booking}
              </p>
            </div>
          </div>
        </div>

        {/* Bodi Tiket */}
        <div className="p-6 space-y-6 sm:p-8 print:p-6">
          {/* Detail Pemesan & Space */}
          <div className="grid gap-4 rounded-2xl bg-black/[0.02] p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-ink/40 uppercase">Pemesan</p>
              <p className="mt-1 font-bold text-ink">{ticket.member?.nama || "-"}</p>
              <p className="text-xs text-ink/60">{ticket.member?.instansi || "-"}</p>
              <p className="text-xs text-ink/60">{ticket.member?.telp || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink/40 uppercase">Ruangan / Space</p>
              <p className="mt-1 font-bold text-ink">{ticket.space?.nama || "-"}</p>
              <p className="text-xs font-medium text-brand">
                {labelTipe(ticket.space?.tipe || "desk")}
              </p>
              <p className="text-xs text-ink/60">
                {rupiah(ticket.space?.harga_per_jam || 0)} / jam
              </p>
            </div>
          </div>

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-2 gap-4 border-y border-black/[0.06] py-4">
            <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 text-brand shrink-0" />
              <div>
                <dt className="text-xs text-ink/50">Tanggal Sewa</dt>
                <dd className="font-semibold text-ink text-sm sm:text-base">
                  {tanggalPanjang(ticket.jadwal?.tanggal)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 text-brand shrink-0" />
              <div>
                <dt className="text-xs text-ink/50">Waktu & Durasi</dt>
                <dd className="font-semibold text-ink text-sm sm:text-base">
                  {jam(ticket.jadwal?.jam_mulai)} – {jam(ticket.jadwal?.jam_selesai)} ({ticket.jadwal?.durasi})
                </dd>
              </div>
            </div>
          </div>

          {/* Rincian Pembayaran */}
          <div className="space-y-2 text-sm">
            <h3 className="font-display font-bold text-ink text-base mb-3">Rincian Pembayaran</h3>
            <div className="flex justify-between text-ink/60">
              <span>Tarif Dasar ({ticket.jadwal?.durasi})</span>
              <span>{rupiah(ticket.rincian_pembayaran?.tarif_kotor || 0)}</span>
            </div>
            {(ticket.rincian_pembayaran?.potongan || 0) > 0 && (
              <div className="flex justify-between text-sage-text">
                <span>Diskon Promo ({ticket.rincian_pembayaran?.diskon_promo || "Promo"})</span>
                <span>− {rupiah(ticket.rincian_pembayaran?.potongan)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-dashed border-black/10 pt-3 font-display text-lg font-extrabold text-ink">
              <span>Total Dibayar</span>
              <span className="text-brand-text">
                {rupiah(ticket.rincian_pembayaran?.total_dibayar || 0)}
              </span>
            </div>
          </div>

          {/* Kode QR Verification */}
          <div className="rounded-2xl border-2 border-dashed border-black/15 bg-black/[0.01] p-5 text-center">
            <p className="text-xs font-semibold text-ink/50 mb-2">
              Tunjukkan QR Code / Payload ini saat check-in di lokasi:
            </p>
            <div className="inline-block rounded-xl bg-white p-3 shadow-sm border border-black/10 mb-2">
              <QrCode className="h-20 w-20 text-ink mx-auto" />
            </div>
            <p className="font-mono text-xs font-bold text-ink/80 tracking-wider">
              {ticket.qr_code_payload || ticket.kode_booking}
            </p>
          </div>
        </div>

        {/* Footer Tiket */}
        <div className="border-t border-black/[0.06] bg-black/[0.02] p-4 text-center text-xs text-ink/50">
          Simpan nota e-ticket ini sebagai bukti transaksi resmi. Terima kasih telah melakukan reservasi.
        </div>
      </div>
    </div>
  );
}