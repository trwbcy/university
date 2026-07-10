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
    },
    {
      url: 'https://sl.ut.ac.id/pengayaan', nama: 'BANC Pengayaan',
      fungsi: 'Akses Bahan Ajar Non Cetak (BANC) — materi multimedia pelengkap modul cetak untuk mata kuliah bertanda #.',
      kategori: 'Akademik — Pendukung', kat: 'pendukung',
      prioritas: 'Sesuai kebutuhan saat belajar matkul bertanda #', prio: 'med'
    },
    {
      url: 'https://hallo-ut.ut.ac.id', nama: 'Hallo UT',
      fungsi: 'Contact center resmi UT — lapor kendala teknis, tanya administrasi, dan tracking masalah registrasi / bahan ajar.',
      kategori: 'Bantuan / Support', kat: 'bantuan',
      prioritas: 'Saat ada kendala', prio: 'med'
    }
  ];

  function katBadge(p) { return '<span class="pt-badge kat-' + p.kat + '">' + esc(p.kategori) + '</span>'; }
  function prioBadge(p) { return '<span class="pt-badge prio-' + p.prio + '">' + esc(p.prioritas) + '</span>'; }

  /* satu kontak yang bisa diklik (tel/wa/sms/mailto) */
  function contact(href, label, val, hint) {
    return '<a class="ptc-item" href="' + escA(href) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>'
      + '<span class="ptc-label">' + esc(label) + '</span>'
      + '<span class="ptc-val">' + esc(val) + '</span>'
      + (hint ? '<span class="ptc-hint">' + esc(hint) + '</span>' : '')
      + '</a>';
  }

  /* section "Kalau Ada Kendala" — kontak Hallo UT */
  function contactSection() {
    var hours = [
      ['Senin–Kamis', '08.00–19.30 WIB'],
      ['Jumat', '08.00–20.00 WIB'],
      ['Sabtu–Minggu', '09.00–14.00 WIB'],
      ['Libur Nasional', 'situasional — cek info terbaru']
    ].map(function (h) {
      return '<li><span class="ptc-day">' + esc(h[0]) + '</span><span class="ptc-time">' + esc(h[1]) + '</span></li>';
    }).join('');

    return '<div class="ptc reveal">'
      + '<div class="ptc-eyebrow">Bantuan Resmi</div>'
      + '<h3 class="ptc-title">Kalau Ada Kendala</h3>'
      + '<p class="ptc-sub">Hubungi <strong>Hallo UT</strong>, contact center resmi Universitas Terbuka — untuk kendala teknis, pertanyaan administrasi, sampai masalah registrasi dan bahan ajar.</p>'
      + '<div class="ptc-grid">'
      + contact('tel:1500024', 'Telepon', '1500024', 'Tambah 021 di depan bila perlu · +6221 dari luar negeri')
      + contact('https://wa.me/6281141500024', 'WhatsApp', '0811 4150 0024', 'Chat langsung via WhatsApp')
      + contact('sms:08119050024', 'SMS', '0811 905 0024', '')
      + contact('mailto:hallo-ut@ecampus.ut.ac.id', 'Email', 'hallo-ut@ecampus.ut.ac.id', '')
      + '</div>'
      + '<div class="ptc-hours"><span class="ptc-label">Jam Operasional</span><ul>' + hours + '</ul></div>'
      + '</div>';
  }

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
    + contactSection()
    + '</div>';

  window.PORTAL_HTML = html;
})();
