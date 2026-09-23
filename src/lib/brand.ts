import { spacesApi } from "@/lib/api/spaces";
import type { SpaceOwner } from "@/lib/types";

/**
 * Identitas brand coworking. Karena ini website single-tenant, data pemilik
 * diambil dari field `owner` pada katalog space (endpoint publik). Jika belum
 * ada space sama sekali, dipakai nilai default di bawah.
 */
export interface Brand {
  name: string;
  owner: string;
  phone: string;
  tagline: string;
}

export const DEFAULT_BRAND: Brand = {
  name: "WRKSPACE",
  owner: "Pengelola WRKSPACE",
  phone: "-",
  tagline: "Tempat Kerja Energik, Hasil Maksimal.",
};

/** Ambil identitas brand dari katalog space (publik, tanpa login). */
export async function getBrand(): Promise<Brand> {
  try {
    const spaces = await spacesApi.list();
    const owner: SpaceOwner | undefined = spaces.find((s) => s.owner)?.owner;
    if (!owner) return DEFAULT_BRAND;
    return {
      name: owner.nama_coworking || DEFAULT_BRAND.name,
      owner: owner.nama_pemilik || DEFAULT_BRAND.owner,
      phone: owner.telp || DEFAULT_BRAND.phone,
      tagline: DEFAULT_BRAND.tagline,
    };
  } catch {
    return DEFAULT_BRAND;
  }
}
