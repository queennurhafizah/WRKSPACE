"use client";

import Link from "next/link";
import { Ban, CalendarDays, Clock, CreditCard, Loader2, Ticket } from "lucide-react";
import type { Reservasi } from "@/lib/types";
import { jam, labelTipe, rupiah, tanggalPanjang } from "@/lib/format";
import { normalizeStatus, statusMeta } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ReservasiCard({
  reservasi,
  onCancel,
  canceling,
}: {
  reservasi: Reservasi;
  onCancel?: (id: number) => void;
  canceling?: boolean;
}) {
  const status = normalizeStatus(reservasi.status);
  const meta = statusMeta(reservasi.status);
  const canCancel = status === "belum_dikonfirm" || status === "disetujui";
  const canPay = status === "belum_dikonfirm";
  const canTicket =
    status === "disetujui" || status === "aktif" || status === "selesai";
  const spaceName = reservasi.space?.nama_space ?? `Space #${reservasi.id_space}`;

  return (
    <div className="rounded-2xl border-2 border-black/[0.06] bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold tracking-tight text-ink/45">
            {reservasi.kode_booking}
          </p>
          <h3 className="mt-0.5 font-display text-lg font-bold text-ink">
            {spaceName}
          </h3>
          {reservasi.space?.tipe && (
            <p className="text-xs text-ink/50">{labelTipe(reservasi.space.tipe)}</p>
          )}
        </div>
        <Badge className={meta.badge}>{meta.label}</Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info
          icon={<CalendarDays className="h-4 w-4" />}
          label="Tanggal"
          value={tanggalPanjang(reservasi.tanggal_reservasi)}
        />
        <Info
          icon={<Clock className="h-4 w-4" />}
          label="Jam"
          value={`${jam(reservasi.jam_mulai)} – ${jam(reservasi.jam_selesai)}`}
        />
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
        <div>
          <p className="text-xs text-ink/50">Total bayar</p>
          <p className="font-display text-lg font-extrabold text-ink">
            {rupiah(reservasi.total_bayar)}
          </p>
        </div>
        <div className="flex gap-2">
          {canCancel && onCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(reservasi.id)}
              disabled={canceling}
            >
              {canceling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Ban className="h-4 w-4" /> Batalkan
                </>
              )}
            </Button>
          )}
          {canPay && (
            <Link href={`/reservasi/${reservasi.id}/bayar`}>
              <Button size="sm">
                <CreditCard className="h-4 w-4" /> Lanjut bayar
              </Button>
            </Link>
          )}
          {canTicket && (
            <Link href={`/akun/tiket/${reservasi.id}`}>
              <Button variant="secondary" size="sm">
                <Ticket className="h-4 w-4" /> E-ticket
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-ink/40">{icon}</span>
      <div>
        <dt className="text-xs text-ink/50">{label}</dt>
        <dd className="font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}