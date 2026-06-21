/* =========================================================================
   APP — controller. Memegang STATE, menurunkan view model dari data,
   menangani aksi pengguna, dan mengatur alur auth (mode cloud).
   Semua aksi tulis bersifat async (menunggu Store) lalu refresh.
   ========================================================================= */

(function () {
  "use strict";

  var H = Store.helpers;

  var STATE = {
    tab: 'today',
    draft: null,
    showDone: false,
    data: null,          // dataset penuh dari Store
    ready: false,
    session: null,       // sesi auth (cloud)
    busy: false,
    mantraSkip: 0        // berapa kali user skip mantra hari ini
  };

  /* ---- mantra harian ---- */
  function dayNumber() {
    // jumlah hari sejak epoch, dipakai sebagai indeks deterministik per tanggal
    var n = new Date();
    return Math.floor(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) / 86400000);
  }
  function currentMantra() {
    var list = window.MANTRAS || [];
    if (list.length === 0) return '';
    var idx = (dayNumber() + STATE.mantraSkip) % list.length;
    return list[idx];
  }

  /* ---- util tanggal ---- */
  function todayMid() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function activeSem() {
    var list = STATE.data.semesters || [];
    return list.find(function (s) { return s.active; }) || list[0] || null;
  }

  /* ---- DERIVE: view model untuk semester aktif ---- */
  function derive() {
    var data = STATE.data;
    var sem = activeSem();
    var now = new Date();
    var tm = todayMid();
    var sid = sem ? sem.id : null;

    var sched = data.schedule.filter(function (s) { return s.semester_id === sid; });
    var tasks = data.tasks.filter(function (t) { return t.semester_id === sid; });
    var txAll = data.tx.filter(function (x) { return x.semester_id === sid; });
    var budget = (data.budgets && data.budgets[sid]) || 0;

    // sesi hari ini
    var sessions = sched.filter(function (s) { return Number(s.day) === now.getDay(); })
      .sort(function (a, b) { return a.time.localeCompare(b.time); })
      .map(function (s) { return { time: s.time, label: s.type + ' · ' + s.course, meta: s.meta }; });
    if (sessions.length === 0) sessions = [{ time: '—', label: 'Belajar mandiri · baca BMP', meta: 'Santai' }];

    function mapTask(rt) {
      var diff = Math.round((new Date(rt.due + 'T00:00:00') - tm) / 86400000);
      var when, tone;
      if (rt.done) { when = 'Selesai'; tone = 'done'; }
      else if (diff < 0) { when = 'Lewat'; tone = 'over'; }
      else if (diff === 0) { when = 'Hari ini'; tone = 'today'; }
      else if (diff === 1) { when = 'Besok'; tone = 'soon'; }
      else { when = diff + ' hari'; tone = diff <= 3 ? 'soon' : 'far'; }
      return { id: rt.id, title: rt.title, course: rt.course, dueText: UI.fmt(rt.due), doneText: UI.fmt(rt.done_at), diff: diff, when: when, tone: tone };
    }
    var active = tasks.filter(function (t) { return !t.done; }).map(mapTask).sort(function (a, b) { return a.diff - b.diff; });
    var done = tasks.filter(function (t) { return t.done; }).map(mapTask).sort(function (a, b) { return b.diff - a.diff; });
    var aktif = active.filter(function (t) { return t.diff >= 0; }).length;
    var tasksView = active.filter(function (t) { return t.diff >= 0; }).slice(0, 4);

    // jadwal sepekan
    var order = [1, 2, 3, 4, 5, 6, 0];
    var jadwal = order.map(function (d) {
      var items = sched.filter(function (s) { return Number(s.day) === d; }).sort(function (a, b) { return a.time.localeCompare(b.time); });
      return { dayName: UI.DAYS[d], isToday: d === now.getDay(), empty: items.length === 0, items: items };
    });

    // uang
    var keluar = txAll.filter(function (x) { return x.kind === 'out'; }).reduce(function (s, x) { return s + x.amount; }, 0);
    var sisa = budget - keluar;
    var pct = budget ? Math.min(100, Math.round(keluar / budget * 100)) : 0;
    var cats = {};
    txAll.filter(function (x) { return x.kind === 'out'; }).forEach(function (x) { cats[x.category] = (cats[x.category] || 0) + x.amount; });
    var catList = Object.keys(cats).map(function (c) { return { name: c, amountText: UI.rupiah(cats[c]), pctStr: (keluar ? Math.round(cats[c] / keluar * 100) : 0) + '%', amt: cats[c] }; }).sort(function (a, b) { return b.amt - a.amt; });
    var txView = txAll.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (rx) {
      return { id: rx.id, dateText: UI.fmt(rx.date), title: rx.title, category: rx.category, amountText: (rx.kind === 'out' ? '– ' : '+ ') + UI.rupiah(rx.amount), amtStyle: rx.kind === 'out' ? 'color:var(--ink);' : 'color:var(--green);' };
    });

    // jumlah MK unik (dari jadwal)
    var courseSet = {};
    sched.forEach(function (s) { if (s.course) courseSet[s.course] = 1; });
    var courseCount = Object.keys(courseSet).length || tasks.length;

    return {
      sem: sem || { code: '—', title: 'Belum ada semester', sks: 0, ipk: null },
      mantra: currentMantra(),
      todayName: UI.DAYS[now.getDay()], todayDate: now.getDate() + ' ' + UI.MONTHS[now.getMonth()] + ' ' + now.getFullYear(),
      sessions: sessions, active: active, done: done, aktif: aktif, doneCount: done.length, tasksView: tasksView, showDone: STATE.showDone,
      jadwal: jadwal, courseCount: courseCount,
      budgetR: UI.rupiah(budget), keluarR: UI.rupiah(keluar), sisaR: UI.rupiah(sisa), pctStr: pct + '%', catList: catList, txView: txView
    };
  }

  /* ---- DERIVE RIWAYAT: ringkasan tiap semester ---- */
  function deriveHistory() {
    var data = STATE.data;
    return (data.semesters || []).slice().sort(function (a, b) { return (b.order || 0) - (a.order || 0); }).map(function (sem) {
      var tasks = data.tasks.filter(function (t) { return t.semester_id === sem.id; });
      var tx = data.tx.filter(function (x) { return x.semester_id === sem.id && x.kind === 'out'; });
      var courses = {};
      data.schedule.filter(function (s) { return s.semester_id === sem.id; }).forEach(function (s) { if (s.course) courses[s.course] = 1; });
      return {
        id: sem.id, code: sem.code, title: sem.title, sks: sem.sks, ipk: sem.ipk, active: sem.active,
        taskTotal: tasks.length, taskDone: tasks.filter(function (t) { return t.done; }).length,
        spent: tx.reduce(function (s, x) { return s + x.amount; }, 0),
        courses: Object.keys(courses)
      };
    });
  }

  /* ---- RENDER ---- */
  function render() {
    if (!STATE.ready) return;
    document.getElementById('nav').innerHTML = UI.nav(STATE.tab);
    document.getElementById('sembar').innerHTML = UI.sembar(STATE.data.semesters || [], activeSem() ? activeSem().id : null);

    var v = derive();
    var d = STATE.draft;
    var draftHtml = '';
    if (d) {
      if (d.kind === 'task') draftHtml = UI.formTask(d.f, !!d.id);
      else if (d.kind === 'tx') draftHtml = UI.formTx(d.f, !!d.id);
      else if (d.kind === 'session') draftHtml = UI.formSession(d.f, !!d.id);
      else if (d.kind === 'semester') draftHtml = UI.formSemester(d.f);
    }

    var html;
    if (STATE.tab === 'jadwal') html = UI.jadwal(v, d && d.kind === 'session' ? draftHtml : '');
    else if (STATE.tab === 'tugas') html = UI.tugas(v, d && d.kind === 'task' ? draftHtml : '');
    else if (STATE.tab === 'uang') html = UI.uang(v, d && d.kind === 'tx' ? draftHtml : '');
    else if (STATE.tab === 'riwayat') html = UI.riwayat({ history: deriveHistory() });
    else if (STATE.tab === 'gloss') html = window.GLOSS_HTML;
    else html = UI.today(v);

    // form semester muncul di atas mana pun saat aktif
    if (d && d.kind === 'semester' && STATE.tab !== 'gloss') {
      html = html.replace('<div class="page', draftHtml + '<div class="page');
    }
    var view = document.getElementById('view');
    view.innerHTML = html;
    // fade halus tiap render
    view.classList.remove('view-anim');
    void view.offsetWidth; // paksa reflow biar animasi re-trigger
    view.classList.add('view-anim');
    setupReveal();
    renderAuthBtn();
  }

  /* ---- reveal saat elemen masuk layar ---- */
  var _revealObserver = null;
  function setupReveal() {
    if (typeof IntersectionObserver === 'undefined') return;
    if (!_revealObserver) {
      _revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); _revealObserver.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    }
    var view = document.getElementById('view');
    var targets = view.querySelectorAll('.reveal');
    targets.forEach(function (el) { _revealObserver.observe(el); });
  }

  function renderAuthBtn() {
    var btn = document.getElementById('authBtn'); if (!btn) return;
    if (!Store.isCloud()) { btn.style.display = 'none'; return; }
    btn.style.display = '';
    if (STATE.session) { btn.textContent = 'Keluar'; }
    else { btn.textContent = 'Masuk'; }
  }

  function refresh() {
    return Store.getAll().then(function (d) { STATE.data = d; render(); });
  }

  /* ---- APP actions ---- */
  var App = {
    go: function (tab) { STATE.tab = tab; STATE.draft = null; render(); },
    toggleArsip: function () { STATE.showDone = !STATE.showDone; render(); },
    nextMantra: function () { STATE.mantraSkip++; render(); },

    switchSemester: function (id) {
      Store.setActiveSemester(id).then(function () { STATE.tab = 'today'; return refresh(); });
    },
    addSemester: function () {
      STATE.draft = { kind: 'semester', id: null, f: { code: '', title: '', sks: '', ipk: '' } };
      render();
    },
    deleteSemester: function (id) {
      var sem = STATE.data.semesters.find(function (s) { return s.id === id; });
      if (!confirm('Hapus "' + (sem ? sem.title : 'semester ini') + '" beserta seluruh jadwal, tugas, dan transaksinya? Tindakan ini tidak bisa dibatalkan.')) return;
      Store.deleteSemester(id).then(refresh);
    },

    add: function (kind) {
      var f = kind === 'task' ? { title: '', course: '', due: H.todayISO() }
        : kind === 'tx' ? { date: H.todayISO(), title: '', category: '', amount: '', kind: 'out' }
        : { day: '1', time: '', type: 'Tuton', course: '', meta: '' };
      STATE.draft = { kind: kind, id: null, f: f };
      render();
    },
    editTask: function (id) { var t = find('tasks', id); STATE.draft = { kind: 'task', id: id, f: { title: t.title, course: t.course, due: t.due } }; render(); },
    editSession: function (id) { var s = find('schedule', id); STATE.draft = { kind: 'session', id: id, f: { day: s.day, time: s.time, type: s.type, course: s.course, meta: s.meta } }; render(); },
    editBudget: function () {
      var sem = activeSem(); if (!sem) return;
      var cur = (STATE.data.budgets && STATE.data.budgets[sem.id]) || 0;
      var val = prompt('Budget bulanan untuk ' + sem.title + ' (angka saja):', cur);
      if (val == null) return;
      var n = Number(String(val).replace(/[^\d]/g, '')) || 0;
      Store.setBudget(sem.id, n).then(refresh);
    },

    draft: function (key, val) { if (STATE.draft) STATE.draft.f[key] = val; },
    cancelDraft: function () { STATE.draft = null; render(); },

    saveDraft: function () {
      var d = STATE.draft; if (!d) return;
      var f = d.f;
      var sem = activeSem();
      var sid = sem ? sem.id : null;

      if (d.kind === 'task') {
        if (!String(f.title).trim()) { return App.cancelDraft(); }
        if (d.id) Store.update('tasks', d.id, { title: f.title, course: f.course, due: f.due }).then(done);
        else Store.add('tasks', { id: H.uid('t'), semester_id: sid, title: f.title, course: f.course, due: f.due, done: false, done_at: null }).then(done);

      } else if (d.kind === 'tx') {
        if (!String(f.title).trim()) { return App.cancelDraft(); }
        var rec = { date: f.date, title: f.title, category: f.category || 'Lainnya', amount: Number(f.amount) || 0, kind: f.kind };
        if (d.id) Store.update('tx', d.id, rec).then(done);
        else Store.add('tx', Object.assign({ id: H.uid('x'), semester_id: sid }, rec)).then(done);

      } else if (d.kind === 'session') {
        if (!String(f.course).trim()) { return App.cancelDraft(); }
        var rs = { day: Number(f.day), time: f.time, type: f.type, course: f.course, meta: f.meta };
        if (d.id) Store.update('schedule', d.id, rs).then(done);
        else Store.add('schedule', Object.assign({ id: H.uid('s'), semester_id: sid }, rs)).then(done);

      } else if (d.kind === 'semester') {
        if (!String(f.code).trim() || !String(f.title).trim()) { return App.cancelDraft(); }
        var nextOrder = (STATE.data.semesters || []).reduce(function (m, s) { return Math.max(m, s.order || 0); }, 0) + 1;
        var obj = { id: H.uid('sem'), code: f.code, title: f.title, sks: Number(f.sks) || 0, ipk: f.ipk ? Number(f.ipk) : null, active: false, order: nextOrder };
        Store.addSemester(obj).then(function () { return Store.setActiveSemester(obj.id); }).then(function () { STATE.draft = null; STATE.tab = 'today'; return refresh(); });
      }
      function done() { STATE.draft = null; refresh(); }
    },

    toggleTask: function (id) {
      var t = find('tasks', id);
      Store.update('tasks', id, { done: !t.done, done_at: !t.done ? H.todayISO() : null }).then(refresh);
    },
    deleteTask: function (id) { Store.remove('tasks', id).then(refresh); },
    deleteTx: function (id) { Store.remove('tx', id).then(refresh); },
    deleteSession: function (id) { Store.remove('schedule', id).then(refresh); },

    /* ---- AUTH (cloud) ---- */
    authAction: function () {
      if (STATE.session) {
        if (confirm('Keluar dari akun? Datamu tetap aman tersimpan di cloud dan bisa dibuka lagi setelah masuk.')) {
          Store.auth.signOut().then(function () { location.reload(); });
        }
      } else {
        Auth.open('in');
      }
    },
    showAuth: function (mode) { Auth.open(mode || 'in'); },
    signOut: function () { Store.auth.signOut().then(function () { location.reload(); }); }
  };
  window.App = App;

  function find(table, id) { return STATE.data[table].find(function (x) { return x.id === id; }); }

  /* =======================================================================
     AUTH UI (modal) — hanya dipakai di mode cloud
     ======================================================================= */
  var Auth = {
    open: function (mode) {
      var box = document.getElementById('authModal');
      box.style.display = 'flex';
      box.innerHTML = Auth.html(mode);
    },
    close: function () { document.getElementById('authModal').style.display = 'none'; },
    html: function (mode) {
      var isUp = mode === 'up';
      return '<div class="modal">'
        + '<h2>' + (isUp ? 'Buat akun' : 'Masuk') + '</h2>'
        + '<p>' + (isUp ? 'Sekali daftar, datamu tersimpan di cloud dan bisa dibuka dari perangkat mana pun.' : 'Masuk untuk membuka datamu yang tersimpan di cloud.') + '</p>'
        + '<label class="flabel">Email</label><input class="inp" id="authEmail" type="email" placeholder="kamu@email.com">'
        + '<label class="flabel">Kata sandi</label><input class="inp" id="authPass" type="password" placeholder="minimal 6 karakter">'
        + '<div class="modal-msg" id="authMsg"></div>'
        + '<div class="form-actions"><button class="btn btn-primary" id="authGo">' + (isUp ? 'Daftar' : 'Masuk') + '</button>'
        + '<button class="btn btn-ghost" onclick="document.getElementById(\'authModal\').style.display=\'none\'">Nanti</button></div>'
        + '<div style="margin-top:18px; font-size:12.5px; color:var(--mut);">'
        + (isUp ? 'Sudah punya akun? <a href="#" onclick="App._auth(\'in\');return false;" style="color:var(--accent);">Masuk</a>'
                : 'Belum punya akun? <a href="#" onclick="App._auth(\'up\');return false;" style="color:var(--accent);">Daftar</a>')
        + '</div></div>';
    },
    bind: function (mode) {
      var btn = document.getElementById('authGo');
      btn.onclick = function () {
        var email = document.getElementById('authEmail').value.trim();
        var pass = document.getElementById('authPass').value;
        var msg = document.getElementById('authMsg');
        msg.className = 'modal-msg'; msg.textContent = 'Memproses…';
        var p = mode === 'up' ? Store.auth.signUp(email, pass) : Store.auth.signIn(email, pass);
        p.then(function () {
          if (mode === 'up') { msg.className = 'modal-msg ok'; msg.textContent = 'Akun dibuat. Kalau diminta verifikasi email, cek inbox-mu lalu masuk.'; }
          // onChange handler akan menutup modal & memuat data
        }).catch(function (e) {
          msg.className = 'modal-msg err'; msg.textContent = terjemahErr(e);
        });
      };
    }
  };
  App._auth = function (mode) { Auth.open(mode); setTimeout(function () { Auth.bind(mode); }, 0); };

  // re-bind tombol tiap modal dibuka
  var _open = Auth.open;
  Auth.open = function (mode) { _open.call(Auth, mode); Auth.bind(mode); };

  function terjemahErr(e) {
    var m = (e && e.message) || String(e);
    if (/Invalid login/i.test(m)) return 'Email atau kata sandi salah.';
    if (/already registered/i.test(m)) return 'Email ini sudah terdaftar. Coba masuk.';
    if (/at least 6/i.test(m)) return 'Kata sandi minimal 6 karakter.';
    return m;
  }

  /* =======================================================================
     BOOT
     ======================================================================= */
  function boot() {
    Store.init().then(function (res) {
      if (Store.isCloud()) {
        // pasang listener auth lebih dulu
        Store.auth.onChange(function (session) {
          STATE.session = session;
          if (session) {
            document.getElementById('authModal').style.display = 'none';
            Store.seedIfEmpty().then(function () {
              STATE.ready = true; return refresh();
            });
          } else {
            STATE.ready = true;
            STATE.data = { semesters: [], schedule: [], tasks: [], tx: [], budgets: {} };
            render();
            Auth.open('in');
          }
        });
        // cek sesi yang sudah ada
        Store.auth.getSession().then(function (session) {
          if (session && session.user) { Store.auth.setUser(session.user.id); STATE.session = session; STATE.ready = true; Store.seedIfEmpty().then(refresh); }
          else { STATE.ready = true; STATE.data = { semesters: [], schedule: [], tasks: [], tx: [], budgets: {} }; render(); Auth.open('in'); }
        });
      } else {
        STATE.ready = true;
        refresh();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();