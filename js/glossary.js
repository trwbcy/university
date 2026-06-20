/* =========================================================================
   GLOSARIUM — konten statis istilah UT.
   ========================================================================= */
(function () {
  "use strict";
  function entry(tag, term, def) {
    return '<div class="gentry"><span class="gtag">' + tag + '</span><div class="gterm">' + term + '</div><div class="gdef">' + def + '</div></div>';
  }
  function group(label, entries) { return '<div class="seclabel" style="margin:38px 0 4px;">' + label + '</div><div class="gloss-grid">' + entries + '</div>'; }

  var html = '<div class="page">'
    + '<div class="eyebrow">Kamus Istilah</div>'
    + '<div class="giant" style="font-size:78px; margin-top:10px;">GLOSARIUM<span class="accent">/UT</span></div>'
    + '<div class="hero-sub"><span class="rule"></span><span class="txt">Istilah-istilah penting di Universitas Terbuka yang wajib kamu paham sebagai mahasiswa baru — dari pola belajar sampai jenis ujian.</span></div>'
    + group('01 — Dasar',
        entry('Institusi', 'Universitas Terbuka (UT)', 'PTN yang menyelenggarakan pendidikan tinggi secara <strong>terbuka</strong> dan <strong>jarak jauh</strong>. "Terbuka" artinya tanpa batasan usia, tahun ijazah, atau masa belajar — dan tanpa tes masuk.')
      + entry('Sistem', 'PJJ — Pendidikan Jarak Jauh', 'Sistem belajar tanpa tatap muka rutin. Kamu belajar mandiri lewat modul, bahan digital, dan tutorial online sesuai ritmemu sendiri.')
      + entry('Prinsip', 'Belajar Mandiri', 'Inti kuliah di UT: kamu yang atur jadwal, target, dan disiplin belajarnya. Tutorial sifatnya membantu, bukan kelas harian.')
      + entry('Layanan', 'UT Daerah <span style="color:var(--mut); font-weight:500;">(dulu UPBJJ-UT)</span>', 'Kantor layanan UT di tiap wilayah. Tempat urusan administrasi, ujian, dan tutorial tatap muka kalau kamu ambil layanan itu.'))
    + group('02 — Pola Belajar',
        entry('Penting', 'SIPAS — Sistem Paket Semester', 'Mata kuliah sudah <strong>dipaketkan UT</strong> per semester, tinggal ambil paketnya. Cocok buat yang mau terstruktur dan nggak ribet milih MK sendiri.')
      + entry('Penting', 'Non-SIPAS', 'Kamu <strong>memilih &amp; meregistrasi mata kuliah sendiri</strong> tiap semester. Lebih fleksibel — bisa atur sendiri beban SKS sesuai waktumu.')
      + entry('Varian', 'SIPAS Non-TTM', 'Paket dengan layanan tutorial online (Tuton/Tuweb) saja, tanpa Tutorial Tatap Muka.')
      + entry('Varian', 'SIPAS Semi &amp; Penuh', 'Semi = TTM untuk sebagian mata kuliah; Penuh = TTM untuk seluruh mata kuliah dalam paket. Pilih sesuai kebutuhan bimbingan langsung.'))
    + group('03 — Tutorial &amp; Ujian',
        entry('Tutorial', 'Tuton — Tutorial Online', 'Tutorial lewat LMS (elearning.ut.ac.id), biasanya 8 sesi. Ada materi, diskusi, dan 3 tugas yang ikut menyumbang nilai akhir.')
      + entry('Tutorial', 'Tuweb — Tutorial Webinar', 'Tutorial online <strong>langsung (live)</strong> lewat video conference. Mirip kelas online tatap muka secara virtual.')
      + entry('Tutorial', 'TTM — Tutorial Tatap Muka', 'Ketemu tutor secara langsung di lokasi yang ditentukan UT Daerah. Tersedia kalau kamu ambil layanan yang menyertakannya.')
      + entry('Ujian', 'UAS · UO · THE', 'UAS = Ujian Akhir Semester. Bisa berupa UO (UAS Online) atau <strong>THE</strong> (Take Home Exam) — ujian yang dikerjakan dari rumah dalam batas waktu tertentu.'))
    + group('04 — Istilah Lain',
        entry('Bahan Ajar', 'BMP / Modul', 'Buku Materi Pokok — bahan ajar utama UT, tersedia cetak maupun digital. Ini "buku pegangan" tiap mata kuliah.')
      + entry('Administrasi', 'LIP — Lembar Informasi Pembayaran', 'Dokumen berisi kode &amp; nominal untuk membayar uang kuliah tiap semester lewat bank/e-channel.')
      + entry('Akademik', 'SIA — Sistem Informasi Akademik', 'Portal online tempat registrasi mata kuliah, lihat nilai, dan urus administrasi akademikmu.')
      + entry('Syarat Lulus', 'Karil &amp; TAP', 'Karil = Karya Ilmiah; TAP = Tugas Akhir Program. Keduanya jadi syarat di tahap akhir sebelum kamu dinyatakan lulus.')
      + entry('Orientasi', 'OSMB &amp; PKBJJ', 'OSMB = Orientasi Studi Mahasiswa Baru; PKBJJ = Pelatihan Keterampilan Belajar Jarak Jauh. Bekal awal biar nggak bingung sistem UT.')
      + entry('Akademik', 'SKS &amp; Masa Registrasi', 'SKS = Satuan Kredit Semester, ukuran beban mata kuliah. Tiap tahun ada 2 semester (ganjil/genap) dengan masa registrasi tersendiri.'))
    + '</div>';

  window.GLOSS_HTML = html;
})();
