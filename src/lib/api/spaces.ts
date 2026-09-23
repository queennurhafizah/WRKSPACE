import { api, ApiError } from "./client";
import { hitungJamSelesai } from "@/lib/format";
import type {
  Availability,
  AvailabilityConflict,
  AvailabilityQuery,
  Space,
  SpaceListQuery,
  SpaceType,
} from "@/lib/types";

/**
 * ID pemilik (space owner) coworking ini. Endpoint publik /api/spaces
 * mengembalikan space dari SEMUA admin di bawah app_key yang sama, jadi
 * untuk website single-tenant kita saring berdasarkan id_owner.
 * Kosongkan di .env.local jika tidak ingin menyaring.
 */
const OWNER_ID = Number(process.env.NEXT_PUBLIC_OWNER_ID) || null;

function milikKita(s: Space): boolean {
  if (!OWNER_ID) return true;
  return s.id_owner === undefined || s.id_owner === OWNER_ID;
}

export const spacesApi = {
  /** Daftar tipe space (desk, meeting_room, private_office). */
  types: () => api.get<SpaceType[]>("/api/spaces/types"),

  /**
   * Cek ketersediaan space pada tanggal & jam tertentu.
   *
   * Backend asli mengembalikan ARRAY berisi objek space + flag `is_available`
   * dan `conflicts`, sedangkan dokumentasi lama memakai OBJECT
   * `{ available, estimasi_total, ... }`. Kedua bentuk dinormalisasi di sini
   * supaya UI selalu punya `available`, `estimasi_total`, dan `conflicts`.
   */
  availability: async (q: AvailabilityQuery): Promise<Availability> => {
    const raw = await api.get<unknown>("/api/spaces/availability", {
      query: { ...q },
    });

    const item = (Array.isArray(raw) ? raw[0] : raw) as
      | Record<string, unknown>
      | undefined;

    const num = (v: unknown, fallback = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const harga = num(item?.harga_per_jam);
    const durasi = q.durasi_jam;

    // Utamakan `available`, jika tidak ada pakai `is_available`.
    const available =
      typeof item?.available === "boolean"
        ? item.available
        : Boolean(item?.is_available);

    const conflicts: AvailabilityConflict[] = Array.isArray(item?.conflicts)
      ? (item!.conflicts as AvailabilityConflict[])
      : [];

    return {
      available,
      id_space: num(item?.id_space ?? item?.id, q.id_space),
      nama_space: (item?.nama_space as string) ?? "",
      tanggal: (item?.tanggal as string) ?? q.tanggal,
      jam_mulai: (item?.jam_mulai as string) ?? q.jam_mulai,
      jam_selesai:
        (item?.jam_selesai as string) ??
        hitungJamSelesai(q.jam_mulai, durasi),
      durasi_jam: num(item?.durasi_jam, durasi),
      harga_per_jam: harga,
      estimasi_total: num(item?.estimasi_total, harga * durasi),
      conflicts,
    };
  },

  /** Katalog space milik coworking ini (opsional filter tipe & pencarian). */
  list: async (q: SpaceListQuery = {}) => {
    const all = await api.get<Space[]>("/api/spaces", { query: { ...q } });
    return all.filter(milikKita);
  },

  /** Detail satu space berdasarkan ID (404 jika milik coworking lain). */
  detail: async (id: number) => {
    const space = await api.get<Space>(`/api/spaces/${id}`);
    if (!milikKita(space)) {
      throw new ApiError("Space tidak ditemukan.", 404, "NotFound");
    }
    return space;
  },
};