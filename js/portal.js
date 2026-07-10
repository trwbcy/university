/* =========================================================================
   PORTAL UT — konten statis: daftar portal/subdomain resmi Universitas
   Terbuka. Tiap baris bisa diklik untuk membuka portal di tab baru.
   Mengikuti pola tab statis (lihat glossary.js): mengekspor satu string
   HTML ke window.PORTAL_HTML, dirender oleh app.js.
   ========================================================================= */
(function () {
  "use strict";

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }
  function domain(url) { return url.replace(/^https?:\/\//, '').replace(/\/$/, ''); }

  /* kategori & prioritas memetakan ke kelas badge (warna) di style.css */
  var PORTALS = [
    {
      url: 'https://myut.ut.ac.id', nama: 'MyUT',
      fungsi: 'Portal utama mahasiswa (SSO) — registrasi mata kuliah, cek nilai, jadwal ujian, pembayaran, lokasi &amp; tanggal ujian.',
      kategori: 'Akademik — Inti', kat: 'inti',
      prioritas: 'Harian / Sering', prio: 'high'
    },
    {
      url: 'https://elearning.ut.ac.id', nama: 'Elearning (Tuton)',
      fungsi: 'Tutorial Online — diskusi, tugas tutorial, dan materi per mata kuliah.',
      kategori: 'Akademik — Inti', kat: 'inti',
      prioritas: 'Harian / Sering saat semester berjalan', prio: 'high'
    },
    {
      url: 'https://pustaka.ut.ac.id', nama: 'Perpustakaan Digital',
      fungsi: 'Akses BMP (Buku Materi Pokok) / modul dan e-book referensi belajar.',
      kategori: 'Akademik — Pendukung', kat: 'pendukung',
      prioritas: 'Sesuai kebutuhan', prio: 'med'
    },
    {
      url: 'https://www.ut.ac.id', nama: 'Website Resmi UT',
      fungsi: 'Berita, kalender akademik, unduh formulir, dan info umum kampus.',
      kategori: 'Informasi Umum', kat: 'umum',
      prioritas: 'Sesekali', prio: 'low'
    },
    {
      url: 'https://admisi-sia.ut.ac.id', nama: 'Admisi SIA',
      fungsi: 'Pendaftaran &amp; data pribadi calon mahasiswa baru (sebelum punya NIM).',
      kategori: 'Admisi', kat: 'admisi',
      prioritas: 'Sudah tidak relevan', prio: 'none'
    },
    {
      url: 'https://kemahasiswaan.ut.ac.id', nama: 'Kemahasiswaan',
      fungsi: 'Info kegiatan kemahasiswaan, organisasi, UKM, dan event kampus.',
      kategori: 'Non-Akademik', kat: 'non',
      prioritas: 'Opsional', prio: 'low'
    },
    {
      url: 'https://aksi.ut.ac.id', nama: 'AKSI',
      fungsi: 'Yudisium dan proses kelulusan.',
      kategori: 'Akademik — Akhir Studi', kat: 'akhir',
      prioritas: 'Baru relevan di semester akhir', prio: 'future'
    },
    {
      url: 'https://moocs.ut.ac.id', nama: 'MOOCs UT',
      fungsi: 'Kursus daring gratis / pengayaan.',
      kategori: 'Non-Akademik', kat: 'non',
      prioritas: 'Opsional', prio: 'low'
    },
    {
      url: 'https://siera.ut.ac.id', nama: 'SIERA',
      fungsi: 'Pembimbingan tesis / disertasi (S2 / S3).',
      kategori: 'Akademik — Pascasarjana', kat: 'pasca',
      prioritas: 'Tidak relevan (S1)', prio: 'none'
    },
    {
      url: 'https://praktik.ut.ac.id', nama: 'Praktik / Praktikum',
      fungsi: 'Portal untuk mata kuliah berpraktikum.',
      kategori: 'Akademik — Pendukung', kat: 'pendukung',
      prioritas: 'Sesuai kebutuhan', prio: 'med'
    }
  ];

  function katBadge(p) { return '<span class="pt-badge kat-' + p.kat + '">' + esc(p.kategori) + '</span>'; }
  function prioBadge(p) { return '<span class="pt-badge prio-' + p.prio + '">' + esc(p.prioritas) + '</span>'; }

  var rows = PORTALS.map(function (p) {
    var open = "window.open('" + escA(p.url) + "','_blank','noopener,noreferrer')";
    return '<tr class="pt-row" role="link" tabindex="0"'
      + ' onclick="' + open + '"'
      + ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();' + open + ';}"'
      + ' title="Buka ' + escA(domain(p.url)) + ' di tab baru">'
      + '<td data-label="Link"><span class="pt-link">' + esc(domain(p.url)) + ' <span class="pt-ext" aria-hidden="true">↗</span></span></td>'
      + '<td data-label="Nama"><span class="pt-nama">' + esc(p.nama) + '</span></td>'
      + '<td data-label="Fungsi"><span class="pt-fungsi">' + p.fungsi + '</span></td>'
      + '<td data-label="Kategori">' + katBadge(p) + '</td>'
      + '<td data-label="Prioritas">' + prioBadge(p) + '</td>'
      + '</tr>';
  }).join('');

  var html = '<div class="page">'
    + '<div class="eyebrow">Peta Portal</div>'
    + '<div class="giant" style="font-size:78px; margin-top:10px;">PORTAL<span class="accent">/UT</span></div>'
    + '<div class="hero-sub"><span class="rule"></span><span class="txt">Semua subdomain resmi Universitas Terbuka di satu tempat — mana yang dipakai harian, mana yang baru relevan nanti. Klik satu baris untuk membukanya di tab baru.</span></div>'
    + '<div class="pt-scroll">'
    + '<table class="pt-table">'
    + '<thead><tr><th>Link</th><th>Nama</th><th>Fungsi</th><th>Kategori</th><th>Prioritas</th></tr></thead>'
    + '<tbody>' + rows + '</tbody>'
    + '</table>'
    + '</div>'
    + '<p class="pt-note">Prioritas adalah panduan umum untuk mahasiswa S1 Sistem Informasi — sesuaikan dengan tahap studimu sendiri.</p>'
    + '</div>';

  window.PORTAL_HTML = html;
})();
