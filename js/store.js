/* =========================================================================
   STORE — satu-satunya pintu baca/tulis data.
   -------------------------------------------------------------------------
   Dua adapter, satu antarmuka:
     - LocalAdapter   : localStorage (mode lokal / offline)
     - CloudAdapter   : Supabase     (mode cloud / sync antar-perangkat)

   Semua data terikat ke SEMESTER. Bentuk data:
     semesters : [{ id, code, title, sks, ipk, active, order }]
     schedule  : [{ id, semester_id, day, time, type, course, meta }]
     tasks     : [{ id, semester_id, title, course, due, done, done_at }]
     tx        : [{ id, semester_id, date, title, category, amount, kind }]
     budgets   : { [semester_id]: number }

   Antarmuka publik (semua async, supaya sama untuk lokal & cloud):
     Store.init()                       -> { mode }
     Store.isCloud()                    -> bool
     Store.auth.* (cloud only)
     Store.getAll()                     -> seluruh dataset
     Store.addSemester(obj) / updateSemester(id, patch) / deleteSemester(id)
     Store.setActiveSemester(id)
     Store.add(table, obj) / update(table, id, patch) / remove(table, id)
     Store.setBudget(semesterId, amount)
   ========================================================================= */

(function () {
  "use strict";

  var LKEY = 'studiosi.v2';
  var TABLES = ['schedule', 'tasks', 'tx'];

  function uid(p) { return (p || 'k') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function todayISO() { var d = new Date(); function p(n){return String(n).padStart(2,'0');} return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }

  /* ---- data awal untuk pengguna baru ---- */
  function seed() {
    var sid = 's_smt1';
    return {
      semesters: [
        { id: sid, code: '01', title: 'Semester Pertama', sks: 0, ipk: null, active: true, order: 1 }
      ],
      budgets: { [sid]: 0 },
      schedule: [],
      tasks: [],
      tx: []
    };
  }

  /* =======================================================================
     ADAPTER LOKAL (localStorage)
     ======================================================================= */
  function LocalAdapter() {
    var data = null;
    function load() {
      try { var r = localStorage.getItem(LKEY); if (r) return JSON.parse(r); } catch (e) {}
      return seed();
    }
    function save() { try { localStorage.setItem(LKEY, JSON.stringify(data)); } catch (e) {} }

    return {
      mode: 'local',
      init: function () { data = load(); return Promise.resolve(); },
      getAll: function () { return Promise.resolve(JSON.parse(JSON.stringify(data))); },

      addSemester: function (o) { data.semesters.push(o); if (!(o.id in data.budgets)) data.budgets[o.id] = 0; save(); return Promise.resolve(o); },
      updateSemester: function (id, patch) { var s = data.semesters.find(function (x){return x.id===id;}); if (s) Object.assign(s, patch); save(); return Promise.resolve(); },
      deleteSemester: function (id) {
        data.semesters = data.semesters.filter(function (x){return x.id!==id;});
        TABLES.forEach(function (t){ data[t] = data[t].filter(function (r){return r.semester_id!==id;}); });
        delete data.budgets[id]; save(); return Promise.resolve();
      },
      setActive: function (id) { data.semesters.forEach(function (s){ s.active = (s.id===id); }); save(); return Promise.resolve(); },

      add: function (table, o) { data[table].push(o); save(); return Promise.resolve(o); },
      update: function (table, id, patch) { var r = data[table].find(function (x){return x.id===id;}); if (r) Object.assign(r, patch); save(); return Promise.resolve(); },
      remove: function (table, id) { data[table] = data[table].filter(function (x){return x.id!==id;}); save(); return Promise.resolve(); },
      setBudget: function (sid, amt) { data.budgets[sid] = amt; save(); return Promise.resolve(); },

      replaceAll: function (next) { data = next; save(); return Promise.resolve(); }
    };
  }

  /* =======================================================================
     ADAPTER CLOUD (Supabase)
     ======================================================================= */
  function CloudAdapter(sb) {
    var uidKey = null; // user id aktif

    function rowsFor(table, userId) {
      return sb.from(table).select('*').eq('user_id', userId);
    }

    return {
      mode: 'cloud',
      _sb: sb,
      init: function () { return Promise.resolve(); },

      setUser: function (id) { uidKey = id; },

      getAll: function () {
        return Promise.all([
          sb.from('semesters').select('*').order('order', { ascending: true }),
          sb.from('schedule').select('*'),
          sb.from('tasks').select('*'),
          sb.from('tx').select('*'),
          sb.from('budgets').select('*')
        ]).then(function (res) {
          res.forEach(function (r){ if (r.error) throw r.error; });
          var budgets = {};
          (res[4].data || []).forEach(function (b){ budgets[b.semester_id] = Number(b.amount); });
          return {
            semesters: res[0].data || [],
            schedule: res[1].data || [],
            tasks: res[2].data || [],
            tx: res[3].data || [],
            budgets: budgets
          };
        });
      },

      addSemester: function (o) {
        var rec = Object.assign({ user_id: uidKey }, o);
        return sb.from('semesters').insert(rec).then(thrower).then(function () {
          return sb.from('budgets').upsert({ user_id: uidKey, semester_id: o.id, amount: 0 }).then(thrower);
        }).then(function(){ return o; });
      },
      updateSemester: function (id, patch) { return sb.from('semesters').update(patch).eq('id', id).then(thrower); },
      deleteSemester: function (id) {
        // hapus anak dulu, lalu semester (mencegah orphan kalau cascade tak aktif)
        return Promise.all([
          sb.from('schedule').delete().eq('semester_id', id).then(thrower),
          sb.from('tasks').delete().eq('semester_id', id).then(thrower),
          sb.from('tx').delete().eq('semester_id', id).then(thrower),
          sb.from('budgets').delete().eq('semester_id', id).then(thrower)
        ]).then(function () { return sb.from('semesters').delete().eq('id', id).then(thrower); });
      },
      setActive: function (id) {
        // satu aktif: matikan semua, nyalakan satu
        return sb.from('semesters').update({ active: false }).eq('user_id', uidKey).then(thrower)
          .then(function () { return sb.from('semesters').update({ active: true }).eq('id', id).then(thrower); });
      },

      add: function (table, o) {
        var rec = Object.assign({ user_id: uidKey }, o);
        return sb.from(table).insert(rec).then(thrower).then(function () { return o; });
      },
      update: function (table, id, patch) { return sb.from(table).update(patch).eq('id', id).then(thrower); },
      remove: function (table, id) { return sb.from(table).delete().eq('id', id).then(thrower); },
      setBudget: function (sid, amt) { return sb.from('budgets').upsert({ user_id: uidKey, semester_id: sid, amount: amt }).then(thrower); }
    };

    function thrower(res) { if (res && res.error) throw res.error; return res; }
  }

  /* =======================================================================
     STORE publik
     ======================================================================= */
  var adapter = null;
  var sbClient = null;

  var Store = {
    mode: 'local',

    isCloud: function () { return Store.mode === 'cloud'; },

    init: function () {
      var cfg = window.SUPABASE_CONFIG || {};
      var hasCloud = cfg.url && cfg.anonKey && window.supabase;
      if (hasCloud) {
        try {
          sbClient = window.supabase.createClient(cfg.url, cfg.anonKey);
          adapter = CloudAdapter(sbClient);
          Store.mode = 'cloud';
          return adapter.init().then(function () { return { mode: 'cloud' }; });
        } catch (e) {
          // gagal init cloud -> jatuh ke lokal
          adapter = LocalAdapter(); Store.mode = 'local';
          return adapter.init().then(function () { return { mode: 'local', error: e }; });
        }
      }
      adapter = LocalAdapter(); Store.mode = 'local';
      return adapter.init().then(function () { return { mode: 'local' }; });
    },

    /* ---- AUTH (hanya berarti di mode cloud) ---- */
    auth: {
      getSession: function () {
        if (!sbClient) return Promise.resolve(null);
        return sbClient.auth.getSession().then(function (r) { return r.data.session; });
      },
      onChange: function (cb) {
        if (!sbClient) return;
        sbClient.auth.onAuthStateChange(function (_e, session) {
          if (session && session.user) adapter.setUser(session.user.id);
          cb(session);
        });
      },
      signUp: function (email, pass) {
        return sbClient.auth.signUp({ email: email, password: pass }).then(function (r) { if (r.error) throw r.error; return r.data; });
      },
      signIn: function (email, pass) {
        return sbClient.auth.signInWithPassword({ email: email, password: pass }).then(function (r) { if (r.error) throw r.error; return r.data; });
      },
      signOut: function () { return sbClient.auth.signOut(); },
      setUser: function (id) { if (adapter.setUser) adapter.setUser(id); }
    },

    /* ---- jika cloud & user baru: tanam data awal sekali ---- */
    seedIfEmpty: function () {
      return adapter.getAll().then(function (d) {
        if (d.semesters && d.semesters.length > 0) return false;
        var s = seed();
        // tanam berurutan
        var chain = adapter.addSemester(s.semesters[0])
          .then(function () { return adapter.setBudget(s.semesters[0].id, s.budgets[s.semesters[0].id]); });
        ['schedule', 'tasks', 'tx'].forEach(function (table) {
          s[table].forEach(function (row) { chain = chain.then(function () { return adapter.add(table, row); }); });
        });
        return chain.then(function () { return true; });
      });
    },

    getAll: function () { return adapter.getAll(); },
    addSemester: function (o) { return adapter.addSemester(o); },
    updateSemester: function (id, p) { return adapter.updateSemester(id, p); },
    deleteSemester: function (id) { return adapter.deleteSemester(id); },
    setActiveSemester: function (id) { return adapter.setActive(id); },
    add: function (t, o) { return adapter.add(t, o); },
    update: function (t, id, p) { return adapter.update(t, id, p); },
    remove: function (t, id) { return adapter.remove(t, id); },
    setBudget: function (sid, amt) { return adapter.setBudget(sid, amt); },

    /* ---- backup lokal (selalu tersedia) ---- */
    exportData: function () {
      return adapter.getAll().then(function (d) {
        var blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url;
        a.download = 'trwbcy-si-backup-' + todayISO() + '.json'; a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    },
    importData: function (file) {
      return new Promise(function (resolve, reject) {
        var r = new FileReader();
        r.onload = function () {
          try {
            var d = JSON.parse(r.result);
            if (!d || !d.semesters || !d.tasks) throw new Error('Format backup tidak dikenali.');
            if (adapter.replaceAll) { adapter.replaceAll(d).then(resolve); }
            else { reject(new Error('Impor massal hanya untuk mode lokal. Di mode cloud, data sudah otomatis tersimpan.')); }
          } catch (e) { reject(e); }
        };
        r.readAsText(file);
      });
    },

    helpers: { uid: uid, todayISO: todayISO }
  };

  window.Store = Store;
})();