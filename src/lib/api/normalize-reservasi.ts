import type { Reservasi } from "@/lib/types";
import { hitungJamSelesai } from "@/lib/format";

/**
 * Server ujian mengembalikan hasil reservasi dalam bentuk yang berbeda dari
 * contoh di dokumen kontrak API: rincian harga & diskon dibungkus di
 * `detail_reservasi[0]` dan `price_breakdown`, bukan sebagai field flat
 * (`total_bayar`, `kode_booking`, `jam_selesai`, dst). Fungsi ini menormalkan
 * kedua kemungkinan bentuk tersebut jadi satu tipe `Reservasi` yang konsisten.
 */
export function normalizeReservasi(raw: unknown): Reservasi {
  const r = (raw ?? {}) as Record<string, unknown>;

  const detailList = Array.isArray(r.detail_reservasi)
    ? (r.detail_reservasi as Record<string, unknown>[])
    : [];
  const detail = detailList[0] ?? {};
  const pb = (r.price_breakdown ?? {}) as Record<string, unknown>;
  const detailSpace = (detail.space ?? {}) as Record<string, unknown>;
  const detailDiskon = (detail.diskon ?? {}) as Record<string, unknown>;

  const jamMulai = (r.jam_mulai as string) ?? "";
  const durasiJam = (r.durasi_jam as number) ?? 0;

  // Fallback untuk objek space (Mendukung respon dari API /api/reservasi/my/history)
  const rawSpace = (r.space as Record<string, unknown>) ?? (detailSpace as Record<string, unknown>);
  const spaceObj =
    rawSpace && Object.keys(rawSpace).length > 0
      ? rawSpace
      : r.space_name
      ? { nama_space: r.space_name as string }
      : undefined;

  return {
    id: (r.id as number) ?? 0,
    kode_booking:
      (r.kode_booking as string) ?? `BOOK-${String(r.id ?? "").padStart(4, "0")}`,
    id_member: (r.id_member as number) ?? 0,
    id_space:
      (r.id_space as number) ?? (detail.id_space as number) ?? (detailSpace.id as number) ?? 0,
    id_diskon:
      (r.id_diskon as number | null | undefined) ??
      (detail.id_diskon as number | undefined) ??
      (detailDiskon.id as number | undefined) ??
      null,
    tanggal_reservasi: (r.tanggal_reservasi as string) ?? "",
    jam_mulai: jamMulai,
    jam_selesai: (r.jam_selesai as string) ?? hitungJamSelesai(jamMulai, durasiJam),
    durasi_jam: durasiJam,
    harga_per_jam:
      (r.harga_per_jam as number) ??
      (pb.harga_per_jam as number) ??
      (detailSpace.harga_per_jam as number) ??
      0,
    total_harga_awal:
      (r.total_harga_awal as number) ??
      (pb.subtotal as number) ??
      (detail.total_harga as number) ??
      0,
    potongan_diskon:
      (r.potongan_diskon as number) ?? (pb.nominal_diskon as number) ?? 0,
    total_bayar:
      (r.total_bayar as number) ??
      (pb.total_harga as number) ??
      (detail.total_harga as number) ??
      0,
    status: (r.status as Reservasi["status"]) ?? "belum_dikonfirm",
    created_at: r.created_at as string | undefined,
    updated_at: r.updated_at as string | undefined,
    member: r.member as Reservasi["member"],
    space: spaceObj as Reservasi["space"],
  };
}

export function normalizeReservasiList(raw: unknown): Reservasi[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeReservasi);
  }
  return [];
}