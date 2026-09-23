# WRKSPACE — Website Coworking Space (Single Tenant)

Frontend UKK RPL Paket B: sistem reservasi coworking space untuk **satu**
lokasi/brand. Dibangun dengan Next.js (App Router), TypeScript, Tailwind CSS,
Framer Motion, dan lucide-react. Tema visual: **Retro Pop** (base terang dengan
aksen dusty pink, sky blue, dan sage).

---

## Cara menjalankan

Prasyarat: **Node.js 18.18+** (disarankan 20 LTS).

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment
cp .env.local.example .env.local
#    lalu isi NEXT_PUBLIC_API_BASE_URL dan NEXT_PUBLIC_APP_KEY

# 3. Jalankan mode development
npm run dev
#    buka http://localhost:3000
```

Build produksi: `npm run build` lalu `npm run start`.

---

## Setup akun (dilakukan sekali, sebelum memakai aplikasi)

Backend memakai **multi-tenancy App Maker**. Setiap request wajib menyertakan
header `x-maker-key`. Website ini menyuntikkannya otomatis dari
`NEXT_PUBLIC_APP_KEY`.

### 1. Daftar App Maker → dapatkan `app_key`

Lewat Postman / curl (base URL dari panitia):

```
POST /api/maker/register
{
  "name": "Nama Siswa",
  "username": "username_siswa",
  "email": "siswa@sekolah.sch.id",
  "password": "Password123!"
}
```

Salin `app_key` (mis. `mk_xxxx...`) dari respons ke `.env.local` sebagai
`NEXT_PUBLIC_APP_KEY`.

### 2. Daftar akun Admin Space (hanya satu kali)

Website ini **tidak** punya halaman registrasi admin (sesuai spesifikasi: hanya
satu akun admin). Buat akun admin lewat Postman:

```
POST /api/auth/register/admin-space
Header: x-maker-key: mk_xxxx...
{
  "username": "admin",
  "password": "Admin123!",
  "nama_coworking": "WRKSPACE Hub",
  "nama_pemilik": "Nama Pemilik",
  "telp": "081200000000"
}
```

Kredensial ini dipakai untuk login di halaman `/admin-login`. Data
`nama_coworking`, `nama_pemilik`, dan `telp` inilah yang tampil sebagai brand
di navbar, halaman Tentang, dan footer.

Member/pelanggan bisa mendaftar sendiri lewat halaman `/sign-up`.

---

## Struktur project

```
src/
├─ app/
│  ├─ layout.tsx            Root: font Syne/Outfit + AuthProvider
│  ├─ globals.css           Tailwind + token retro
│  └─ (public)/             Halaman publik (beranda, dst.)
├─ components/
│  ├─ providers/            AuthProvider (context sesi)
│  ├─ site/                 Navbar, footer, drawer (menyusul)
│  └─ ui/                   Logo, Button, Badge, ...
├─ lib/
│  ├─ api/                  Client + modul endpoint per domain
│  ├─ types/                Interface dari DTO kontrak API
│  ├─ auth-storage.ts       Sesi berbasis cookie
│  ├─ brand.ts              Identitas brand dari data owner
│  ├─ format.ts             rupiah(), tanggal, jam, URL gambar
│  ├─ status.ts             Label + warna status reservasi
│  └─ utils.ts              Helper cn()
└─ middleware.ts            Proteksi route member & admin
```

## Peran & akses

| Area                         | Akses                          |
| ---------------------------- | ------------------------------ |
| `/`, `/spaces`, `/promo`, …  | Publik (tanpa login)           |
| `/sign-in`, `/sign-up`       | Publik                         |
| `/reservasi/*`, `/akun/*`    | Wajib login **member**         |
| `/admin/*`                   | Wajib login **admin_space**    |

Member bebas login kapan saja; login hanya diwajibkan saat akan melakukan
transaksi/reservasi.

## Catatan implementasi

- **Tidak ada endpoint pembayaran** di kontrak API. Halaman pembayaran dibuat
  sebagai simulasi (rincian tagihan + konfirmasi manual), lalu status menunggu
  konfirmasi admin.
- **Member tidak bisa mengedit profilnya sendiri** (hanya `GET /api/auth/profile`).
  Perubahan data member dilakukan admin.
- **Foto** dari backend memakai host `localhost:3000`; helper `resolveImageUrl()`
  otomatis menggantinya dengan origin API yang aktif.

## Status pengerjaan

- [x] Fondasi: design system, tipe, API client, auth, middleware
- [ ] Public shell (navbar sticky, mobile drawer, footer) + landing lengkap
- [ ] Katalog space + detail + cek ketersediaan
- [ ] Auth pages (sign-in, sign-up, admin-login)
- [ ] Flow reservasi + pembayaran + e-ticket
- [ ] Area member (reservasi, riwayat, profil)
- [ ] Dashboard admin (CRUD + laporan)
