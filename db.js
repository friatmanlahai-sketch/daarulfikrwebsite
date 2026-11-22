/* Lapisan data: Firebase (jika dikonfigurasi) atau localStorage (mode demo). */
(function () {
  var C = window.FIREBASE_CONFIG || {}, want = !!(C.apiKey && C.projectId), cloud = want && !!(window.firebase && firebase.firestore), fs, au = null;
  if (cloud) { firebase.initializeApp(C); fs = firebase.firestore(); au = firebase.auth ? firebase.auth() : null; }
  var P = 'df_';
  function lget(c) { try { return JSON.parse(localStorage.getItem(P + c) || '[]'); } catch (e) { return []; } }
  function lset(c, a) { localStorage.setItem(P + c, JSON.stringify(a)); }
  function lakun() { try { return JSON.parse(localStorage.getItem(P + 'akun') || '[]'); } catch (e) { return []; } }
  function uid() { return 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  async function sha(t) {
    if (window.crypto && crypto.subtle) { var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('df|' + t)); return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
    var h = 5381; for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return 'x' + h;
  }
  window.DB = {
    cloud: cloud,
    list: async function (c) {
      if (cloud) { var s = await fs.collection(c).get(); return s.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; }); }
      return lget(c);
    },
    add: async function (c, o) {
      o.tgl = o.tgl || new Date().toISOString();
      if (cloud) { return (await fs.collection(c).add(o)).id; }
      var a = lget(c); o.id = uid(); a.push(o); lset(c, a); return o.id;
    },
    set: async function (c, id, o) {
      if (cloud) { await fs.collection(c).doc(id).set(o, { merge: true }); return; }
      var a = lget(c), i = a.findIndex(function (x) { return x.id === id; });
      if (i > -1) Object.assign(a[i], o); else { o.id = id; a.push(o); } lset(c, a);
    },
    del: async function (c, id) {
      if (cloud) { await fs.collection(c).doc(id).delete(); return; }
      lset(c, lget(c).filter(function (x) { return x.id !== id; }));
    },
    /* Pendaftaran publik */
    daftar: async function (d) {
      var AL = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ', rb = crypto.getRandomValues(new Uint8Array(6)), code = '';
      for (var i = 0; i < 6; i++) code += AL[rb[i] % 32];
      d.no = 'DF-' + String(new Date().getFullYear()).slice(2) + '-' + code;
      d.status = 'Menunggu';
      await this.add('santri', d);
      if (cloud) await fs.collection('status').doc(d.no).set({ nama: d.nama, status: 'Menunggu' });
      return d.no;
    },
    setStatus: async function (no, nama, status) { if (cloud && no) await fs.collection('status').doc(no).set({ nama: nama, status: status }); },
    cek: async function (no) {
      no = no.trim().toUpperCase();
      if (cloud) { var s = await fs.collection('status').doc(no).get(); return s.exists ? s.data() : null; }
      var x = lget('santri').find(function (y) { return y.no === no; }); return x ? { nama: x.nama, status: x.status } : null;
    },
    /* Autentikasi admin */
    login: async function (u, p) {
      if (cloud) { if (!au) throw new Error('Modul login Firebase gagal dimuat. Muat ulang halaman.'); await au.signInWithEmailAndPassword(u, p); return; }
      var a = JSON.parse(localStorage.getItem(P + 'admin') || 'null');
      if (!a) a = { u: 'admin', h: await sha('admin123') };
      if (u === a.u && (await sha(p)) === a.h) sessionStorage.setItem('df_auth', '1'); else throw new Error('Username atau password salah.');
    },
    logout: async function () { if (cloud && au) await au.signOut(); sessionStorage.removeItem('df_auth'); sessionStorage.removeItem('df_ouid'); },
    onAuth: function (cb) {
      if (cloud) { if (au) au.onAuthStateChanged(function (u) { cb(!!u); }); else cb(false); } else cb(sessionStorage.getItem('df_auth') === '1');
    },
    ganti: async function (o, n, u) {
      if (cloud) { if (!au || !au.currentUser) throw new Error('Silakan login ulang.'); await au.currentUser.updatePassword(n); return; }
      var a = JSON.parse(localStorage.getItem(P + 'admin') || 'null') || { u: 'admin', h: await sha('admin123') };
      if ((await sha(o)) !== a.h) throw new Error('Password lama salah.');
      localStorage.setItem(P + 'admin', JSON.stringify({ u: u || a.u, h: await sha(n) }));
    },

    /* ===== Akun orang tua & portal ===== */
    uid: function () { if (cloud) return au && au.currentUser ? au.currentUser.uid : null; return sessionStorage.getItem('df_ouid'); },
    query: async function (c, f, v) {
      if (cloud) { var q = await fs.collection(c).where(f, '==', v).get(); return q.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; }); }
      return lget(c).filter(function (x) { return x[f] === v; });
    },
    onUser: function (cb) {
      if (cloud) { if (au) au.onAuthStateChanged(function (u) { cb(u ? { uid: u.uid, email: u.email } : null); }); else cb(null); return; }
      var id = sessionStorage.getItem('df_ouid'), a = lakun().filter(function (x) { return x.uid === id; })[0];
      cb(sessionStorage.getItem('df_auth') === '1' ? { uid: 'admin', email: 'admin' } : (a ? { uid: a.uid, email: a.email } : null));
    },
    role: async function () {
      if (!cloud) { if (sessionStorage.getItem('df_auth') === '1') return 'admin'; return sessionStorage.getItem('df_ouid') ? 'ortu' : null; }
      if (!au || !au.currentUser) return null;
      try { await fs.collection('admin').doc('ping').get(); return 'admin'; }
      catch (e) { if (/permission-denied/.test(e.code || '')) return 'ortu'; throw e; }
    },
    masuk: async function (u, p) {
      if (cloud) { await this.login(u, p); return await this.role(); }
      try { await this.login(u, p); return 'admin'; } catch (e) {}
      await this.ortuLogin(u, p); return 'ortu';
    },
    ortuDaftar: async function (email, pass, nama, hp) {
      email = email.trim().toLowerCase();
      var prof = { nama: nama, hp: hp, email: email, tgl: new Date().toISOString() };
      if (cloud) { var c = await au.createUserWithEmailAndPassword(email, pass); await fs.collection('ortu').doc(c.user.uid).set(prof); return c.user.uid; }
      var ak = lakun(); if (ak.some(function (x) { return x.email === email; })) throw new Error('Email sudah terdaftar. Silakan masuk.');
      var id = uid(); ak.push({ uid: id, email: email, h: await sha(pass) }); localStorage.setItem(P + 'akun', JSON.stringify(ak));
      var a = lget('ortu'); prof.id = id; a.push(prof); lset('ortu', a); sessionStorage.setItem('df_ouid', id); return id;
    },
    ortuLogin: async function (email, pass) {
      email = email.trim().toLowerCase(); var h = await sha(pass), a = lakun().filter(function (x) { return x.email === email && x.h === h; })[0];
      if (!a) throw new Error('Email atau password salah.'); sessionStorage.setItem('df_ouid', a.uid); return a.uid;
    },
    profil: async function () {
      var id = this.uid(); if (!id) return null;
      if (cloud) { var d = await fs.collection('ortu').doc(id).get(); var o = d.exists ? d.data() : {}; o.id = id; return o; }
      return lget('ortu').filter(function (x) { return x.id === id; })[0] || { id: id };
    },
    simpanProfil: async function (o) { return this.set('ortu', this.uid(), o); },
    reset: async function (email) {
      if (!cloud || !au) throw new Error('Reset password lewat email hanya tersedia di mode online.');
      await au.sendPasswordResetEmail(email.trim());
    },
    anak: async function () { return this.query('santri', 'ortuUid', this.uid()); },
    izin: async function (sid, snama, tanggal, ket, catatan) { return this.add('absensi', { tanggal: tanggal, sid: sid, snama: snama, ket: ket, catatan: catatan || '', oleh: 'Orang tua' }); },
    ajukanTautan: async function (no, lahir) {
      var p = await this.profil();
      return this.add('tautan', { uid: this.uid(), nama: p.nama || '', hp: p.hp || '', no: no.trim().toUpperCase(), lahir: lahir, status: 'Menunggu' });
    },
    pending: async function () {
      if (cloud) { var q = await fs.collection('santri').where('status', '==', 'Menunggu').get(); return q.size != null ? q.size : q.docs.length; }
      return lget('santri').filter(function (x) { return x.status === 'Menunggu'; }).length;
    },
    diag: async function () {
      var out = [], self = this;
      function add(ok, t, m) { out.push({ ok: ok, t: t, m: m || '' }); }
      if (!cloud) { add(false, 'Mode demo: data hanya tersimpan di browser ini.', 'Website dan admin di alamat atau perangkat berbeda TIDAK terhubung. Buka setup.html, isi firebase-config.js, lalu upload ulang.'); return out; }
      add(true, 'Mode online aktif. Project Firebase: ' + C.projectId);
      try { await fs.collection('pengaturan').get(); add(true, 'Website bisa membaca program, jadwal, pengumuman, dan pengaturan.'); }
      catch (e) { add(false, 'Website belum bisa membaca data publik.', self.err(e) + ' Tempel ulang firestore.rules lalu Publish.'); }
      try { await fs.collection('santri').limit(1).get(); add(true, 'Admin bisa membaca data santri.'); }
      catch (e) { add(false, 'Admin tidak bisa membaca data santri.', self.err(e)); }
      try { var r = fs.collection('pengaturan').doc('_tes'); await r.set({ t: Date.now() }); await r.delete(); add(true, 'Admin bisa menyimpan data.'); }
      catch (e) { add(false, 'Admin tidak bisa menyimpan data.', self.err(e)); }
      return out;
    },
    err: function (e) {
      var c = (e && (e.code || '')) + '', m = (e && e.message) || String(e);
      if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)) return 'Email atau password salah.';
      if (/email-already-in-use/.test(c)) return 'Email sudah terdaftar. Silakan masuk, atau gunakan "Lupa password".';
      if (/weak-password/.test(c)) return 'Password terlalu lemah (minimal 6 karakter).';
      if (/operation-not-allowed/.test(c)) return 'Pendaftaran akun belum diaktifkan: Firebase → Authentication → Sign-in method → Email/Password → Enable.';
      if (/unauthorized-domain/.test(c)) return 'Domain website belum didaftarkan: Firebase → Authentication → Settings → Authorized domains.';
      if (/network|unavailable/.test(c)) return 'Tidak ada koneksi internet. Coba lagi.';
      if (/too-many-requests/.test(c)) return 'Terlalu banyak percobaan. Tunggu beberapa menit.';
      if (/permission-denied/.test(c) || /insufficient permissions/i.test(m)) return 'Akses ditolak. Pastikan email admin di Firestore Rules sudah benar dan Rules sudah di-Publish.';
      if (/requires-recent-login/.test(c)) return 'Untuk keamanan, keluar lalu login ulang sebelum mengganti password.';
      return m;
    }
  };
  /* Firebase sudah diisi tetapi skrip gagal dimuat: jangan diam-diam jatuh ke mode lokal. */
  if (want && !cloud) {
    var msg = 'Firebase gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.';
    Object.keys(window.DB).forEach(function (k) { if (typeof window.DB[k] === 'function' && k !== 'err') window.DB[k] = function () { return Promise.reject(new Error(msg)); }; });
    window.DB.onAuth = function (cb) { cb(false); };
  }
})();
