/* =========================================================================
   KURIKULUM — paket arahan per semester, Program Studi 252 / Sistem
   Informasi (S1), Katalog Kurikulum FST UT 2026/2027 (hal. 247–250).

   Tiap baris: no, kode, nama, sks, ujian (waktu ujian), ket (kolom II).
   Baris "pilihan" berarti mahasiswa memilih salah satu dari options.
   Total 145 sks: 17 · 18 · 21 · 19 · 20 · 20 · 17 · 13
   ========================================================================= */

(function () {
  "use strict";

  window.KURIKULUM = {
    prodi: '252 / Sistem Informasi (S1)',
    fakultas: 'Fakultas Sains dan Teknologi',
    katalog: 'Katalog Kurikulum FST UT 2026/2027',
    totalSks: 145,

    /* legenda kolom Ket */
    legenda: [
      ['WT', 'Wajib tuton untuk layanan SIPAS PENUH dan SIPAS PLUS'],
      ['BP', 'Mata kuliah berpraktik'],
      ['BPro', 'Mata kuliah berpraktik wajib bimbingan online'],
      ['P', 'Mata kuliah praktik'],
      ['Pro', 'Mata kuliah praktik wajib bimbingan online'],
      ['99', 'Tanpa UAS — nilai penuh dari laporan praktik atau proposal penelitian']
    ],

    /* prasyarat Tugas Akhir Program Sarjana */
    taps: [
      'STSI4105 — Basis Data',
      'STSI4207 — Sistem Informasi Manajemen',
      'STSI4208 — Analisis dan Perancangan Sistem',
      'STSI4202 — Rekayasa Perangkat Lunak',
      'STSI4310 — Metodologi Penelitian'
    ],

    semesters: [
      {
        n: 1, sks: 17, items: [
          { no: 1, code: 'STSI4101', name: 'Pengantar Sistem Informasi', sks: 3, ujian: 'I.1', ket: 'WT' },
          { no: 2, code: 'STSI4103', name: 'Sistem Operasi', sks: 3, ujian: 'I.4', ket: '' },
          {
            no: 3, name: 'Pendidikan Agama', sks: 3, ujian: 'I.5', ket: '',
            pilihLabel: 'Pilih salah satu sesuai data pribadi',
            options: [
              { code: 'MKWN4101', name: 'Pendidikan Agama Islam' },
              { code: 'MKWN4102', name: 'Pendidikan Agama Katolik' },
              { code: 'MKWN4103', name: 'Pendidikan Agama Kristen' },
              { code: 'MKWN4104', name: 'Pendidikan Agama Buddha' },
              { code: 'MKWN4105', name: 'Pendidikan Agama Hindu' },
              { code: 'MKWN4107', name: 'Pendidikan Agama Khonghucu' }
            ]
          },
          { no: 4, code: 'STSI4102', name: 'Algoritma dan Pemrograman', sks: 3, ujian: 'II.1', ket: 'BP · BPro' },
          { no: 5, code: 'STMA4112', name: 'Matematika Dasar', sks: 3, ujian: 'II.3', ket: '' },
          { no: 6, code: 'MKWN4109', name: 'Pendidikan Kewarganegaraan', sks: 2, ujian: 'II.4', ket: '' }
        ]
      },
      {
        n: 2, sks: 18, items: [
          { no: 7, code: 'STSI4105', name: 'Basis Data', sks: 3, ujian: 'I.1', ket: 'BP · BPro' },
          { no: 8, code: 'STSI4104', name: 'Struktur Data', sks: 3, ujian: 'I.2', ket: 'BP · BPro' },
          { no: 9, code: 'MKKI4201', name: 'Pengantar Statistika', sks: 3, ujian: 'II.1', ket: '' },
          { no: 10, code: 'MKDI4201', name: 'Bahasa Inggris', sks: 3, ujian: 'II.2', ket: 'WT' },
          { no: 11, code: 'MKWN4108', name: 'Bahasa Indonesia', sks: 2, ujian: 'I.3', ket: '' },
          { no: 12, code: 'MKWN4110', name: 'Pancasila', sks: 2, ujian: 'I.3', ket: '' },
          { no: 13, code: 'STMA4113', name: 'Aljabar Linear Elementer', sks: 2, ujian: 'II.4', ket: '' }
        ]
      },
      {
        n: 3, sks: 21, items: [
          { no: 14, code: 'STIK4111', name: 'Dasar Pemrograman R', sks: 3, ujian: 'I.1', ket: '' },
          { no: 15, code: 'STSI4106', name: 'Logika Informatika', sks: 3, ujian: 'I.3', ket: '' },
          { no: 16, code: 'STSI4201', name: 'Pemrograman Berbasis Desktop', sks: 3, ujian: 'I.2', ket: 'BP · BPro' },
          { no: 17, code: 'STSI4203', name: 'Interaksi Manusia dan Komputer', sks: 3, ujian: 'I.5', ket: '' },
          { no: 18, code: 'STSI4202', name: 'Rekayasa Perangkat Lunak', sks: 3, ujian: 'II.1', ket: '' },
          { no: 19, code: 'STSI4205', name: 'Jaringan Komputer', sks: 3, ujian: 'I.4', ket: 'BP · BPro' },
          { no: 20, code: 'MKDI4202', name: 'Belajar di Era Digital', sks: 3, ujian: 'II.5', ket: 'WT' }
        ]
      },
      {
        n: 4, sks: 19, items: [
          { no: 21, code: 'MKDI4203', name: 'Kewirausahaan di Era Digital', sks: 3, ujian: 'I.1', ket: 'WT' },
          { no: 22, code: 'STSI4204', name: 'Analisis dan Visualisasi Data', sks: 2, ujian: 'I.3', ket: 'BP · BPro' },
          { no: 23, code: 'STSI4208', name: 'Analisis dan Perancangan Sistem', sks: 3, ujian: 'I.4', ket: '' },
          { no: 24, code: 'STSI4209', name: 'Pemrograman Berbasis Web', sks: 3, ujian: 'II.1', ket: 'BP · BPro' },
          { no: 25, code: 'STSI4206', name: 'Proses Bisnis', sks: 2, ujian: 'II.2', ket: '' },
          { no: 26, code: 'STSI4207', name: 'Sistem Informasi Manajemen', sks: 3, ujian: 'II.4', ket: '' },
          { no: 27, code: 'EMBS4207', name: 'Perilaku Organisasi', sks: 3, ujian: 'II.3', ket: '' }
        ]
      },
      {
        n: 5, sks: 20, items: [
          { no: 28, code: 'FSSI4101', name: 'Basic Reading', sks: 3, ujian: 'I.1', ket: '' },
          { no: 29, code: 'STMA4111', name: 'Kalkulus Diferensial', sks: 3, ujian: 'I.2', ket: 'WT' },
          { no: 30, code: 'EMBS4102', name: 'Pengantar Bisnis', sks: 3, ujian: 'I.4', ket: '' },
          {
            no: 31, name: 'Mata kuliah pilihan', sks: 3, ujian: 'II.1', ket: '',
            pilihLabel: 'Pilih satu dari mata kuliah pilihan yang tersedia',
            options: [
              { code: 'STSI4301', name: 'Sistem Pendukung Keputusan', ket: '' },
              { code: 'STSI4302', name: 'Administrasi Server', ket: 'BP · BPro' }
            ]
          },
          { no: 32, code: 'FSAP4102', name: 'Teori Organisasi', sks: 3, ujian: 'II.3', ket: '' },
          { no: 33, code: 'STSI4303', name: 'Pemrograman Berbasis Perangkat Bergerak', sks: 3, ujian: 'II.4', ket: 'BP · BPro' },
          { no: 34, code: 'STSI4308', name: 'Komunikasi Bisnis dan Teknis', sks: 2, ujian: 'II.2', ket: '' }
        ]
      },
      {
        n: 6, sks: 20, items: [
          {
            no: 35, name: 'Mata kuliah pilihan', sks: 3, ujian: 'I.1', ket: '',
            pilihLabel: 'Pilih satu dari mata kuliah pilihan yang tersedia',
            options: [
              { code: 'STSI4307', name: 'Data Mining', ket: '' },
              { code: 'STSI4309', name: 'Administrasi Jaringan', ket: 'BP · BPro' }
            ]
          },
          { no: 36, code: 'STSI4306', name: 'Arsitektur dan Perancangan Sistem Enterprise', sks: 3, ujian: 'I.3', ket: '' },
          { no: 37, code: 'STSI4305', name: 'Etika Profesi', sks: 2, ujian: 'I.4', ket: '' },
          {
            no: 38, name: 'Mata kuliah pilihan', sks: 3, ujian: 'I.2', ket: '',
            pilihLabel: 'Pilih satu dari mata kuliah pilihan yang tersedia',
            options: [
              { code: 'STPL4211', name: 'Sistem Informasi Perencanaan', ket: '' },
              { code: 'MKKI4301', name: 'Pemberdayaan Masyarakat', ket: 'P' }
            ]
          },
          { no: 39, code: 'STSI4304', name: 'Dasar Infrastruktur TI', sks: 2, ujian: 'II.2', ket: 'WT' },
          { no: 40, code: 'STSI4310', name: 'Metodologi Penelitian', sks: 3, ujian: '99', ket: 'P · Pro' },
          { no: 41, code: 'EMBS4101', name: 'Manajemen', sks: 4, ujian: 'II.5', ket: '' }
        ]
      },
      {
        n: 7, sks: 17, items: [
          {
            no: 42, name: 'Mata kuliah pilihan', sks: 3, ujian: 'I.1', ket: '',
            pilihLabel: 'Pilih satu dari mata kuliah pilihan yang tersedia',
            options: [
              { code: 'STSI4409', name: 'Data Warehouse', ket: '' },
              { code: 'STSI4404', name: 'Keamanan Jaringan', ket: 'BP · BPro' }
            ]
          },
          { no: 43, code: 'STDA4101', name: 'Pengantar Sains Data', sks: 3, ujian: 'I.3', ket: 'WT' },
          { no: 44, code: 'STSI4403', name: 'Manajemen Risiko dan Audit Sistem Informasi', sks: 3, ujian: 'II.4', ket: '' },
          { no: 45, code: 'STSI4402', name: 'Tata Kelola Teknologi Informasi', sks: 2, ujian: 'II.5', ket: '' },
          { no: 46, code: 'STSI4440', name: 'Capstone Project (TAPS)', sks: 6, ujian: '99', ket: 'P · Pro' }
        ]
      },
      {
        n: 8, sks: 13, items: [
          { no: 47, code: 'STSI4406', name: 'Manajemen Proyek Sistem Informasi', sks: 2, ujian: 'I.1', ket: 'WT' },
          { no: 48, code: 'STSI4405', name: 'Keamanan Sistem Informasi', sks: 2, ujian: 'I.4', ket: '' },
          { no: 49, code: 'STSI4407', name: 'Manajemen Layanan Teknologi Informasi', sks: 3, ujian: 'II.1', ket: '' },
          { no: 50, code: 'STSI4408', name: 'E-Bisnis', sks: 3, ujian: 'II.5', ket: '' },
          { no: 51, code: 'EACC4207', name: 'Sistem Informasi Akuntansi', sks: 3, ujian: 'I.3', ket: '' }
        ]
      }
    ]
  };
})();
