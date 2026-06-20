# TRWBCY / Sistem Informasi — Workspace Kuliah

Workspace editorial untuk kuliah Sistem Informasi di Universitas Terbuka.
Jadwal, tugas, uang, dan **riwayat belajar lintas semester** dalam satu halaman.
Data tersimpan di **cloud (Supabase)** sehingga bisa dibuka dari perangkat mana pun.

## Struktur file

```
studio-si/
├── index.html          # kerangka halaman
├── css/
│   └── style.css       # seluruh gaya (design tokens + komponen)
├── js/
│   ├── config.js       # ← TEMPAT ISI KREDENSIAL SUPABASE
│   ├── store.js        # lapisan data (lokal + cloud, satu antarmuka)
│   ├── ui.js           # render tampilan
│   ├── glossary.js     # konten glosarium statis
│   └── app.js          # controller (state, aksi, auth)
└── sql/
    └── schema.sql      # skema database + keamanan (RLS)
```

Pemisahan ini disengaja: kalau nanti mau ganti cara simpan data, cukup sentuh `store.js`. File lain tidak perlu diubah.

---

## Cara setup (sekali, ~10 menit)

### 1. Buat project Supabase
1. Daftar gratis di https://supabase.com
2. Klik **New project**. Beri nama (misal `studio-si`), set password database, pilih region terdekat (Singapore).
3. Tunggu project selesai dibuat (~2 menit).

### 2. Jalankan SQL
1. Di dashboard Supabase, buka menu **SQL Editor** > **New query**.
2. Buka file `sql/schema.sql`, salin **seluruh isinya**, tempel ke editor.
3. Klik **Run**. Kalau muncul "Success", tabel + keamanan sudah jadi.

### 3. Ambil kredensial
1. Buka **Project Settings** (ikon gerigi) > **API**.
2. Salin dua nilai:
   - **Project URL** (contoh `https://abcdxyz.supabase.co`)
   - **anon public** key (string panjang diawali `eyJ...`)

### 4. Isi config
Buka `js/config.js`, tempel kedua nilai:

```js
window.SUPABASE_CONFIG = {
  url: 'https://abcdxyz.supabase.co',
  anonKey: 'eyJhbGci...'
};
```

Selesai. Buka `index.html`, kamu akan diminta **daftar/masuk**. Setelah masuk, data awal otomatis dibuat dan tersimpan di cloud.

> Catatan keamanan: anon key memang untuk dipakai di browser dan aman dipublikasikan. Datamu dilindungi oleh Row Level Security — tiap pengguna hanya bisa mengakses datanya sendiri.

---

## Menjalankan & hosting

**Lokal:** buka `index.html` langsung di browser. (Untuk auth cloud, sebagian browser butuh dijalankan lewat server lokal — jalankan `python3 -m http.server` di folder ini lalu buka `http://localhost:8000`.)

**Online gratis (GitHub Pages):**
1. Buat repo, push seluruh folder ini.
2. Settings > Pages > Source: branch `main`, folder `/root`.
3. Situsmu live di `https://<username>.github.io/<repo>/`.

---

## Mode tanpa Supabase

Kalau `js/config.js` dibiarkan kosong, aplikasi tetap jalan penuh dalam **mode lokal** (localStorage). Cocok untuk coba-coba. Tapi data hanya ada di satu browser — pakai **Ekspor backup** secara berkala. Begitu config diisi, otomatis pindah ke mode cloud.

---

## Fitur

- **Hari ini** — hero semester aktif, statistik, sesi hari ini, deadline terdekat
- **Jadwal** — jadwal sepekan, bisa tambah/edit/hapus sesi
- **Tugas** — daftar tugas + arsip selesai, tandai selesai sekali klik
- **Uang** — budget per semester, transaksi, rekap per kategori
- **Riwayat** — ringkasan tiap semester yang sudah lewat (IPK, tugas, pengeluaran, daftar MK). Jejak belajar tidak hilang saat maju semester.
- **Glosarium UT** — kamus istilah penting

Ganti semester lewat baris chip di atas. Tombol **+ Semester** membuat semester baru; semester lama otomatis jadi riwayat.
