/* =========================================================================
   UI — lapisan tampilan murni. Menerima "view model" (v) hasil derive,
   mengembalikan string HTML. Tidak menyentuh penyimpanan langsung.
   ========================================================================= */

(function () {
  "use strict";

  var DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var SM = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function rupiah(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID'); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function fmt(iso) { if (!iso) return ''; var d = new Date(iso + 'T00:00:00'); return d.getDate() + ' ' + SM[d.getMonth()]; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escA(s) { return esc(s).replace(/"/g, '&quot;'); }

  var UI = { DAYS: DAYS, MONTHS: MONTHS, SM: SM, rupiah: rupiah, pad: pad, fmt: fmt, esc: esc, escA: escA };

  /* ---- NAV ---- */
  UI.nav = function (tab) {
    var tabs = [['today', 'Hari ini'], ['jadwal', 'Jadwal'], ['tugas', 'Tugas'], ['uang', 'Uang'], ['riwayat', 'Riwayat'], ['gloss', 'Glosarium UT']];
    return tabs.map(function (t) {
      return '<button class="navword ' + (tab === t[0] ? 'active' : '') + '" onclick="App.go(\'' + t[0] + '\')">' + t[1] + '</button>';
    }).join('');
  };

  /* ---- SEMESTER SWITCHER ---- */
  UI.sembar = function (semesters, activeId) {
    var chips = semesters.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }).map(function (s) {
      return '<button class="semchip ' + (s.id === activeId ? 'active' : '') + '" onclick="App.switchSemester(\'' + s.id + '\')">' + esc(s.code) + ' · ' + esc(s.title) + '</button>';
    }).join('');
    return chips + '<button class="semchip add" onclick="App.addSemester()">+ Semester</button>';
  };

  /* ---- HARI INI ---- */
  UI.today = function (v) {
    var sem = v.sem;
    var sessions = v.sessions.map(function (s) {
      return '<div class="row"><span class="row-time">' + esc(s.time) + '</span><span class="row-title" style="font-size:24px;">' + esc(s.label) + '</span><span class="metapill">' + esc(s.meta) + '</span></div>';
    }).join('');
    var deadlines = v.tasksView.map(function (t) {
      return '<div class="row"><span class="row-title">' + esc(t.title) + '</span><span class="row-sub fixed-w" style="width:240px;">' + esc(t.course) + '</span><span class="tpill ' + t.tone + '">' + esc(t.when) + '</span></div>';
    }).join('') || '<div class="empty">Tidak ada deadline terdekat. Nikmati jeda ini.</div>';

    return '<div class="page page-today">'
      + '<div class="hero-wrap">'
      + '  <div class="hero-left">'
      + '    <div class="ghost-num">' + esc(sem.code) + '</div>'
      + '    <div class="hero-title">' + esc(heroLine1(sem.title)) + '<span class="accent">.</span></div>'
      + '    <div class="hero-sub"><span class="rule"></span><span class="txt">Sistem Informasi · Universitas Terbuka — ' + esc(sem.sks) + ' SKS, ' + v.courseCount + ' mata kuliah, satu tujuan yang dijaga pelan-pelan.</span></div>'
      + '  </div>'
      + '  <div class="hero-chibi"><img src="assets/chibi.png" alt="Ilustrasi mahasiswa sedang belajar" loading="lazy"></div>'
      + '</div>'
      + '<div class="mantra reveal">'
      + '  <span class="mantra-mark">"</span>'
      + '  <p class="mantra-text">' + esc(v.mantra) + '</p>'
      + '  <button class="mantra-next" onclick="App.nextMantra()" title="Mantra berikutnya">ganti →</button>'
      + '</div>'
      + '<div class="stats reveal">'
      + stat(sem.ipk != null ? sem.ipk.toFixed(2) : '—', 'Target / IPK')
      + stat(pad(v.doneCount), 'Tugas Selesai')
      + stat(pad(v.aktif), 'Tugas Aktif', true)
      + '</div>'
      + '<div class="section reveal"><div class="section-head"><div class="seclabel">Sesi Belajar — ' + esc(v.todayName) + '</div><div class="row-sub">' + esc(v.todayDate) + '</div></div>' + sessions + '</div>'
      + '<div class="section reveal"><div class="seclabel" style="margin-bottom:18px;">Deadline Terdekat</div>' + deadlines + '</div>'
      + '</div>';
  };
  function heroLine1(title) { return title.toUpperCase(); }
  function stat(num, label, accent) {
    return '<div class="stat"><div class="stat-num' + (accent ? ' accent' : '') + '">' + esc(num) + '</div><div class="stat-label">' + esc(label) + '</div></div>';
  }

  /* ---- JADWAL ---- */
  UI.jadwal = function (v, draftHtml) {
    var rows = v.jadwal.map(function (day) {
      var items = day.items.map(function (it) {
        return '<div style="display:flex; align-items:center; gap:16px; padding:9px 0;">'
          + '<span style="font-family:var(--display); font-weight:700; font-size:18px; width:64px;">' + esc(it.time) + '</span>'
          + '<span style="font-size:18px; font-weight:600; flex:1;">' + esc(it.course) + '</span>'
          + '<span class="typetag">' + esc(it.type) + '</span>'
          + '<span class="row-sub" style="width:80px; text-align:right;">' + esc(it.meta) + '</span>'
          + '<button class="iconbtn" onclick="App.editSession(\'' + it.id + '\')">Edit</button>'
          + '<button class="iconbtn" onclick="App.deleteSession(\'' + it.id + '\')">✕</button></div>';
      }).join('');
      if (day.empty) items = '<div class="empty">Tidak ada sesi · belajar mandiri</div>';
      return '<div style="display:grid; grid-template-columns:210px 1fr; gap:24px; padding:22px 0; border-top:1px solid var(--line);">'
        + '<div><div class="giant" style="font-size:28px; ' + (day.isToday ? 'color:var(--accent);' : '') + '">' + esc(day.dayName) + '</div>'
        + (day.isToday ? '<div style="font:800 10px/1 var(--body); letter-spacing:.14em; text-transform:uppercase; color:var(--accent); margin-top:8px;">● Hari ini</div>' : '')
        + '</div><div>' + items + '</div></div>';
    }).join('');
    return '<div class="page">' + pageHead('Minggu Ini', 'JADWAL', 'App.add(\'session\')', '+ Tambah sesi') + (draftHtml || '') + UI.timelineSVG() + '<div style="margin-top:12px;">' + rows + '</div>' + UI.paket(v.semNo) + '</div>';
  };

  /* ---- PAKET ARAHAN PER SEMESTER (kurikulum prodi) ---- */
  UI.paket = function (activeSemNo) {
    var K = window.KURIKULUM;
    if (!K) return '';

    var chips = K.semesters.map(function (s) {
      return '<div class="pk-chip' + (s.n === activeSemNo ? ' now' : '') + '"><span class="n">' + s.n + '</span><span class="s">' + s.sks + ' sks</span></div>';
    }).join('');

    var blocks = K.semesters.map(function (s) {
      var isNow = s.n === activeSemNo;
      var rows = s.items.map(function (it) {
        var name, sub = '';
        if (it.options) {
          name = '<span class="pk-pilih">' + esc(it.pilihLabel) + '</span>';
          sub = '<ul class="pk-opts">' + it.options.map(function (o) {
            return '<li><span class="pk-code">' + esc(o.code) + '</span> ' + esc(o.name) + (o.ket ? ' <span class="pk-ket">' + esc(o.ket) + '</span>' : '') + '</li>';
          }).join('') + '</ul>';
        } else {
          name = esc(it.name);
        }
        return '<tr>'
          + '<td class="pk-no">' + it.no + '</td>'
          + '<td class="pk-code">' + esc(it.code || '—') + '</td>'
          + '<td class="pk-name">' + name + sub + '</td>'
          + '<td class="pk-sks">' + it.sks + '</td>'
          + '<td class="pk-ujian">' + esc(it.ujian) + '</td>'
          + '<td>' + (it.ket ? '<span class="pk-ket">' + esc(it.ket) + '</span>' : '') + '</td>'
          + '</tr>';
      }).join('');

      return '<details class="pk-block' + (isNow ? ' now' : '') + '"' + (isNow ? ' open' : '') + '>'
        + '<summary><span class="pk-sum-n">Semester ' + s.n + '</span>'
        + '<span class="pk-sum-s">' + s.sks + ' SKS · ' + s.items.length + ' mata kuliah</span>'
        + (isNow ? '<span class="pk-sum-now">● Sedang berjalan</span>' : '') + '</summary>'
        + '<div class="pk-scroll"><table class="pk-table">'
        + '<thead><tr><th>No</th><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Ujian</th><th>Ket</th></tr></thead>'
        + '<tbody>' + rows + '</tbody></table></div>'
        + '</details>';
    }).join('');

    var legenda = K.legenda.map(function (l) {
      return '<div class="pk-leg"><span class="pk-ket">' + esc(l[0]) + '</span><span>' + esc(l[1]) + '</span></div>';
    }).join('');
    var taps = K.taps.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    return '<div class="pk reveal">'
      + '<div class="section-head" style="margin-top:44px;"><div class="seclabel">Paket Arahan Per Semester</div>'
      + '<div class="row-sub">' + esc(K.prodi) + ' · ' + K.totalSks + ' SKS</div></div>'
      + '<div class="hero-sub" style="margin:0 0 22px;"><span class="rule"></span><span class="txt">Racikan SKS yang disarankan katalog untuk tiap semester. Ikuti kalau ingin lulus delapan semester, geser kalau hidup bilang lain.</span></div>'
      + '<div class="pk-chips">' + chips + '</div>'
      + blocks
      + '<div class="pk-foot">'
      + '<div><div class="seclabel" style="margin-bottom:12px;">Keterangan</div>' + legenda + '</div>'
      + '<div><div class="seclabel" style="margin-bottom:12px;">Prasyarat TAPS</div><ul class="pk-taps">' + taps + '</ul>'
      + '<p class="pk-note">Nilai kelulusan mata kuliah praktik/berpraktik minimal C. Tugas 1, 2, dan 3 untuk mata kuliah BPro wajib lengkap diunggah ke elearning.ut.ac.id — kalau satu tidak dikerjakan, nilainya E.</p></div>'
      + '</div></div>';
  };

  /* ---- TUGAS ---- */
  UI.tugas = function (v, draftHtml) {
    var activeRows = v.active.map(function (t) {
      return '<div class="task-row"><button class="chk" onclick="App.toggleTask(\'' + t.id + '\')">✓</button>'
        + '<div style="flex:1;"><div class="task-title">' + esc(t.title) + '</div><div class="row-sub" style="margin-top:2px;">' + esc(t.course) + ' · ' + esc(t.dueText) + '</div></div>'
        + '<span class="tpill ' + t.tone + '">' + esc(t.when) + '</span>'
        + '<button class="iconbtn" onclick="App.editTask(\'' + t.id + '\')">Edit</button>'
        + '<button class="iconbtn" onclick="App.deleteTask(\'' + t.id + '\')">✕</button></div>';
    }).join('') || '<div class="empty">Belum ada tugas aktif. Tambah lewat tombol di atas.</div>';

    var arsip = '';
    if (v.done.length > 0) {
      var doneRows = v.showDone ? '<div style="margin-top:16px;">' + v.done.map(function (t) {
        return '<div class="task-row" style="padding:14px 0;"><button class="chk done" onclick="App.toggleTask(\'' + t.id + '\')">✓</button>'
          + '<div style="flex:1;"><div class="task-title struck">' + esc(t.title) + '</div><div class="row-sub" style="margin-top:2px;">' + esc(t.course) + '</div></div>'
          + '<span style="font:700 11px/1 var(--body); color:var(--green);">Selesai · ' + esc(t.doneText) + '</span>'
          + '<button class="iconbtn" onclick="App.deleteTask(\'' + t.id + '\')">✕</button></div>';
      }).join('') + '</div>' : '';
      arsip = '<button onclick="App.toggleArsip()" style="margin-top:26px; font:800 12px/1 var(--body); letter-spacing:.18em; text-transform:uppercase; color:var(--mut); background:none; border:none; cursor:pointer; padding:0;">'
        + (v.showDone ? '▾ Sembunyikan' : '▸ Lihat') + ' arsip selesai (' + v.done.length + ')</button>' + doneRows;
    }

    return '<div class="page">' + pageHead('Semua Tugas', 'TUGAS', 'App.add(\'task\')', '+ Tambah tugas')
      + '<div style="display:flex; gap:34px; margin:20px 0 6px; border-top:1px solid var(--line-2); border-bottom:1px solid var(--line-2); padding:18px 0;">'
      + '<div><span class="stat-num sm">' + v.aktif + '</span><span class="stat-label" style="margin-left:10px; display:inline;">Aktif</span></div>'
      + '<div><span class="stat-num sm" style="color:var(--green);">' + v.doneCount + '</span><span class="stat-label" style="margin-left:10px; display:inline;">Selesai</span></div>'
      + '<div style="margin-left:auto; align-self:center;" class="row-sub">Klik kotak untuk menandai selesai</div></div>'
      + (draftHtml || '') + activeRows + arsip + '</div>';
  };

  /* ---- UANG ---- */
  UI.uang = function (v, draftHtml) {
    var tx = v.txView.map(function (x) {
      return '<div style="display:flex; align-items:center; gap:16px; padding:13px 0; border-bottom:1px solid var(--line);">'
        + '<span class="row-sub" style="width:54px; font-weight:600;">' + esc(x.dateText) + '</span>'
        + '<div style="flex:1;"><div style="font-size:16px; font-weight:600;">' + esc(x.title) + '</div><div class="row-sub">' + esc(x.category) + '</div></div>'
        + '<span style="font-family:var(--display); font-weight:700; font-size:16px; ' + x.amtStyle + '">' + esc(x.amountText) + '</span>'
        + '<button class="iconbtn" onclick="App.deleteTx(\'' + x.id + '\')">✕</button></div>';
    }).join('') || '<div class="empty">Belum ada transaksi.</div>';
    var cats = v.catList.map(function (c) {
      return '<div style="padding:13px 0; border-bottom:1px solid var(--line);"><div style="display:flex; justify-content:space-between; font-size:15px; margin-bottom:7px;"><span style="font-weight:600;">' + esc(c.name) + '</span><span style="font-family:var(--display); font-weight:700;">' + esc(c.amountText) + '</span></div><div class="bar"><span style="width:' + c.pctStr + '; background:var(--ink);"></span></div></div>';
    }).join('') || '<div class="empty">—</div>';

    return '<div class="page">' + pageHead('Bulan Ini', 'UANG', 'App.add(\'tx\')', '+ Tambah transaksi')
      + '<div class="money-grid">'
      + moneyCell(v.budgetR, 'Budget', '', true) + moneyCell(v.keluarR, 'Terpakai', 'color:var(--accent);') + moneyCell(v.sisaR, 'Sisa', 'color:var(--green);')
      + '</div>'
      + '<div style="margin-top:18px;"><div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:var(--mut); margin-bottom:7px;"><span>Pemakaian budget · klik untuk ubah</span><span onclick="App.editBudget()" style="cursor:pointer; color:var(--accent);">' + v.pctStr + ' ✎</span></div><div class="bar" style="height:9px;"><span style="width:' + v.pctStr + '; background:var(--accent);"></span></div></div>'
      + (draftHtml || '')
      + '<div style="display:grid; grid-template-columns:1.3fr 1fr; gap:48px; margin-top:34px;"><div><div class="seclabel" style="margin-bottom:6px;">Riwayat Transaksi</div>' + tx + '</div><div><div class="seclabel" style="margin-bottom:6px;">Per Kategori</div>' + cats + '</div></div></div>';
  };
  function moneyCell(num, label, style, first) {
    return '<div class="stat" style="' + (first ? 'padding-left:0;' : '') + '"><div class="money-num" style="' + (style || '') + '">' + esc(num) + '</div><div class="stat-label">' + esc(label) + '</div></div>';
  }

  /* ---- RIWAYAT (history lintas semester) ---- */
  UI.riwayat = function (v) {
    if (v.history.length === 0) {
      return '<div class="page">' + pageHeadNoBtn('Jejak Belajar', 'RIWAYAT')
        + '<div class="empty" style="margin-top:20px;">Belum ada semester lain. Begitu kamu menambah semester baru lewat tombol di atas, semester ini otomatis tersimpan sebagai riwayat — lengkap dengan jadwal, tugas, dan pengeluarannya.</div></div>';
    }
    var cards = v.history.map(function (h) {
      var courseChips = h.courses.map(function (c) { return '<span class="typetag" style="margin:0 6px 6px 0; display:inline-block;">' + esc(c) + '</span>'; }).join('');
      return '<div class="hist-card">'
        + '<h3>' + esc(h.code) + ' · ' + esc(h.title) + '</h3>'
        + '<div class="hist-meta">' + esc(h.sks) + ' SKS · ' + h.courses.length + ' mata kuliah' + (h.active ? ' · sedang berjalan' : '') + '</div>'
        + '<div class="hist-stats">'
        + histStat(h.ipk != null ? h.ipk.toFixed(2) : '—', 'IPK')
        + histStat(h.taskDone + '/' + h.taskTotal, 'Tugas selesai')
        + histStat(rupiah(h.spent), 'Total keluar')
        + '</div>'
        + '<div class="seclabel" style="margin-bottom:10px;">Mata Kuliah</div><div>' + (courseChips || '<span class="row-sub">—</span>') + '</div>'
        + (h.active ? '' : '<div style="margin-top:18px;"><button class="iconbtn bordered" onclick="App.switchSemester(\'' + h.id + '\')">Buka semester ini</button> <button class="iconbtn" onclick="App.deleteSemester(\'' + h.id + '\')" style="color:var(--red);">Hapus</button></div>')
        + '</div>';
    }).join('');
    return '<div class="page">' + pageHeadNoBtn('Jejak Belajar', 'RIWAYAT')
      + '<div class="hero-sub" style="margin-top:14px;"><span class="rule"></span><span class="txt">Tiap semester yang kamu lewati tersimpan utuh di sini. Jadwal, tugas, dan uang tidak hilang saat kamu maju ke semester berikutnya.</span></div>'
      + cards + '</div>';
  };
  function histStat(n, l) { return '<div class="hist-stat"><div class="n">' + esc(n) + '</div><div class="l">' + esc(l) + '</div></div>'; }

  /* ---- shared heads ---- */
  function pageHead(eyebrow, big, addFn, addLabel) {
    return '<div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px;"><div><div class="eyebrow">' + esc(eyebrow) + '</div><div class="h-page">' + esc(big) + '<span class="dot">.</span></div></div><button class="addbtn" onclick="' + addFn + '">' + esc(addLabel) + '</button></div>';
  }
  function pageHeadNoBtn(eyebrow, big) {
    return '<div><div class="eyebrow">' + esc(eyebrow) + '</div><div class="h-page">' + esc(big) + '<span class="dot">.</span></div></div>';
  }

  /* ---- FORMS ---- */
  UI.formTask = function (f, editing) {
    return formCard('<div style="display:grid; grid-template-columns:2fr 1.6fr 1.1fr; gap:18px;">'
      + field('Judul Tugas', '<input class="inp" placeholder="Tugas 2 Tuton" value="' + escA(f.title) + '" oninput="App.draft(\'title\', this.value)">')
      + field('Mata Kuliah', '<input class="inp" placeholder="Algoritma & Pemrograman" value="' + escA(f.course) + '" oninput="App.draft(\'course\', this.value)">')
      + field('Deadline', '<input class="inp" type="date" value="' + escA(f.due) + '" oninput="App.draft(\'due\', this.value)">')
      + '</div>', editing);
  };
  UI.formTx = function (f, editing) {
    return formCard('<div style="display:grid; grid-template-columns:1fr 1.8fr 1.2fr 1.2fr 1.2fr; gap:18px;">'
      + field('Tanggal', '<input class="inp" type="date" value="' + escA(f.date) + '" oninput="App.draft(\'date\', this.value)">')
      + field('Judul', '<input class="inp" placeholder="Makan & jajan" value="' + escA(f.title) + '" oninput="App.draft(\'title\', this.value)">')
      + field('Kategori', '<input class="inp" placeholder="Makan" value="' + escA(f.category) + '" oninput="App.draft(\'category\', this.value)">')
      + field('Nominal', '<input class="inp" type="number" placeholder="85000" value="' + escA(f.amount) + '" oninput="App.draft(\'amount\', this.value)">')
      + field('Jenis', '<select class="inp" onchange="App.draft(\'kind\', this.value)"><option value="out"' + (f.kind === 'out' ? ' selected' : '') + '>Pengeluaran</option><option value="in"' + (f.kind === 'in' ? ' selected' : '') + '>Pemasukan</option></select>')
      + '</div>', editing);
  };
  UI.formSession = function (f, editing) {
    function dayOpt(val, label) { return '<option value="' + val + '"' + (String(f.day) === String(val) ? ' selected' : '') + '>' + label + '</option>'; }
    function typeOpt(val) { return '<option' + (f.type === val ? ' selected' : '') + '>' + val + '</option>'; }
    return formCard('<div style="display:grid; grid-template-columns:1.1fr 0.9fr 1fr 1.6fr 1.2fr; gap:18px;">'
      + field('Hari', '<select class="inp" onchange="App.draft(\'day\', this.value)">' + dayOpt(1, 'Senin') + dayOpt(2, 'Selasa') + dayOpt(3, 'Rabu') + dayOpt(4, 'Kamis') + dayOpt(5, 'Jumat') + dayOpt(6, 'Sabtu') + dayOpt(0, 'Minggu') + '</select>')
      + field('Jam', '<input class="inp" placeholder="19.30" value="' + escA(f.time) + '" oninput="App.draft(\'time\', this.value)">')
      + field('Tipe', '<select class="inp" onchange="App.draft(\'type\', this.value)">' + typeOpt('Tuton') + typeOpt('Tuweb') + typeOpt('TTM') + typeOpt('UAS') + '</select>')
      + field('Mata Kuliah', '<input class="inp" placeholder="Algoritma & Pemrograman" value="' + escA(f.course) + '" oninput="App.draft(\'course\', this.value)">')
      + field('Catatan', '<input class="inp" placeholder="Sesi 6" value="' + escA(f.meta) + '" oninput="App.draft(\'meta\', this.value)">')
      + '</div>', editing);
  };
  UI.formSemester = function (f) {
    return formCard('<div style="display:grid; grid-template-columns:0.8fr 2fr 0.8fr 0.8fr; gap:18px;">'
      + field('Kode', '<input class="inp" placeholder="02" value="' + escA(f.code) + '" oninput="App.draft(\'code\', this.value)">')
      + field('Nama Semester', '<input class="inp" placeholder="Semester Kedua" value="' + escA(f.title) + '" oninput="App.draft(\'title\', this.value)">')
      + field('Total SKS', '<input class="inp" type="number" placeholder="20" value="' + escA(f.sks) + '" oninput="App.draft(\'sks\', this.value)">')
      + field('IPK (opsional)', '<input class="inp" type="number" step="0.01" placeholder="3.50" value="' + escA(f.ipk) + '" oninput="App.draft(\'ipk\', this.value)">')
      + '</div>', false, 'Buat semester');
  };
  function field(label, input) { return '<div><label class="flabel">' + esc(label) + '</label>' + input + '</div>'; }
  function formCard(inner, editing, addLabel) {
    return '<div class="formcard">' + inner
      + '<div class="form-actions"><button class="btn btn-primary" onclick="App.saveDraft()">' + (editing ? 'Simpan' : (addLabel || 'Tambah')) + '</button><button class="btn btn-ghost" onclick="App.cancelDraft()">Batal</button></div></div>';
  }

  /* ---- TIMELINE SVG (alur registrasi + kalender, tema editorial) ---- */
  UI.timelineSVG = function () {
    function box(x, y, w, title, sub, variant) {
      var cls = variant === 'ink' ? 'tl-box-ink' : (variant === 'accent' ? 'tl-box-accent' : 'tl-box');
      var tcls = variant === 'ink' ? 'tl-title-inv' : 'tl-title';
      var scls = variant === 'ink' ? 'tl-sub-inv' : (variant === 'accent' ? 'tl-sub-accent' : 'tl-sub');
      var cx = x + w / 2;
      return '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="58" rx="8"/>'
        + '<text class="' + tcls + '" x="' + cx + '" y="' + (y + 24) + '" text-anchor="middle">' + title + '</text>'
        + '<text class="' + scls + '" x="' + cx + '" y="' + (y + 43) + '" text-anchor="middle">' + sub + '</text>';
    }
    function harrow(x1, x2, y) { return '<line class="tl-arrow" x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" marker-end="url(#tlArrow)"/>'; }
    function varrow(x, y1, y2) { return '<line class="tl-arrow" x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" marker-end="url(#tlArrow)"/>'; }

    var svg = '<svg viewBox="0 0 680 520" role="img" xmlns="http://www.w3.org/2000/svg">'
      + '<title>Alur registrasi dan kalender akademik semester ganjil 2026</title>'
      + '<desc>Lima langkah registrasi mahasiswa baru, lalu enam tahap kalender semester dari registrasi sampai nilai keluar.</desc>'
      + '<defs><marker id="tlArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>'

      + '<text class="tl-head" x="40" y="34">Alur registrasi mahasiswa baru</text>'
      + box(40, 54, 180, '1. Pilih mata kuliah', 'di MyUT, maks 20 SKS', 'accent')
      + box(250, 54, 180, '2. Registrasi', 'batas 5 Agu', 'accent')
      + box(460, 54, 180, '3. Bayar uang kuliah', 'batas 7 Agu, lunas', 'accent')
      + harrow(220, 248, 83) + harrow(430, 458, 83)
      + '<path class="tl-arrow" d="M550 112 L550 125 L340 125 L340 138" marker-end="url(#tlArrow)"/>'
      + box(250, 140, 180, '4. Aktivasi Tuton', 'batas 24 Agu', 'accent')
      + box(40, 140, 180, '5. Mulai belajar', 'OSMB lalu Tuton', 'ink')
      + harrow(250, 222, 169)

      + '<line class="tl-rule" x1="40" y1="232" x2="640" y2="232"/>'

      + '<text class="tl-head" x="40" y="268">Kalender semester ganjil 2026</text>'
      + box(40, 288, 180, 'Registrasi & bayar', '1 Jun sampai 7 Agu', 'plain')
      + box(250, 288, 180, 'OSMB & orientasi', 'sampai 23 Agu', 'plain')
      + box(460, 288, 180, 'Tuton 8 sesi', '14 Sep sampai 23 Nov', 'plain')
      + harrow(220, 248, 317) + harrow(430, 458, 317) + varrow(550, 346, 372)
      + box(460, 374, 180, 'UAS', '28 Nov sampai 13 Des', 'ink')
      + box(250, 374, 180, 'Cetak KTPU', 'sebelum 28 Nov', 'accent')
      + box(40, 374, 180, 'Nilai keluar', '6 Jan 2027', 'plain')
      + harrow(460, 432, 403) + harrow(250, 222, 403)

      + '<text class="tl-sub" x="40" y="464">Kotak vermilion menandai langkah penting. Kotak hitam adalah hasil atau titik puncak.</text>'
      + '</svg>';
    return '<div class="timeline-block reveal">' + svg + '</div>';
  };

  window.UI = UI;
})();