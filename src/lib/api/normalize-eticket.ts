import type { ETicket } from "@/lib/types";
import { hitungJamSelesai } from "@/lib/format";

/**
 * Normalisasi data respon E-Ticket dari berbagai kemungkinan struktur JSON backend.
 * Memastikan semua properti memiliki fallback nilai bawaan sehingga aman dari runtime error.
 */
export function normalizeETicket(raw: unknown): ETicket {
  const r = (raw ?? {}) as Record<string, unknown>;

  const coworking = (r.coworking_space ?? r.coworkingSpace ?? {}) as Record<string, unknown>;
  const member = (r.member ?? {}) as Record<string, unknown>;
  const space = (r.space ?? {}) as Record<string, unknown>;
  const jadwal = (r.jadwal ?? {}) as Record<string, unknown>;

  const biaya =
    (r.rincian_biaya as Record<string, unknown> | undefined) ??
    (r.rincian_pembayaran as Record<string, unknown> | undefined) ??
    {};

  // Penanganan waktu dan durasi
  const jamMulai = (jadwal.jam_mulai as string) ?? (jadwal.jamMulai as string) ?? "00:00";

  const durasiDariTeks =
    parseInt(String(jadwal.durasi ?? "").replace(/\D+/g, ""), 10) || 0;

  // PERBAIKAN BARIS 27-29: Menambahkan tanda kurung pada perpaduan operator ?? dan ||
  const durasiJam =
    (biaya.durasi_jam as number) ??
    (r.durasi_jam as number) ??
    (durasiDariTeks || 1);

  // Perhitungan rincian keuangan
  const subtotal =
    (biaya.subtotal as number) ??
    (biaya.tarif_kotor as number) ??
    (r.total_harga_awal as number) ??
    0;

  const totalBayar =
    (biaya.total_pembayaran as number) ??
    (biaya.total_dibayar as number) ??
    (r.total_bayar as number) ??
    subtotal;

  const potongan =
    (biaya.potongan as number) ??
    (r.potongan_diskon as number) ??
    Math.max(0, subtotal - totalBayar);

  // Penanganan diskon
  const diskonNama = (biaya.diskon_nama as string | null) ?? (r.kode_promo as string | null) ?? null;
  const diskonPersen = (biaya.diskon_persen as string) ?? "0%";
  const diskonPromo =
    (biaya.diskon_promo as string) ??
    (diskonNama ? `${diskonPersen} (${diskonNama})` : diskonPersen);

  // Normalisasi string status
  const rawStatus =
    (r.status_reservasi as string) ??
    (r.status as string) ??
    "belum_dikonfirm";

  return {
    e_ticket_number:
      (r.e_ticket_number as string) ??
      (r.eTicketNumber as string) ??
      (r.booking_code as string) ??
      (r.kode_booking as string) ??
      "-",
    kode_booking:
      (r.kode_booking as string) ??
      (r.kodeBooking as string) ??
      (r.booking_code as string) ??
      "-",
    coworking_space: {
      nama: (coworking.nama as string) ?? (coworking.nama_coworking as string) ?? "Coworking Space",
      telepon:
        (coworking.telepon as string) ??
        (coworking.telp as string) ??
        (coworking.phone as string) ??
        "-",
    },
    member: {
      nama: (member.nama as string) ?? (member.nama_member as string) ?? "-",
      instansi: (member.instansi as string) ?? "-",
      telp: (member.telp as string) ?? (member.telepon as string) ?? "-",
    },
    space: {
      nama: (space.nama as string) ?? (space.nama_space as string) ?? "Space Workstation",
      tipe: (space.tipe as string) ?? "desk",
      harga_per_jam:
        (space.harga_per_jam as number) ??
        (space.hargaPerJam as number) ??
        0,
    },
    jadwal: {
      tanggal:
        (jadwal.tanggal as string) ??
        (r.tanggal_reservasi as string) ??
        "-",
      jam_mulai: jamMulai,
      jam_selesai:
        (jadwal.jam_selesai as string) ??
        (r.jam_selesai as string) ??
        hitungJamSelesai(jamMulai, durasiJam),
      durasi: (jadwal.durasi as string) ?? `${durasiJam} Jam`,
    },
    rincian_pembayaran: {
      tarif_kotor: subtotal,
      diskon_promo: diskonPromo,
      potongan,
      total_dibayar: totalBayar,
    },
    status_reservasi: String(rawStatus),
    qr_code_payload:
      (r.qr_code_payload as string) ??
      (r.qr_code_data as string) ??
      (r.kode_booking as string) ??
      "VERIFY-RESERVASI",
  };
}