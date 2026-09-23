import { api } from "./client";
import type {
  CreateReservasiDto,
  ETicket,
  Reservasi,
  ReservasiHistory,
} from "@/lib/types";
import { normalizeReservasi, normalizeReservasiList } from "./normalize-reservasi";
import { normalizeETicket } from "./normalize-eticket";

export const reservasiApi = {
  /** Buat pemesanan baru (member). */
  create: async (dto: CreateReservasiDto): Promise<Reservasi> =>
    normalizeReservasi(await api.post<unknown>("/api/reservasi", dto)),

  /** Semua reservasi milik member yang login. */
  my: async (): Promise<Reservasi[]> =>
    normalizeReservasiList(await api.get<unknown>("/api/reservasi/my")),

  /** Histori reservasi berdasarkan bulan & tahun. */
  history: async (month?: number, year?: number): Promise<ReservasiHistory> => {
    const raw = await api.get<Record<string, unknown>>("/api/reservasi/my/history", {
      query: { month, year },
    });

    // Backend mengembalikan array item di `raw.data`
    const rawList = Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw)
      ? raw
      : [];

    const normalizedItems = normalizeReservasiList(rawList);

    // Hitung total pengeluaran dari seluruh detail_reservasi
    const calculatedExpense = normalizedItems.reduce((acc, curr) => {
      return acc + (curr.total_bayar || 0);
    }, 0);

    return {
      month: (raw.filter_month as number) ?? (raw.month as number) ?? month ?? 0,
      year: (raw.filter_year as number) ?? (raw.year as number) ?? year ?? 0,
      total_reservasi: (raw.total_reservasi as number) ?? normalizedItems.length,
      total_pengeluaran: (raw.total_pengeluaran as number) ?? calculatedExpense,
      items: normalizedItems,
    };
  },

  /** E-ticket / nota digital reservasi. */
  eTicket: async (id: number | string): Promise<ETicket> =>
    normalizeETicket(await api.get<unknown>(`/api/reservasi/${id}/e-ticket`)),

  /** Detail satu reservasi. */
  detail: async (id: number | string): Promise<Reservasi> =>
    normalizeReservasi(await api.get<unknown>(`/api/reservasi/${id}`)),

  /** Batalkan reservasi (member). */
  cancel: async (id: number | string): Promise<Reservasi> =>
    normalizeReservasi(await api.patch<unknown>(`/api/reservasi/${id}/cancel`)),
};

export const createReservasi = (payload: CreateReservasiDto) => reservasiApi.create(payload);
export const getETicket = (id: number | string) => reservasiApi.eTicket(id);
export const getMyReservasiHistory = (month?: number, year?: number) => reservasiApi.history(month, year);