# ArenaStats
## Tournament Management & Statistics Engine

**ArenaStats** adalah aplikasi web terintegrasi untuk mengelola kompetisi, liga, turnamen, jadwal pertandingan (*fixtures*), hasil pertandingan (*result engine*), dan klasemen otomatis (*deterministic standings engine*) dengan integritas data tinggi.

---

## 1. Ikhtisar Produk (Product Overview)
ArenaStats memecahkan masalah pencatatan klasemen manual yang memakan waktu dan rawan salah hitung. Setiap angka pada tabel klasemen diturunkan secara deterministik dan matematis dari hasil pertandingan yang sah. Perubahan atau koreksi skor secara otomatis memperbarui klasemen tanpa ada inkonsistensi data.

- **Status Produk:** MVP Selesai & Lolos Uji Regresi (PRD v2.0.0).
- **Target Pengguna:** Tournament Organizer, League Manager, Community Administrator, Personal Simulator, Public Viewer.
- **Prinsip Utama:** *Data Integrity First*, *Configurable Rules*, *Historical Consistency*, *Clear State Management*, *Secure by Default*.

---

## 2. Fitur Utama (Feature List)

### A. Dashboard Interaktif (P0)
- Metrik real-time: total tim aktif, pemain terdaftar, season berjalan, dan laga diselesaikan.
- Cuplikan klasemen season utama dengan lencana posisi #1.
- Widget jadwal laga mendatang (*upcoming matches*) dan hasil laga terkini (*recent results*).
- Tombol aksi cepat: Buat Tim, Buat Season, Input Skor Laga.

### B. Manajemen Tim & Logo Fallback (P0)
- CRUD profil tim lengkap dengan nama, kode singkat (*short code*, maks. 6 karakter unik per workspace), dan deskripsi.
- Generator avatar badge otomatis (*fallback*) jika logo tidak tersedia atau gagal dimuat.
- Pencegahan penghapusan tidak aman (*safe deletion*): tim yang memiliki riwayat pertandingan atau pendaftaran season dilindungi dan dialihkan ke fitur pengarsipan (*archive*).

### C. Manajemen Pemain & Riwayat Roster (P0)
- Profil atlet/pemain: nama lengkap, *in-game name* (IGN), peran (*role*), dan kode negara.
- Struktur keanggotaan tim (*TeamMemberships*) dengan pelacakan tanggal mulai, tanggal akhir, dan status aktif untuk mendukung perpindahan pemain (*transfer*) tanpa merusak riwayat masa lalu.

### D. Manajemen Season & Format Single Round Robin (P0)
- Konfigurasi poin fleksibel per season: Menang (Win, bawaan 3), Seri (Draw, bawaan 1), Kalah (Loss, bawaan 0).
- Siklus status season: `draft` &rarr; `scheduled` &rarr; `active` &rarr; `completed` &rarr; `archived`.
- Pendaftaran tim peserta dengan nomor unggulan (*seed number*).

### E. Generator Jadwal Single Round Robin (P0)
- Menghasilkan tepat $n \times (n - 1) / 2$ pertandingan menggunakan *Circle Method / Berger Tables*.
- Penanganan tim genap ($n-1$ ronde) dan ganjil ($n$ ronde dengan *bye* otomatis).
- Rotasi kandang (*home*) dan tandang (*away*) yang seimbang.
- **Idempotensi:** Verifikasi jadwal agar tidak ada pasangan duplikat dan blokade regenerasi jika sudah ada pertandingan yang diselesaikan.

### F. Result Engine & Log Audit Koreksi Skor (P0)
- Pencatatan skor pertandingan dengan validasi bilangan bulat non-negatif ($\ge 0$).
- Penentuan pemenang otomatis atau status seri.
- **Koreksi Skor Aman:** Pencatatan riwayat revisi pada tabel `MatchResultRevision` lengkap dengan skor lama, skor baru, waktu, dan alasan koreksi.
- Transaksi database atomik: pembaruan skor dan rekalkulasi klasemen tidak pernah meninggalkan data setengah tersimpan.

### G. Standings Engine Deterministik (P0)
- Menghitung metrik lengkap: Main (P), Menang (W), Seri (D), Kalah (L), Memasukkan (SF), Kemasukan (SA), Selisih Skor (SD = SF - SA), Poin (PTS).
- Pelacak performa 5 pertandingan terakhir (W/D/L).
- Hirarki tie-breaker:
  1. Poin tertinggi (PTS)
  2. Selisih skor tertinggi (SD)
  3. Skor memasukkan tertinggi (SF)
  4. Perbandingan *Head-to-Head* (H2H) langsung antar tim
  5. Fallback alfabetis stabil

### H. Ekspor & Cetak (P1)
- Unduh klasemen resmi dalam format **CSV (UTF-8 BOM)** siap pakai di Microsoft Excel / Google Sheets.
- Tampilan ramah cetak (**Print-ready View**) melalui tombol cetak terintegrasi.

