import { BASE_URL } from "@/lib/api/client";
import type { SpaceTipe } from "@/lib/types";

/** Format angka ke Rupiah, mis. 25000 -> "Rp 25.000". */
export function rupiah(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return "Rp " + n.toLocaleString("id-ID");
}

/** Format tanggal ISO/YYYY-MM-DD ke "30 Agustus 2026". */
export function tanggalPanjang(input: string | null | undefined): string {
  if (!input) return "-";
  const d = new Date(input.length <= 10 ? `${input}T00:00:00` : input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format tanggal ke bentuk pendek "30 Agu 2026". */
export function tanggalPendek(input: string | null | undefined): string {
  if (!input) return "-";
  const d = new Date(input.length <= 10 ? `${input}T00:00:00` : input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Ambil "HH:mm" dari string jam apa pun. */
export function jam(input: string | null | undefined): string {
  if (!input) return "-";
  const m = input.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : input;
}

/** Hitung jam selesai dari jam mulai + durasi (untuk pratinjau di form). */
export function hitungJamSelesai(jamMulai: string, durasiJam: number): string {
  const m = jamMulai.match(/(\d{1,2}):(\d{2})/);
  if (!m) return "-";
  const total = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10)) + durasiJam * 60;
  const hh = Math.floor((total % (24 * 60)) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export type ImageFolder = "spaces" | "members" | "general";
/**
 * Bangun URL gambar yang benar dari data backend.
 * - URL penuh "http://localhost:3000/uploads/..." → host diganti STATIC_DOMAIN
 *   (termasuk path /coworking, bukan hanya origin-nya).
 * - Nama file saja ("budi.jpg") → STATIC_DOMAIN/uploads/<folder>/budi.jpg
 */
export function resolveImageUrl(
  url: string | null | undefined,
  folder: ImageFolder = "spaces"
): string | undefined {
  const v = (url ?? "").trim();
  if (!v || v === "null" || v === "undefined") return undefined;

  // PENTING: pakai BASE_URL yang sama dengan client API (sudah termasuk
  // protokol & path dasar, mis. "https://learn.smktelkom-mlg.sch.id/coworking").
  // Sebelumnya di sini ada domain hardcoded TANPA path "/coworking", sehingga
  // semua URL foto 404 (space tidak pernah ke-mount di root domain, tapi di
  // bawah /coworking).
  const STATIC_DOMAIN = BASE_URL;

  // 1. Jika URL sudah berupa absolut HTTP/HTTPS (mis. dari backend:
  //    "http://localhost:3000/uploads/spaces/xxx.jpg")
  if (/^https?:\/\//i.test(v)) {
    // Ambil bagian path mulai dari "/uploads/..." saja, lalu tempel ke
    // STATIC_DOMAIN kita (supaya path "/coworking" ikut terbawa).
    const match = v.match(/\/uploads\/.*/i);
    if (match) return `${STATIC_DOMAIN}${match[0]}`;
    return v;
  }

  const clean = v.replace(/^\/+/, "");

  // 2. Jika nilai dari DB mengandung 'uploads/'
  if (clean.startsWith("uploads/")) {
    return `${STATIC_DOMAIN}/${clean}`;
  }

  // 3. Jika hanya nama file (misal: "1789976452164-824447457.jpg")
  return `${STATIC_DOMAIN}/uploads/${folder}/${clean}`;
}

const TIPE_LABEL: Record<SpaceTipe, string> = {
  desk: "Personal Desk",
  meeting_room: "Meeting Room",
  private_office: "Private Office",
};

export function labelTipe(tipe: SpaceTipe | string): string {
  return TIPE_LABEL[tipe as SpaceTipe] ?? tipe;
}

/** Kelas warna Tailwind per tipe space (untuk badge/card). */
export const TIPE_THEME: Record<
  SpaceTipe,
  { soft: string; border: string; text: string; solid: string; icon: string }
> = {
  desk: {
    soft: "bg-brand-soft",
    border: "border-brand-border",
    text: "text-brand-text",
    solid: "bg-brand text-white",
    icon: "bg-brand-border text-brand-deep",
  },
  meeting_room: {
    soft: "bg-sky-soft",
    border: "border-sky-border",
    text: "text-sky-text",
    solid: "bg-sky text-white",
    icon: "bg-sky-border text-sky-deep",
  },
  private_office: {
    soft: "bg-sage-soft",
    border: "border-sage-border",
    text: "text-sage-text",
    solid: "bg-sage text-white",
    icon: "bg-sage-border text-sage-deep",
  },
};