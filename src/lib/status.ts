import type { ReservasiStatus } from "@/lib/types";

export interface StatusMeta {
  label: string;
  /** Kelas untuk badge (background + border + text). */
  badge: string;
  /** Kelas titik/dot pada timeline. */
  dot: string;
  /** Urutan pada alur normal (untuk timeline). -1 = di luar alur (dibatalkan). */
  order: number;
}

/**
 * Normalisasi nilai status. Backend kadang mengirim "belum dikonfirm"
 * (dengan spasi) — kita samakan ke "belum_dikonfirm".
 */
export function normalizeStatus(raw?: string | null): ReservasiStatus {
  if (!raw || typeof raw !== "string") {
    return "belum_dikonfirm";
  }

  const s = raw.trim().toLowerCase().replace(/\s+/g, "_");

  if (
    s === "belum_dikonfirm" ||
    s === "belum_dikonfirmasi" ||
    s === "pending" ||
    s === "waiting"
  ) {
    return "belum_dikonfirm";
  }

  if (s === "disetujui" || s === "approved" || s === "confirmed") {
    return "disetujui";
  }

  if (s === "aktif" || s === "active" || s === "digunakan") {
    return "aktif";
  }

  if (s === "selesai" || s === "completed" || s === "done") {
    return "selesai";
  }

  if (s === "dibatalkan" || s === "cancelled" || s === "canceled") {
    return "dibatalkan";
  }

  return "belum_dikonfirm";
}

export const STATUS_META: Record<ReservasiStatus, StatusMeta> = {
  belum_dikonfirm: {
    label: "Menunggu Konfirmasi",
    badge: "bg-butter-soft border-butter-border text-butter-text",
    dot: "bg-butter",
    order: 0,
  },
  disetujui: {
    label: "Disetujui",
    badge: "bg-sky-soft border-sky-border text-sky-text",
    dot: "bg-sky",
    order: 1,
  },
  aktif: {
    label: "Sedang Digunakan",
    badge: "bg-sage-soft border-sage-border text-sage-text",
    dot: "bg-sage",
    order: 2,
  },
  selesai: {
    label: "Selesai",
    badge: "bg-grape-soft border-grape-border text-grape-text",
    dot: "bg-grape",
    order: 3,
  },
  dibatalkan: {
    label: "Dibatalkan",
    badge: "bg-rose-soft border-rose-border text-rose-text",
    dot: "bg-rose",
    order: -1,
  },
};

/**
 * Mengembalikan metadata status lengkap.
 * Menyediakan baik properti `badge` maupun `badgeClass` agar kompatibel di semua komponen.
 */
export function statusMeta(statusRaw?: string | null) {
  const status = normalizeStatus(statusRaw);
  const meta = STATUS_META[status];

  return {
    ...meta,
    badgeClass: meta.badge, // Alias agar mendukung kode yang memanggil meta.badgeClass
  };
}

/** Urutan tahapan untuk komponen timeline reservasi. */
export const TIMELINE_STEPS: ReservasiStatus[] = [
  "belum_dikonfirm",
  "disetujui",
  "aktif",
  "selesai",
];