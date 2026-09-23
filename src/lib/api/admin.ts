import { api } from "./client";
import type {
  AdminReservasiQuery,
  CreateDiskonDto,
  CreateMemberAdminDto,
  CreateSpaceDto,
  Diskon,
  LaporanBulanan,
  Member,
  Reservasi,
  ReservasiStatus,
  Space,
  SpaceOwner,
  UpdateCoworkingProfileDto,
  UpdateDiskonDto,
  UpdateSpaceDto,
} from "@/lib/types";
import { normalizeReservasi, normalizeReservasiList } from "./normalize-reservasi";

export const adminApi = {
  // ---- Profil lokasi ----
  getProfile: () => api.get<SpaceOwner>("/api/admin/profile"),
  updateProfile: (dto: UpdateCoworkingProfileDto) =>
    api.put<SpaceOwner>("/api/admin/profile", dto),

  // ---- Member ----
  members: {
    list: (search?: string) =>
      api.get<Member[]>("/api/admin/members", { query: { search } }),
    detail: (id: number) => api.get<Member>(`/api/admin/members/${id}`),
    create: (dto: CreateMemberAdminDto | FormData) =>
      dto instanceof FormData
        ? api.postForm<Member>("/api/admin/members", dto)
        : api.post<Member>("/api/admin/members", dto),
    // Menggunakan putForm agar mengirim payload multipart/form-data
    update: (id: number, form: FormData) =>
      api.putForm<Member>(`/api/admin/members/${id}`, form),
    remove: (id: number) =>
      api.del<{ id: number; deleted: boolean }>(`/api/admin/members/${id}`),
  },

  // ---- Space ----
  spaces: {
  list: () => api.get<Space[]>("/api/admin/spaces"),
  detail: (id: number) => api.get<Space>(`/api/admin/spaces/${id}`),
  create: (dto: CreateSpaceDto | FormData) =>
    dto instanceof FormData
      ? api.postForm<Space>("/api/admin/spaces", dto)
      : api.post<Space>("/api/admin/spaces", dto),
  
  // Gunakan putForm jika mengirim FormData (multipart/form-data)
  update: (id: number, form: FormData | UpdateSpaceDto) =>
    form instanceof FormData
      ? api.putForm<Space>(`/api/admin/spaces/${id}`, form)
      : api.put<Space>(`/api/admin/spaces/${id}`, form),

  remove: (id: number) =>
    api.del<{ id: number; deleted: boolean }>(`/api/admin/spaces/${id}`),
},

  // ---- Diskon ----
  diskon: {
    list: () => api.get<Diskon[]>("/api/admin/diskon"),
    detail: (id: number) => api.get<Diskon>(`/api/admin/diskon/${id}`),
    create: (dto: CreateDiskonDto) => api.post<Diskon>("/api/admin/diskon", dto),
    update: (id: number, dto: UpdateDiskonDto) =>
      api.put<Diskon>(`/api/admin/diskon/${id}`, dto),
    remove: (id: number) =>
      api.del<{ id: number; deleted: boolean }>(`/api/admin/diskon/${id}`),
  },

  // ---- Reservasi ----
  reservasi: {
    list: async (q: AdminReservasiQuery = {}): Promise<Reservasi[]> =>
      normalizeReservasiList(
        await api.get<unknown>("/api/admin/reservasi", { query: { ...q } }),
      ),
    updateStatus: async (id: number, status: ReservasiStatus): Promise<Reservasi> =>
      normalizeReservasi(
        await api.patch<unknown>(`/api/admin/reservasi/${id}/status`, { status }),
      ),
    checkIn: async (id: number): Promise<Reservasi> =>
      normalizeReservasi(await api.post<unknown>(`/api/admin/reservasi/${id}/check-in`)),
    checkOut: async (id: number): Promise<Reservasi> =>
      normalizeReservasi(await api.post<unknown>(`/api/admin/reservasi/${id}/check-out`)),
  },

  // ---- Laporan ----
  reports: {
    monthly: async (month?: number, year?: number): Promise<LaporanBulanan> => {
      try {
        const raw = await api.get<any>("/api/admin/reports/monthly", {
          query: { month, year },
        });
        return (raw?.data ?? raw) as LaporanBulanan;
      } catch {
        const rawAlias = await api.get<any>("/api/admin/reports/income", {
          query: { month, year },
        });
        return (rawAlias?.data ?? rawAlias) as LaporanBulanan;
      }
    },
    income: async (month?: number, year?: number): Promise<LaporanBulanan> => {
      const raw = await api.get<any>("/api/admin/reports/income", {
        query: { month, year },
      });
      return (raw?.data ?? raw) as LaporanBulanan;
    },
  },
};