### I. UI Responsif & Dukungan Dark / Light Mode (P1)
- Desain modern bertema *sports analytics dashboard*.
- Tema gelap bawaan (*dark mode default*) dengan tombol pengalih tema terang (*light mode toggle*) yang tersimpan di `localStorage`.
- Tata letak responsif penuh untuk ponsel (mulai 320px), tablet (768px), dan desktop (1280px+).

---

## 3. Tech Stack
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/), [Tailwind CSS v3](https://tailwindcss.com/)
- **Ikon & Komponen:** [Lucide React](https://lucide.dev/), `clsx`, `tailwind-merge`
- **Data Layer & ORM:** [Prisma ORM](https://www.prisma.io/)
- **Database:** SQLite (default lokal out-of-the-box di `dev.db`), siap dikonfigurasi ke PostgreSQL / Supabase
- **Pengujian Otomatis:** [Vitest](https://vitest.dev/)
- **Bahasa:** TypeScript

---

## 4. Prasyarat Sistem (Prerequisites)
- [Node.js](https://nodejs.org/) versi 18.18.0 atau lebih baru (direkomendasikan Node.js 20+ atau 22+)
- `npm` (atau `pnpm` / `yarn`)

---

## 5. Panduan Instalasi (Installation)

1. **Clone atau buka direktori proyek:**
   ```bash
   cd "c:/proyek_pribadi/ANTYGRAVITY PROJEXT"
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

---

## 6. Konfigurasi Lingkungan (Environment Variables)
Salin berkas `.env.example` ke `.env`:

```env
# Penyimpanan lokal SQLite (siap pakai tanpa konfigurasi tambahan)
DATABASE_URL="file:./dev.db"

# Untuk PostgreSQL / Supabase di produksi:
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

NEXT_PUBLIC_APP_NAME="ArenaStats"
DEFAULT_WORKSPACE_SLUG="default"
```

---

## 7. Setup & Migrasi Database
Sinkronkan skema Prisma dan buat basis data lokal:

```bash
# Sinkronkan skema database
npx prisma db push

# Generate client Prisma
npx prisma generate

# Lakukan seeding data awal (Workspace, 4 Tim, Pemain, Season contoh)
npx prisma db seed
```

---

## 8. Menjalankan Aplikasi (Development)
Jalankan server pengembangan:

```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 9. Menjalankan Pengujian Otomatis (Testing)
ArenaStats dilengkapi dengan unit test dan integration test menyeluruh (termasuk verifikasi matematis Skenario Regresi PRD Bagian 12.4):

```bash
# Jalankan seluruh test suite
npm test
```

### Hasil Test Suite Terverifikasi:
- `tests/fixture.test.ts` (4 pengujian): Jumlah laga genap/ganjil ($n \times (n-1)/2$), rotasi bye, pencegahan laga melawan diri sendiri, pencegahan jadwal duplikat.
- `tests/standings.test.ts` (4 pengujian): Inisialisasi awal nilai nol, **Skenario Regresi PRD 12.4 (Alpha, Bravo, Charlie, Delta)**, penanganan laga tertunda/dibatalkan, kalkulasi dinamis koreksi skor.
- `tests/integration.test.ts` (7 pengujian): Alur lengkap dari pembuatan tim, pendaftaran peserta season, generasi jadwal, pencatatan hasil, verifikasi klasemen di database, koreksi skor dengan pencatatan `MatchResultRevision`, dan proteksi penghapusan tim.

---

## 10. Build Produksi (Production Build)
Untuk memverifikasi kompilasi dan membuat bundel produksi yang dioptimalkan:

```bash
npm run build
npm run start
```

---

## 11. Panduan Deployment (Vercel)
Aplikasi ini dioptimalkan untuk di-deploy ke **Vercel**:

1. Hubungkan repositori Git ke Vercel.
2. Pada pengaturan proyek Vercel, atur Environment Variables:
   - `DATABASE_URL`: Masukkan URL koneksi PostgreSQL Supabase / Neon / Railway Anda.
   - `NEXT_PUBLIC_APP_NAME`: `ArenaStats`
   - `DEFAULT_WORKSPACE_SLUG`: `default`
3. Jika menggunakan PostgreSQL pada Prisma, ubah `provider = "postgresql"` di `prisma/schema.prisma`.
4. Deploy!

---

## 12. Batasan Saat Ini (Known Limitations - MVP Scope)
Sesuai batasan PRD Bagian 11.2 untuk rilis MVP:
- Format jadwal otomatis saat ini difokuskan pada **Single Round Robin**.
- Sistem login multi-pengguna autentikasi eksternal (Supabase Auth) dipersiapkan untuk fase pasca-MVP publik.

---

## 13. Rencana Pengembangan Mendatang (Roadmap)
- Format Knockout Bracket (Single & Double Elimination).
- Sistem Swiss & Group Stage ke Playoff.
- Statistik individual pemain lanjutan (KDA, Goals, Assists, MVP of the Match).
- Public Read-Only Shareable URL dengan token akses.
#   a r e n a s t a t s  
 