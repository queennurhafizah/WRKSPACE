import { api } from "./client";
import type { Diskon, DiskonCheckResult } from "@/lib/types";

/**
 * Server ujian kadang membungkus hasil /api/diskon/check secara berbeda dari
 * contoh di dokumen kontrak (mis. { diskon: {...} } atau { result: {...} }
 * alih-alih objek diskon secara langsung). Fungsi ini menormalkan berbagai
 * kemungkinan bentuk tersebut supaya nama_diskon & persentase_diskon selalu
 * terisi dengan benar, apa pun bentuk aslinya.
 */
function normalizeDiskonCheck(
  raw: unknown,
  fallbackKode: string,
): DiskonCheckResult {
  const obj = (raw ?? {}) as Record<string, unknown>;

  // Kandidat lokasi objek diskon: langsung di root, atau dibungkus di
  // salah satu key umum ini.
  const nested =
    (obj.diskon as Record<string, unknown> | undefined) ??
    (obj.data as Record<string, unknown> | undefined) ??
    (obj.result as Record<string, unknown> | undefined) ??
    obj;

  const persentase =
    (nested.persentase_diskon as number | undefined) ??
    (nested.persentase as number | undefined) ??
    (nested.diskon_persen as number | undefined) ??
    (nested.percentage as number | undefined);

  if (persentase === undefined) {
    // Bentuk response tidak dikenali sama sekali — bantu debug tanpa
    // membuat aplikasi crash.
    console.warn(
      "[diskonApi.check] Tidak menemukan field persentase pada response. " +
        "Cek Network tab untuk melihat bentuk asli response /api/diskon/check:",
      raw,
    );
  }

  return {
    id: (nested.id as number) ?? 0,
    nama_diskon:
      (nested.nama_diskon as string | undefined) ??
      (nested.kode as string | undefined) ??
      (nested.code as string | undefined) ??
      fallbackKode,
    persentase_diskon: persentase ?? 0,
    tanggal_awal: (nested.tanggal_awal as string) ?? "",
    tanggal_akhir: (nested.tanggal_akhir as string) ?? "",
    is_active:
      (nested.is_active as boolean | undefined) ??
      (obj.valid as boolean | undefined) ??
      true,
  };
}

export const diskonApi = {
  /** Daftar promo/diskon yang sedang aktif. */
  active: () => api.get<Diskon[]>("/api/diskon/active"),

  /** Periksa validitas kode promo dan hitung potongannya. */
  check: async (nama_diskon: string): Promise<DiskonCheckResult> => {
    const raw = await api.post<unknown>("/api/diskon/check", { nama_diskon });
    return normalizeDiskonCheck(raw, nama_diskon);
  },

  /** Detail diskon berdasarkan ID. */
  detail: (id: number) => api.get<Diskon>(`/api/diskon/${id}`),
};
