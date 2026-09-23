// ============================================================
//  Tipe data WRKSPACE — diturunkan dari Kontrak API UKK Paket B
// ============================================================

// ---------- Format response standar ----------
export interface ApiSuccess<T> {
  status: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiFailure {
  status: false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// ---------- Enum & union ----------
export type Role = "member" | "admin_space";

export type SpaceTipe = "desk" | "meeting_room" | "private_office";

export type ReservasiStatus =
  | "belum_dikonfirm"
  | "disetujui"
  | "aktif"
  | "selesai"
  | "dibatalkan";

// ---------- Entity ----------
export interface SpaceOwner {
  id?: number;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
}

export interface SpaceType {
  tipe: SpaceTipe;
  label: string;
  deskripsi: string;
}

export interface Space {
  id: number;
  nama_space: string;
  harga_per_jam: number;
  tipe: SpaceTipe;
  kapasitas: number;
  deskripsi: string;
  foto?: string | null;
  foto_url?: string | null;
  id_owner?: number;
  owner?: SpaceOwner;
}

export interface Member {
  foto_url: string | null | undefined;
  id: number;
  username?: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Diskon {
  id: number;
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string;
  tanggal_akhir: string;
  is_active?: boolean;
}

export interface Reservasi {
  id: number;
  kode_booking: string;
  id_member: number;
  id_space: number;
  id_diskon?: number | null;
  tanggal_reservasi: string;
  jam_mulai: string;
  jam_selesai: string;
  durasi_jam: number;
  harga_per_jam: number;
  total_harga_awal: number;
  potongan_diskon: number;
  total_bayar: number;
  status: ReservasiStatus;
  created_at?: string;
  updated_at?: string;
  // Relasi opsional yang dikirim pada beberapa endpoint (list/detail)
  member?: Pick<Member, "id" | "nama_member" | "telp"> & Partial<Member>;
  space?: Pick<Space, "id" | "nama_space" | "tipe"> & Partial<Space>;
}

// ---------- User / Auth ----------
export interface AuthUser {
  id: number;
  username: string;
  role: Role;
  maker_id?: number;
  member?: Member | null;
  space_owner?: SpaceOwner | null;
  access_token: string;
}

/** Bentuk user yang disimpan di context (tanpa token). */
export interface SessionUser {
  id: number;
  username: string;
  role: Role;
  member?: Member | null;
  space_owner?: SpaceOwner | null;
}

// ---------- Availability ----------
export interface Availability {
  available: boolean;
  id_space: number;
  nama_space: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  durasi_jam: number;
  harga_per_jam: number;
  estimasi_total: number;
  conflicts: AvailabilityConflict[];
}

export interface AvailabilityConflict {
  kode_booking?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  status?: string;
  [key: string]: unknown;
}

// ---------- Diskon check ----------
export interface DiskonCheckResult extends Diskon {
  is_active: boolean;
}

// ---------- E-Ticket ----------
export interface ETicket {
  e_ticket_number: string;
  kode_booking: string;
  coworking_space: { nama: string; telepon: string };
  member: { nama: string; instansi: string; telp: string };
  space: { nama: string; tipe: string; harga_per_jam: number };
  jadwal: {
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
    durasi: string;
  };
  rincian_pembayaran: {
    tarif_kotor: number;
    diskon_promo: string;
    potongan: number;
    total_dibayar: number;
  };
  status_reservasi: string;
  qr_code_payload: string;
}

// ---------- Histori reservasi member ----------
export interface ReservasiHistory {
  month: number;
  year: number;
  total_reservasi: number;
  total_pengeluaran: number;
  items: Reservasi[];
}

// ---------- Laporan bulanan admin ----------
export interface LaporanTipe {
  tipe: SpaceTipe;
  label: string;
  total_booking: number;
  total_jam: number;
  total_pendapatan: number;
}

export interface LaporanBulanan {
  periode?: {
    bulan: number;
    nama_bulan: string;
    tahun: number;
  };
  ringkasan?: {
    total_reservasi: number;
    estimasi_pendapatan_total: number;
    realisasi_pendapatan: number;
    status_reservasi?: {
      belum_dikonfirm?: number;
      disetujui?: number;
      aktif?: number;
      selesai?: number;
      dibatalkan?: number;
    };
  };
  pendapatan_per_tipe_space?: {
    [key: string]: {
      count: number;
      total_income: number;
    };
  };
  tren_harian?: Array<{
    tanggal: string;
    total_reservations: number;
    total_income: number;
  }>;
}

// ---------- Upload ----------
export interface UploadResult {
  filename: string;
  url: string;
  original_name?: string;
  mimetype?: string;
  size?: number;
}

// ============================================================
//  DTO — payload request body
// ============================================================
export interface RegisterMemberDto {
  username: string;
  password: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: File | null;
}

export interface RegisterAdminSpaceDto {
  username: string;
  password: string;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface CheckPromoDto {
  nama_diskon: string;
}

export interface CreateReservasiDto {
  id_space: number;
  tanggal_reservasi: string;
  jam_mulai: string;
  durasi_jam: number;
  id_diskon?: number;
  kode_promo?: string;
}

export interface UpdateCoworkingProfileDto {
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
}

export interface CreateMemberAdminDto {
  username: string;
  password: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
}

export interface UpdateMemberAdminDto {
  nama_member?: string;
  instansi?: string;
  alamat?: string;
  telp?: string;
  password?: string;
  foto?: string;
}

export interface CreateSpaceDto {
  nama_space: string;
  harga_per_jam: number;
  tipe: SpaceTipe;
  kapasitas: number;
  deskripsi: string;
  foto?: string;
}

export interface UpdateSpaceDto {
  nama_space?: string;
  harga_per_jam?: number;
  tipe?: SpaceTipe;
  kapasitas?: number;
  deskripsi?: string;
  foto?: string;
}

export interface CreateDiskonDto {
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string;
  tanggal_akhir: string;
}

export interface UpdateDiskonDto {
  nama_diskon?: string;
  persentase_diskon?: number;
  tanggal_awal?: string;
  tanggal_akhir?: string;
}

export interface UpdateReservasiStatusDto {
  status: ReservasiStatus;
}

// ---------- Query params ----------
export interface SpaceListQuery {
  tipe?: SpaceTipe;
  search?: string;
}

export interface AvailabilityQuery {
  id_space: number;
  tanggal: string;
  jam_mulai: string;
  durasi_jam: number;
}

export interface AdminReservasiQuery {
  month?: number;
  year?: number;
  status?: ReservasiStatus;
  id_space?: number;
  tanggal?: string;
}
