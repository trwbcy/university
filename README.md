# Workspace Kuliah Universitas Terbuka

Workspace pribadi untuk menjalani kuliah **Sistem Informasi** di Universitas Terbuka, dibangun dengan pendekatan editorial: tipografi besar, banyak ruang kosong, satu aksen warna. Bukan template umum, melainkan alat yang dirancang untuk satu orang menjalani satu perjalanan kuliah selama empat tahun.

## Kenapa ada repo ini

Kuliah jarak jauh di UT menuntut mahasiswa mengatur dirinya sendiri: memilih mata kuliah, menjaga ritme Tuton, mengingat tenggat tugas, dan mengelola biaya per semester tanpa kelas harian yang menertibkan. Catatan yang berserakan di banyak aplikasi membuat hal ini lebih berat.

Repo ini menyatukan semuanya dalam satu halaman: jadwal mingguan, daftar tugas, catatan keuangan, dan glosarium istilah UT. Yang membedakannya dari catatan biasa adalah **dimensi semester** — setiap data terikat ke semesternya, sehingga ketika maju ke semester berikutnya, jejak semester sebelumnya tidak hilang. Tab Riwayat menyimpan rekam jejak tiap semester yang sudah dilewati: IPK, tugas yang diselesaikan, total pengeluaran, dan daftar mata kuliah.

Tujuannya sederhana: satu tempat yang tetap relevan dari semester pertama sampai wisuda.

## Apa isinya

- **Hari ini** — ringkasan semester aktif, sesi belajar hari ini, tenggat terdekat
- **Jadwal** — jadwal mingguan Tuton, Tuweb, dan TTM
- **Tugas** — daftar tugas dengan penanda tenggat dan arsip yang sudah selesai
- **Uang** — anggaran dan pengeluaran per semester
- **Riwayat** — rekam jejak setiap semester yang sudah dilewati
- **Glosarium UT** — kamus istilah Universitas Terbuka untuk mahasiswa baru

## Cara kerjanya

Aplikasi web statis murni (HTML, CSS, JavaScript tanpa framework). Data disimpan di **Supabase** sehingga bisa diakses dari perangkat mana pun setelah masuk, dengan tiap pengguna hanya bisa mengakses datanya sendiri.

Arsitekturnya sengaja dipisah berlapis: `store.js` menjadi satu-satunya pintu data, `ui.js` murni menangani tampilan, dan `app.js` mengikat keduanya. Pemisahan ini membuat tiap bagian bisa diubah tanpa mengganggu yang lain.

```
studio-si/
├── index.html      kerangka halaman
├── css/style.css   gaya editorial (tokens + komponen)
├── js/
│   ├── store.js    lapisan data (lokal + cloud)
│   ├── ui.js       render tampilan
│   ├── app.js      controller
│   ├── glossary.js konten glosarium
│   └── config.js   konfigurasi koneksi
└── sql/            skema database + keamanan
```

## Dibangun untuk

Satu mahasiswa, satu gelar, empat tahun. Dirawat seiring perjalanan kuliah berjalan.