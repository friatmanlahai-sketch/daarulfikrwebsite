/* Portal Pengajar — kontrol santri (daftar, absensi, hafalan, rekap, rapor, akun).
   Memakai window.DB (db.js) dan window.DF (orang.js). Bekerja di mode online (Firestore) maupun demo (localStorage). */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var TZ = 'Asia/Makassar';
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function today() { try { return new Date().toLocaleDateString('sv-SE', { timeZone: TZ }); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function fmt(d) { try { return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'; } catch (e) { return d || '-'; } }
  function bulanNama(m) { try { var p = m.split('-'); return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); } catch (e) { return m; } }
  function lc(v) { return String(v || '').toLowerCase().trim(); }
  function wa(hp, teks) {
    var n = String(hp || '').replace(/\D/g, ''); if (!n) return '';
    if (n.charAt(0) === '0') n = '62' + n.slice(1); else if (n.slice(0, 2) !== '62') n = '62' + n;
    return 'https://wa.me/' + n + (teks ? '?text=' + encodeURIComponent(teks) : '');
  }
  function csvDl(nama, rows) {
    var t = '﻿' + rows.map(function (r) { return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv;charset=utf-8' })); a.download = nama; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function toast(msg, bad) {
    var t = el('div', 'ptoast' + (bad ? ' bad' : ''), msg); document.body.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 2600); setTimeout(function () { t.remove(); }, 3100);
  }
  function av(x, cls) { return (window.DF && DF.avatar) ? DF.avatar(x, cls) : el('span', cls, (x.nama || '?').charAt(0)); }
  function fillAv(root) {
    root.querySelectorAll('[data-av]').forEach(function (h) {
      var s = ST.byId[h.getAttribute('data-av')]; if (!s) return; h.textContent = ''; h.appendChild(av(s, 'sf'));
    });
  }

  var ST = { prog: '', progs: [], ctx: null, santri: [], absensi: [], hafalan: [], byId: {}, ok: false, err: '', pane: 'beranda', loaded: false, mine: false };
  var KET = ['Hadir', 'Izin', 'Sakit', 'Alpa'], KS = { Hadir: 'H', Izin: 'I', Sakit: 'S', Alpa: 'A' };
  var JENIS = ["Iqra'", 'Tahsin', 'Tahfidz'], NILAI = ['A', 'B', 'C', 'Ulang'];

  function isMine(s) { return !!ST.ctx && !!lc(s.pengajar) && ST.ctx.names.some(function (n) { return lc(n) === lc(s.pengajar); }); }
  function aktifS() { return ST.santri.filter(function (s) { return s.status === 'Diterima'; }); }
  function inProg(s) { return !ST.prog || s.program === ST.prog; }
  function aktifP() { return aktifS().filter(inProg); }
  function progKey() { return 'df_prog_' + ((ST.ctx && (ST.ctx.uid || ST.ctx.email)) || 'x'); }
  /* Menu pilihan program: daftar dari koleksi program + program yang dipakai santri */
  function rProg() {
    var b = $('progbar'); if (!b) return;
    if (ST.pane === 'akun' || !ST.ok) { b.hidden = true; return; }
    var n = {}; aktifS().forEach(function (s) { if (s.program) n[s.program] = (n[s.program] || 0) + 1; });
    var L = ST.progs.slice(); Object.keys(n).forEach(function (k) { if (L.indexOf(k) < 0) L.push(k); });
    if (ST.prog && L.indexOf(ST.prog) < 0) ST.prog = '';
    if (!L.length) { b.hidden = true; return; }
    b.hidden = false; b.innerHTML = '<span>Program</span><button type="button" data-p=""' + (!ST.prog ? ' class="on"' : '') + '>Semua <em>' + aktifS().length + '</em></button>' + L.map(function (p) { return '<button type="button" data-p="' + esc(p) + '"' + (ST.prog === p ? ' class="on"' : '') + '>' + esc(p) + ' <em>' + (n[p] || 0) + '</em></button>'; }).join('');
    b.querySelectorAll('button').forEach(function (x) {
      x.onclick = function () { ST.prog = x.dataset.p; try { localStorage.setItem(progKey(), ST.prog); } catch (e) {} rProg(); tampilPane(); };
    });
  }
  function tampilPane() { var t = ST.pane; if (t === 'beranda') ringkasan(); else if (t !== 'akun') ({ santri: rSantri, absensi: rAbsen, hafalan: rHafalan, rekap: rRekap })[t](); }
  function punyaSaya() { return aktifS().some(isMine); }
  function canDel() { return ST.ctx && ST.ctx.role === 'admin'; }
  function sorted(L) { return L.slice().sort(function (a, b) { return lc(a.nama) < lc(b.nama) ? -1 : 1; }); }
  function uniq(L, k) { var o = {}; L.forEach(function (x) { if (x[k]) o[x[k]] = 1; }); return Object.keys(o).sort(); }
  function absOf(sid, bulan) { return ST.absensi.filter(function (a) { return a.sid === sid && (!bulan || (a.tanggal || '').slice(0, 7) === bulan); }); }
  function hafOf(sid, bulan) { return ST.hafalan.filter(function (a) { return a.sid === sid && (!bulan || (a.tanggal || '').slice(0, 7) === bulan); }).sort(function (a, b) { return (a.tanggal || '') < (b.tanggal || '') ? 1 : -1; }); }
  function hit(list) { var o = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 }; list.forEach(function (a) { if (o[a.ket] != null) o[a.ket]++; }); o.n = list.length; o.pct = o.n ? Math.round(o.Hadir / o.n * 100) : null; return o; }
  function badge(t) { return '<span class="b ' + esc(t) + '">' + esc(t) + '</span>'; }

  /* ===== Muat data ===== */
  function muat(force) {
    if (ST.loaded && !force) return Promise.resolve();
    var errs = [];
    function ld(c) { return DB.list(c).catch(function (e) { errs.push(c + ': ' + ((DB.err && DB.err(e)) || e.message)); return null; }); }
    return Promise.all([ld('santri'), ld('absensi'), ld('hafalan'), DB.list('program').catch(function () { return []; })]).then(function (r) {
      ST.progs = (r[3] || []).filter(function (x) { return x && x.judul && x.aktif !== 'Tidak'; }).sort(function (a, b) { return (+a.urut || 999) - (+b.urut || 999); }).map(function (x) { return x.judul; });
      ST.ok = r[0] !== null; ST.err = errs.join(' · ');
      ST.santri = r[0] || []; ST.absensi = r[1] || []; ST.hafalan = r[2] || [];
      ST.byId = {}; ST.santri.forEach(function (s) { ST.byId[s.id] = s; });
      ST.loaded = true;
    });
  }
  function pesanGagal() {
    return '<div class="pkos">⚠️ Data santri belum bisa dimuat.' + (ST.err ? '<br><small>' + esc(ST.err) + '</small>' : '') + '<br><small>Admin perlu menempel dan Publish file <b>firestore-pengajar.rules</b> di Firebase agar pengajar boleh membaca santri, absensi, dan hafalan.</small></div>';
  }

  /* ===== Tab ===== */
  function pasangTab() {
    var tabs = $('tabs'); if (tabs.dataset.on) return; tabs.dataset.on = 1;
    tabs.addEventListener('click', function (e) { var b = e.target.closest('button[data-t]'); if (b) buka(b.dataset.t); });
    window.addEventListener('hashchange', function () { var h = location.hash.slice(1); if (h && $('p-' + h) && ST.ctx) buka(h, true); });
  }
  function buka(t, nohash) {
    ST.pane = t;
    document.querySelectorAll('#tabs button').forEach(function (b) { var on = b.dataset.t === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    document.querySelectorAll('.tp').forEach(function (p) { p.hidden = p.id !== 'p-' + t; });
    if (!nohash) { try { history.replaceState(null, '', '#' + t); } catch (e) {} }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (t === 'akun') { rProg(); rAkun(); return; }
    muat().then(function () { rProg(); tampilPane(); });
  }

  /* ===== Ringkasan Beranda ===== */
  function ringkasan() {
    var h = $('psb'); if (!h) return;
    if (!ST.ok) { h.innerHTML = '<div class="gl pn">' + pesanGagal() + '</div>'; return; }
    var A = aktifP(), td = today(), bl = td.slice(0, 7), ctx = ST.ctx;
    var sc = A.filter(isMine).length ? A.filter(isMine) : A, scId = {}; sc.forEach(function (s) { scId[s.id] = 1; });
    var hadir = ST.absensi.filter(function (a) { return a.tanggal === td && a.ket === 'Hadir' && scId[a.sid]; }).length;
    var sudah = {}; ST.absensi.forEach(function (a) { if (a.tanggal === td) sudah[a.sid] = 1; });
    var belum = sc.filter(function (s) { return !sudah[s.id]; }).length;
    var setor = ST.hafalan.filter(function (x) { return (x.tanggal || '').slice(0, 7) === bl && scId[x.sid]; }).length;
    var menunggu = ST.santri.filter(function (s) { return s.status === 'Menunggu'; }).length;
    var cards = [['🧑‍🎓', sc.length, punyaSaya() ? 'Santri saya' : 'Santri aktif', 'santri'], ['🕌', hadir, 'Hadir hari ini', 'absensi'], ['📋', belum, 'Belum diabsen hari ini', 'absensi'], ['📖', setor, 'Setoran bulan ini', 'hafalan']];
    if (ctx.role === 'admin' || ctx.role === 'kepala') cards.push(['⏳', menunggu, 'Menunggu verifikasi', 'santri']);
    // perlu perhatian
    var perlu = [];
    sc.forEach(function (s) {
      var a = hit(absOf(s.id, bl)), hf = hafOf(s.id), why = [];
      if (a.Alpa >= 2) why.push('Alpa ' + a.Alpa + '× bulan ini');
      if (a.n >= 3 && a.pct < 70) why.push('Kehadiran ' + a.pct + '%');
      var last = hf[0] && hf[0].tanggal; var gap = last ? Math.floor((Date.now() - new Date(last).getTime()) / 864e5) : null;
      if (gap == null) why.push('Belum pernah setor'); else if (gap > 14) why.push('Terakhir setor ' + gap + ' hari lalu');
      if (why.length) perlu.push({ s: s, why: why.join(' · ') });
    });
    // ulang tahun pekan ini
    var ult = [], now = new Date();
    sc.forEach(function (s) {
      if (!s.lahir) return; var d = new Date(s.lahir); if (isNaN(d)) return;
      var n = new Date(now.getFullYear(), d.getMonth(), d.getDate()), diff = Math.round((n - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
      if (diff >= 0 && diff <= 7) ult.push({ s: s, diff: diff, umur: now.getFullYear() - d.getFullYear() });
    });
    ult.sort(function (a, b) { return a.diff - b.diff; });
    h.innerHTML = '<div class="sts">' + cards.map(function (c, i) { return '<a href="#' + c[3] + '" class="gl st stl" style="--d:' + i + '"><i>' + c[0] + '</i><b>' + c[1] + '</b><span>' + c[2] + '</span></a>'; }).join('') + '</div>'
      + '<div class="gr"><div class="gl pn c7"><h3>⚠️ Perlu Perhatian</h3>' + (perlu.length ? '<ul class="pg ppr">' + perlu.slice(0, 8).map(function (p, i) { return '<li data-i="' + i + '"><b>' + esc(p.s.nama) + '</b><span class="pm">' + esc(p.why) + '</span></li>'; }).join('') + '</ul>' + (perlu.length > 8 ? '<p class="kos">+' + (perlu.length - 8) + ' santri lainnya — lihat tab Rekap.</p>' : '') : '<p class="kos">Tidak ada santri yang perlu perhatian khusus. Alhamdulillah 🌿</p>') + '</div>'
      + '<div class="gl pn c5"><h3>🎂 Ulang Tahun Santri</h3>' + (ult.length ? '<ul class="pg">' + ult.map(function (u) { return '<li><b>' + esc(u.s.nama) + '</b><span class="pm">' + (u.diff === 0 ? 'Hari ini' : u.diff + ' hari lagi') + ' · ' + u.umur + ' tahun</span></li>'; }).join('') + '</ul>' : '<p class="kos">Tidak ada ulang tahun dalam 7 hari ke depan.</p>') + '</div></div>';
    h.querySelectorAll('.ppr li').forEach(function (li) { li.style.cursor = 'pointer'; li.onclick = function () { detail(perlu[+li.dataset.i].s.id); }; });
  }

  /* ===== Modal ===== */
  function modal(html, cls) {
    var old = $('psm'); if (old) old.remove();
    var m = el('div', 'pmo'); m.id = 'psm'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="pmb ' + (cls || '') + '"><button type="button" class="pmx" aria-label="Tutup">✕</button>' + html + '</div>';
    document.body.appendChild(m); document.body.style.overflow = 'hidden';
    function tutup() { m.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', esck); }
    function esck(e) { if (e.key === 'Escape') tutup(); }
    m.addEventListener('mousedown', function (e) { if (e.target === m) tutup(); });
    m.querySelector('.pmx').onclick = tutup; document.addEventListener('keydown', esck); m.close = tutup;
    return m;
  }

  /* ===== Santri ===== */
  var F = { q: '', prog: '', pj: '', st: 'Diterima', mine: null };
  function filterS() {
    var q = lc(F.q), mine = F.mine == null ? punyaSaya() : F.mine;
    return sorted(ST.santri.filter(function (s) {
      if (F.st && s.status !== F.st) return false;
      if (!inProg(s)) return false;
      if (F.pj && s.pengajar !== F.pj) return false;
      if (mine && !isMine(s)) return false;
      if (q && (lc(s.nama) + ' ' + lc(s.ortu) + ' ' + lc(s.no) + ' ' + lc(s.hp)).indexOf(q) < 0) return false;
      return true;
    }));
  }
  function opt(L, sel, all) { return '<option value="">' + all + '</option>' + L.map(function (v) { return '<option' + (v === sel ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join(''); }
  function rSantri() {
    var p = $('p-santri'), adm = ST.ctx.role === 'admin' || ST.ctx.role === 'kepala', mine = F.mine == null ? punyaSaya() : F.mine;
    if (!ST.ok) { p.innerHTML = '<div class="gl pn">' + pesanGagal() + '</div>'; return; }
    p.innerHTML = '<div class="gl pn"><div class="rh"><h3>🧑‍🎓 Data Santri</h3><button class="tb" type="button" id="sx">⬇ CSV</button></div>'
      + '<div class="ftr"><input class="cari" id="sq" type="search" placeholder="Cari nama, orang tua, no. pendaftaran…" value="' + esc(F.q) + '" aria-label="Cari santri">'
      + '<select id="sj" aria-label="Pengajar">' + opt(uniq(ST.santri, 'pengajar'), F.pj, 'Semua pengajar') + '</select>'
      + '<select id="ss" aria-label="Status"><option value="Diterima"' + (F.st === 'Diterima' ? ' selected' : '') + '>Aktif (Diterima)</option>' + (adm ? '<option value="Menunggu"' + (F.st === 'Menunggu' ? ' selected' : '') + '>Menunggu</option><option value="Ditolak"' + (F.st === 'Ditolak' ? ' selected' : '') + '>Ditolak</option>' : '') + '<option value=""' + (F.st === '' ? ' selected' : '') + '>Semua status</option></select>'
      + '<label class="ck"><input type="checkbox" id="sm"' + (mine ? ' checked' : '') + '> Santri saya saja</label></div>'
      + '<p class="kos" id="sn" style="margin:8px 0 12px"></p><div class="sg" id="sgl"></div></div>';
    function gambar() {
      var L = filterS(), bl = today().slice(0, 7), g = $('sgl'); $('sn').textContent = L.length + ' santri ditemukan';
      if (!L.length) { g.innerHTML = '<p class="kos">Tidak ada santri yang cocok dengan filter.</p>'; return; }
      g.innerHTML = L.map(function (s) {
        var a = hit(absOf(s.id, bl)), hf = hafOf(s.id)[0];
        return '<button type="button" class="gl sc" data-id="' + esc(s.id) + '"><span class="avh" data-av="' + esc(s.id) + '"></span><b>' + esc(s.nama) + '</b><small>' + esc([s.program, s.level].filter(Boolean).join(' · ') || '—') + '</small>'
          + '<span class="scm">' + (a.pct == null ? 'Belum ada absensi' : 'Hadir ' + a.pct + '%') + ' · ' + (hf ? 'Setor: ' + esc(hf.materi || hf.jenis) : 'Belum setor') + '</span>' + (s.kesehatan ? '<span class="sk" title="' + esc(s.kesehatan) + '">⚕ catatan kesehatan</span>' : '') + (s.status !== 'Diterima' ? badge(s.status) : '') + '</button>';
      }).join('');
      fillAv(g); g.querySelectorAll('.sc').forEach(function (b) { b.onclick = function () { detail(b.dataset.id); }; });
    }
    var tm; $('sq').oninput = function () { F.q = this.value; clearTimeout(tm); tm = setTimeout(gambar, 120); };
    $('sj').onchange = function () { F.pj = this.value; gambar(); };
    $('ss').onchange = function () { F.st = this.value; gambar(); }; $('sm').onchange = function () { F.mine = this.checked; gambar(); };
    $('sx').onclick = function () {
      var bl = today().slice(0, 7), rows = [['No', 'Nama', 'JK', 'Tanggal lahir', 'Program', 'Level', 'Pengajar', 'Orang tua', 'WhatsApp', 'Status', '% Hadir bulan ini', 'Kesehatan']];
      filterS().forEach(function (s) { var a = hit(absOf(s.id, bl)); rows.push([s.no, s.nama, s.jk, s.lahir, s.program, s.level, s.pengajar, s.ortu, s.hp, s.status, a.pct == null ? '' : a.pct + '%', s.kesehatan]); });
      csvDl('santri-' + today() + '.csv', rows);
    };
    gambar();
  }

  /* ===== Detail santri ===== */
  function detail(id, tab) {
    var s = ST.byId[id]; if (!s) return;
    var bl = today().slice(0, 7), a = hit(absOf(id, bl)), at = hit(absOf(id)), link = wa(s.hp, 'Assalamu\'alaikum, ' + (s.ortu || 'Bapak/Ibu') + '. Kami dari Rumah Quran Daarul Fikr terkait ananda ' + s.nama + '.');
    var m = modal('<div class="dh"><span class="avh big" id="dav"></span><div><h3 style="margin:0">' + esc(s.nama) + '</h3><div class="pm2">' + esc([s.program, s.level, s.pengajar && 'Pengajar: ' + s.pengajar].filter(Boolean).join(' · ')) + '</div>' + badge(s.status || '-') + '</div></div>'
      + '<div class="dtabs" id="dtb"><button data-d="pf" class="on">Profil</button><button data-d="kh">Kehadiran</button><button data-d="hf">Hafalan</button></div><div id="dbody"></div>'
      + '<div class="dact"><button class="tb" id="dab">🕌 Absen hari ini</button><button class="tb" id="dhf">📖 Setor hafalan</button><button class="tb" id="dpr">🖨 Rapor</button>' + (link ? '<a class="tb" target="_blank" rel="noopener" href="' + esc(link) + '">💬 WhatsApp ortu</a>' : '') + '</div>', 'wide');
    $('dav').appendChild(av(s, 'sf'));
    function tampil(t) {
      m.querySelectorAll('#dtb button').forEach(function (b) { b.classList.toggle('on', b.dataset.d === t); });
      var b = $('dbody'), h = '';
      if (t === 'pf') {
        var rows = [['Nama lengkap', s.nama], ['No. pendaftaran', s.no], ['Jenis kelamin', s.jk], ['Tempat, tgl lahir', [s.tempat, s.lahir && fmt(s.lahir)].filter(Boolean).join(', ')], ['Gol. darah', s.goldar], ['Sekolah / kelas', [s.sekolah, s.kelas].filter(Boolean).join(' · ')], ['Orang tua / wali', s.ortu], ['Ayah / Ibu', [s.ayah, s.ibu].filter(Boolean).join(' / ')], ['Pekerjaan ortu', s.pekerjaan], ['WhatsApp', s.hp], ['Alamat', [s.alamat, s.rtrw && 'RT/RW ' + s.rtrw, s.desa, s.kec, s.kab].filter(Boolean).join(', ')]];
        h = (s.kesehatan ? '<div class="warn">⚕ <b>Riwayat penyakit / alergi:</b> ' + esc(s.kesehatan) + '</div>' : '')
          + '<table class="tbl dt">' + rows.filter(function (r) { return r[1]; }).map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>'
          + '<div class="fm"><label>Level kemampuan membaca<input id="dlv" value="' + esc(s.level || '') + '" placeholder="mis. Iqra\' 3 / Juz 30"></label><label>Catatan pengajar<textarea id="dcg" rows="3" placeholder="Perkembangan, kebiasaan, hal yang perlu diperhatikan…">' + esc(s.catatanGuru || '') + '</textarea></label><button class="lgb" id="dsv" type="button" style="width:auto;padding:10px 22px">Simpan catatan</button></div>';
      } else if (t === 'kh') {
        var L = absOf(id).sort(function (x, y) { return (x.tanggal || '') < (y.tanggal || '') ? 1 : -1; });
        h = '<div class="stg">' + KET.map(function (k) { return '<div class="st2"><b>' + at[k] + '</b><span>' + k + '</span></div>'; }).join('') + '<div class="st2"><b>' + (at.pct == null ? '-' : at.pct + '%') + '</b><span>Kehadiran</span></div></div><p class="kos" style="margin:6px 0">Bulan ini: ' + (a.pct == null ? 'belum ada data' : 'Hadir ' + a.Hadir + ' dari ' + a.n + ' pertemuan (' + a.pct + '%)') + '</p>'
          + (L.length ? '<div class="scr"><table class="tbl dt">' + L.slice(0, 60).map(function (x) { return '<tr><td>' + fmt(x.tanggal) + '</td><td>' + badge(x.ket) + (x.oleh === 'Orang tua' ? ' <small class="kos">via ortu</small>' : '') + '</td><td>' + esc(x.catatan || '') + '</td></tr>'; }).join('') + '</table></div>' : '<p class="kos">Belum ada riwayat absensi.</p>');
      } else {
        var H = hafOf(id);
        h = H.length ? '<div class="scr"><table class="tbl dt">' + H.slice(0, 60).map(function (x) { return '<tr><td>' + fmt(x.tanggal) + '</td><td>' + esc(x.jenis || '') + ' — <b>' + esc(x.materi || '') + '</b>' + (x.catatan ? '<br><small class="kos">' + esc(x.catatan) + '</small>' : '') + '</td><td>' + (x.nilai ? badge(x.nilai) : '') + '</td></tr>'; }).join('') + '</table></div>' : '<p class="kos">Belum ada setoran hafalan / bacaan.</p>';
      }
      b.innerHTML = h;
      if (t === 'pf') $('dsv').onclick = function () {
        var btn = this; btn.disabled = true;
        DB.set('santri', id, { level: $('dlv').value.trim(), catatanGuru: $('dcg').value.trim() }).then(function () { s.level = $('dlv').value.trim(); s.catatanGuru = $('dcg').value.trim(); toast('Catatan tersimpan ✓'); }).catch(function (e) { toast((DB.err && DB.err(e)) || 'Gagal menyimpan', 1); }).then(function () { btn.disabled = false; });
      };
    }
    m.querySelectorAll('#dtb button').forEach(function (b) { b.onclick = function () { tampil(b.dataset.d); }; });
    $('dab').onclick = function () { m.close(); formAbsenCepat(s); };
    $('dhf').onclick = function () { m.close(); formHafalan(s.id); };
    $('dpr').onclick = function () { rapor(id); };
    tampil(tab || 'pf');
  }
  function formAbsenCepat(s) {
    var td = today(), ada = ST.absensi.filter(function (a) { return a.sid === s.id && a.tanggal === td; })[0];
    var m = modal('<h3 style="margin:0 0 4px">Absen — ' + esc(s.nama) + '</h3><p class="kos" style="margin:0 0 12px">' + fmt(td) + (ada ? ' · sudah tercatat: ' + esc(ada.ket) : '') + '</p><div class="chips" id="qc">' + KET.map(function (k) { return '<button type="button" class="chip ' + k + (ada && ada.ket === k ? ' on' : '') + '" data-k="' + k + '">' + k + '</button>'; }).join('') + '</div><label class="fl">Catatan (opsional)<input id="qn" value="' + esc(ada ? ada.catatan || '' : '') + '"></label><button class="lgb" id="qs" type="button">Simpan</button>');
    var pilih = ada ? ada.ket : ''; m.querySelectorAll('.chip').forEach(function (c) { c.onclick = function () { pilih = c.dataset.k; m.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('on', x === c); }); }; });
    $('qs').onclick = function () {
      if (!pilih) { toast('Pilih kehadiran dulu', 1); return; } var b = this; b.disabled = true;
      simpanAbsen(s, td, pilih, $('qn').value.trim(), ada).then(function () { toast('Absensi tersimpan ✓'); m.close(); if (ST.pane === 'beranda') ringkasan(); }).catch(function (e) { toast((DB.err && DB.err(e)) || 'Gagal', 1); b.disabled = false; });
    };
  }
  function simpanAbsen(s, tgl, ket, cat, ada) {
    var o = { tanggal: tgl, sid: s.id, snama: s.nama, ket: ket, catatan: cat || '', oleh: ST.ctx.nama };
    if (ada) { return DB.set('absensi', ada.id, { ket: ket, catatan: cat || '', oleh: ST.ctx.nama }).then(function () { ada.ket = ket; ada.catatan = cat || ''; ada.oleh = ST.ctx.nama; }); }
    return DB.add('absensi', o).then(function (id) { o.id = id; ST.absensi.push(o); });
  }

  /* ===== Absensi massal ===== */
  var AB = { tgl: null, prog: '', mine: null, pick: {}, note: {} };
  function rAbsen() {
    var p = $('p-absensi'); if (!ST.ok) { p.innerHTML = '<div class="gl pn">' + pesanGagal() + '</div>'; return; }
    AB.tgl = AB.tgl || today(); var mine = AB.mine == null ? punyaSaya() : AB.mine;
    p.innerHTML = '<div class="gl pn"><div class="rh"><h3>🕌 Absensi Santri</h3></div><div class="ftr"><input type="date" id="at" value="' + esc(AB.tgl) + '" aria-label="Tanggal"><label class="ck"><input type="checkbox" id="am"' + (mine ? ' checked' : '') + '> Santri saya saja</label><button class="tb" id="aall" type="button">✓ Semua hadir</button></div><div class="stg" id="asum"></div><div id="alist"></div><div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="lgb" id="asv" type="button" style="width:auto;padding:12px 30px">Simpan absensi</button><span class="kos" id="ast"></span></div></div>';
    function daftar() { var mn = AB.mine == null ? punyaSaya() : AB.mine; return sorted(aktifS().filter(function (s) { return inProg(s) && (!mn || isMine(s)); })); }
    function exist(sid) { return ST.absensi.filter(function (a) { return a.sid === sid && a.tanggal === AB.tgl; })[0]; }
    function gambar() {
      var L = daftar(), box = $('alist');
      if (!L.length) { box.innerHTML = '<p class="kos">Tidak ada santri aktif untuk filter ini.</p>'; hitungSum(); return; }
      box.innerHTML = L.map(function (s) {
        var ex = exist(s.id), cur = AB.pick[s.id] || (ex && ex.ket) || '';
        return '<div class="arw" data-s="' + esc(s.id) + '"><span class="avh" data-av="' + esc(s.id) + '"></span><div class="arn"><b>' + esc(s.nama) + '</b>' + (ex && ex.oleh === 'Orang tua' ? '<small class="kos"> · izin dari orang tua</small>' : '') + (s.kesehatan ? ' <span class="sk" title="' + esc(s.kesehatan) + '">⚕</span>' : '') + '</div><div class="chips">' + KET.map(function (k) { return '<button type="button" class="chip ' + k + (cur === k ? ' on' : '') + '" data-k="' + k + '" aria-label="' + k + '">' + KS[k] + '</button>'; }).join('') + '</div><input class="arc" placeholder="Catatan" value="' + esc(AB.note[s.id] != null ? AB.note[s.id] : (ex ? ex.catatan || '' : '')) + '"></div>';
      }).join('');
      fillAv(box);
      box.querySelectorAll('.arw').forEach(function (r) {
        var sid = r.dataset.s;
        r.querySelectorAll('.chip').forEach(function (c) { c.onclick = function () { AB.pick[sid] = c.dataset.k; r.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('on', x === c); }); hitungSum(); }; });
        r.querySelector('.arc').oninput = function () { AB.note[sid] = this.value; };
      });
      hitungSum();
    }
    function hitungSum() {
      var o = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, '-': 0 };
      daftar().forEach(function (s) { var ex = exist(s.id), c = AB.pick[s.id] || (ex && ex.ket) || '-'; o[c]++; });
      $('asum').innerHTML = KET.map(function (k) { return '<div class="st2"><b>' + o[k] + '</b><span>' + k + '</span></div>'; }).join('') + '<div class="st2"><b>' + o['-'] + '</b><span>Belum diisi</span></div>';
    }
    $('at').onchange = function () { AB.tgl = this.value || today(); AB.pick = {}; AB.note = {}; gambar(); };
    $('am').onchange = function () { AB.mine = this.checked; gambar(); };
    $('aall').onclick = function () { daftar().forEach(function (s) { AB.pick[s.id] = 'Hadir'; }); gambar(); };
    $('asv').onclick = function () {
      var b = this, L = daftar(), jobs = [], n = 0; b.disabled = true; $('ast').textContent = 'Menyimpan…';
      L.forEach(function (s) {
        var ex = exist(s.id), k = AB.pick[s.id], cat = (AB.note[s.id] != null ? AB.note[s.id] : (ex ? ex.catatan || '' : '')).trim();
        if (!k) return; if (ex && ex.ket === k && (ex.catatan || '') === cat) return;
        n++; jobs.push(simpanAbsen(s, AB.tgl, k, cat, ex));
      });
      if (!n) { $('ast').textContent = 'Tidak ada perubahan untuk disimpan.'; b.disabled = false; return; }
      Promise.all(jobs).then(function () { AB.pick = {}; AB.note = {}; $('ast').textContent = ''; toast(n + ' absensi tersimpan ✓'); gambar(); }).catch(function (e) { $('ast').textContent = ''; toast((DB.err && DB.err(e)) || 'Sebagian gagal disimpan', 1); }).then(function () { b.disabled = false; });
    };
    gambar();
  }

  /* ===== Hafalan ===== */
  var HF = { sid: '', jenis: '', bln: '' };
  function formHafalan(sid) {
    var A = sorted(aktifP()), mine = A.filter(isMine), pil = mine.length ? mine : A;
    var m = modal('<h3 style="margin:0 0 12px">📖 Setoran Hafalan / Bacaan</h3><div class="fm"><label>Tanggal<input type="date" id="hfT" value="' + today() + '"></label><label>Santri<select id="hfS">' + pil.map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === sid ? ' selected' : '') + '>' + esc(s.nama) + '</option>'; }).join('') + (sid && !pil.some(function (s) { return s.id === sid; }) && ST.byId[sid] ? '<option value="' + esc(sid) + '" selected>' + esc(ST.byId[sid].nama) + '</option>' : '') + '</select></label><label>Jenis<select id="hfJ">' + JENIS.map(function (j) { return '<option>' + esc(j) + '</option>'; }).join('') + '</select></label><label>Materi (jilid/surah/ayat)<input id="hfM" placeholder="mis. Iqra\' 2 hal. 14 / An-Naba 1–10"></label><label>Nilai<select id="hfN">' + NILAI.map(function (j) { return '<option>' + j + '</option>'; }).join('') + '</select></label><label>Catatan<input id="hfC"></label><button class="lgb" id="hfV" type="button">Simpan setoran</button></div>');
    $('hfV').onclick = function () {
      var s = ST.byId[$('hfS').value], mt = $('hfM').value.trim(); if (!s) { toast('Pilih santri', 1); return; } if (!mt) { toast('Isi materi setoran', 1); $('hfM').focus(); return; }
      var b = this, o = { tanggal: $('hfT').value || today(), sid: s.id, snama: s.nama, jenis: $('hfJ').value, materi: mt, nilai: $('hfN').value, catatan: $('hfC').value.trim(), oleh: ST.ctx.nama }; b.disabled = true;
      DB.add('hafalan', o).then(function (id) { o.id = id; ST.hafalan.push(o); toast('Setoran tersimpan ✓'); m.close(); if (ST.pane === 'hafalan') rHafalan(); else if (ST.pane === 'beranda') ringkasan(); }).catch(function (e) { toast((DB.err && DB.err(e)) || 'Gagal menyimpan', 1); b.disabled = false; });
    };
    setTimeout(function () { var i = $('hfM'); if (i) i.focus(); }, 50);
  }
  function rHafalan() {
    var p = $('p-hafalan'); if (!ST.ok) { p.innerHTML = '<div class="gl pn">' + pesanGagal() + '</div>'; return; }
    p.innerHTML = '<div class="gl pn"><div class="rh"><h3>📖 Hafalan &amp; Bacaan</h3><button class="tb" id="hn" type="button">+ Catat setoran</button><button class="tb" id="hx" type="button">⬇ CSV</button></div><div class="ftr"><select id="hs">' + '<option value="">Semua santri</option>' + sorted(aktifP()).map(function (s) { return '<option value="' + esc(s.id) + '"' + (HF.sid === s.id ? ' selected' : '') + '>' + esc(s.nama) + '</option>'; }).join('') + '</select><select id="hjn"><option value="">Semua jenis</option>' + JENIS.map(function (j) { return '<option' + (HF.jenis === j ? ' selected' : '') + '>' + esc(j) + '</option>'; }).join('') + '</select><input type="month" id="hb" value="' + esc(HF.bln) + '" aria-label="Bulan"></div><p class="kos" id="hc" style="margin:8px 0"></p><div class="scr" id="hl"></div></div>';
    function data() { return ST.hafalan.filter(function (x) { var sx = ST.byId[x.sid]; return (!ST.prog || (sx && sx.program === ST.prog)) && (!HF.sid || x.sid === HF.sid) && (!HF.jenis || x.jenis === HF.jenis) && (!HF.bln || (x.tanggal || '').slice(0, 7) === HF.bln); }).sort(function (a, b) { return (a.tanggal || '') < (b.tanggal || '') ? 1 : -1; }); }
    function gambar() {
      var L = data(); $('hc').textContent = L.length + ' setoran';
      $('hl').innerHTML = L.length ? '<table class="tbl dt"><thead><tr><th>Tanggal</th><th>Santri</th><th>Jenis</th><th>Materi</th><th>Nilai</th><th>Catatan</th>' + (canDel() ? '<th></th>' : '') + '</tr></thead><tbody>' + L.slice(0, 200).map(function (x) { return '<tr><td>' + fmt(x.tanggal) + '</td><td>' + esc(x.snama || (ST.byId[x.sid] || {}).nama || '') + '</td><td>' + esc(x.jenis || '') + '</td><td><b>' + esc(x.materi || '') + '</b></td><td>' + (x.nilai ? badge(x.nilai) : '') + '</td><td>' + esc(x.catatan || '') + (x.oleh ? '<br><small class="kos">' + esc(x.oleh) + '</small>' : '') + '</td>' + (canDel() ? '<td><button class="xd" data-id="' + esc(x.id) + '" aria-label="Hapus">🗑</button></td>' : '') + '</tr>'; }).join('') + '</tbody></table>' : '<p class="kos">Belum ada setoran untuk filter ini.</p>';
      $('hl').querySelectorAll('.xd').forEach(function (b) { b.onclick = function () { if (!confirm('Hapus setoran ini?')) return; DB.del('hafalan', b.dataset.id).then(function () { ST.hafalan = ST.hafalan.filter(function (x) { return x.id !== b.dataset.id; }); gambar(); }).catch(function (e) { toast((DB.err && DB.err(e)) || 'Gagal', 1); }); }; });
    }
    $('hs').onchange = function () { HF.sid = this.value; gambar(); }; $('hjn').onchange = function () { HF.jenis = this.value; gambar(); }; $('hb').onchange = function () { HF.bln = this.value; gambar(); };
    $('hn').onclick = function () { formHafalan(HF.sid); };
    $('hx').onclick = function () { var r = [['Tanggal', 'Santri', 'Jenis', 'Materi', 'Nilai', 'Catatan', 'Oleh']]; data().forEach(function (x) { r.push([x.tanggal, x.snama, x.jenis, x.materi, x.nilai, x.catatan, x.oleh]); }); csvDl('hafalan-' + today() + '.csv', r); };
    gambar();
  }

  /* ===== Rekap bulanan ===== */
  var RK = { bln: null, mine: null };
  function rekapData() {
    var bl = RK.bln, mine = RK.mine == null ? punyaSaya() : RK.mine;
    return sorted(aktifP().filter(function (s) { return !mine || isMine(s); })).map(function (s) {
      var a = hit(absOf(s.id, bl)), hf = hafOf(s.id, bl), last = hf[0];
      var nv = hf.filter(function (x) { return x.nilai; }), ul = hf.filter(function (x) { return x.nilai === 'Ulang'; }).length;
      return { s: s, a: a, n: hf.length, last: last, ul: ul, warn: (a.Alpa >= 2) || (a.n >= 3 && a.pct < 70) || hf.length === 0 };
    });
  }
  function rRekap() {
    var p = $('p-rekap'); if (!ST.ok) { p.innerHTML = '<div class="gl pn">' + pesanGagal() + '</div>'; return; }
    RK.bln = RK.bln || today().slice(0, 7); var mine = RK.mine == null ? punyaSaya() : RK.mine;
    p.innerHTML = '<div class="gl pn"><div class="rh"><h3>📊 Rekap Bulanan</h3><button class="tb" id="rx" type="button">⬇ CSV</button><button class="tb" id="rp" type="button">🖨 Cetak</button></div><div class="ftr"><input type="month" id="rb" value="' + esc(RK.bln) + '"><label class="ck"><input type="checkbox" id="rm"' + (mine ? ' checked' : '') + '> Santri saya saja</label></div><p class="kos" id="rt" style="margin:8px 0"></p><div class="scr" id="rl"></div></div>';
    function gambar() {
      var L = rekapData(); $('rt').textContent = bulanNama(RK.bln) + ' · ' + L.length + ' santri · baris berwarna kuning = perlu perhatian';
      $('rl').innerHTML = L.length ? '<table class="tbl dt rkt"><thead><tr><th>Santri</th><th>H</th><th>I</th><th>S</th><th>A</th><th>% Hadir</th><th>Setoran</th><th>Terakhir</th></tr></thead><tbody>' + L.map(function (r) { return '<tr class="' + (r.warn ? 'wr' : '') + '" data-id="' + esc(r.s.id) + '"><td><b>' + esc(r.s.nama) + '</b><br><small class="kos">' + esc(r.s.program || '') + '</small></td><td>' + r.a.Hadir + '</td><td>' + r.a.Izin + '</td><td>' + r.a.Sakit + '</td><td>' + r.a.Alpa + '</td><td>' + (r.a.pct == null ? '-' : r.a.pct + '%') + '</td><td>' + r.n + (r.ul ? ' <small>(' + r.ul + ' ulang)</small>' : '') + '</td><td>' + (r.last ? esc(r.last.materi || r.last.jenis) + ' ' + (r.last.nilai ? badge(r.last.nilai) : '') : '-') + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="kos">Tidak ada data.</p>';
      $('rl').querySelectorAll('tbody tr').forEach(function (tr) { tr.style.cursor = 'pointer'; tr.onclick = function () { detail(tr.dataset.id, 'kh'); }; });
    }
    $('rb').onchange = function () { RK.bln = this.value || today().slice(0, 7); gambar(); }; $('rm').onchange = function () { RK.mine = this.checked; gambar(); };
    $('rx').onclick = function () { var r = [['Santri', 'Program', 'Hadir', 'Izin', 'Sakit', 'Alpa', '% Hadir', 'Setoran', 'Setoran terakhir', 'Nilai']]; rekapData().forEach(function (x) { r.push([x.s.nama, x.s.program, x.a.Hadir, x.a.Izin, x.a.Sakit, x.a.Alpa, x.a.pct == null ? '' : x.a.pct + '%', x.n, x.last ? x.last.materi : '', x.last ? x.last.nilai : '']); }); csvDl('rekap-' + RK.bln + '.csv', r); };
    $('rp').onclick = function () {
      var w = window.open('', '_blank'); if (!w) { toast('Izinkan pop-up untuk mencetak', 1); return; }
      w.document.write('<!doctype html><meta charset="utf-8"><title>Rekap ' + esc(bulanNama(RK.bln)) + '</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h2{margin:0}table{width:100%;border-collapse:collapse;font-size:13px;margin-top:12px}th,td{border:1px solid #999;padding:5px 7px;text-align:left}th{background:#e6efe9}</style><h2>Rumah Quran dan Literasi Daarul Fikr</h2><p>Rekap kehadiran &amp; setoran — ' + esc(bulanNama(RK.bln)) + ' · Pengajar: ' + esc(ST.ctx.nama) + '</p><table><tr><th>Santri</th><th>Program</th><th>H</th><th>I</th><th>S</th><th>A</th><th>% Hadir</th><th>Setoran</th><th>Terakhir</th></tr>' + rekapData().map(function (x) { return '<tr><td>' + esc(x.s.nama) + '</td><td>' + esc(x.s.program || '') + '</td><td>' + x.a.Hadir + '</td><td>' + x.a.Izin + '</td><td>' + x.a.Sakit + '</td><td>' + x.a.Alpa + '</td><td>' + (x.a.pct == null ? '-' : x.a.pct + '%') + '</td><td>' + x.n + '</td><td>' + esc(x.last ? (x.last.materi || '') + ' ' + (x.last.nilai || '') : '-') + '</td></tr>'; }).join('') + '</table><script>setTimeout(function(){print()},300)<\/script>');
      w.document.close();
    };
    gambar();
  }

  /* ===== Rapor ===== */
  function rapor(id) {
    var s = ST.byId[id]; if (!s) return; var w = window.open('', '_blank'); if (!w) { toast('Izinkan pop-up untuk mencetak', 1); return; }
    var bl = today().slice(0, 7), a = hit(absOf(id, bl)), at = hit(absOf(id)), H = hafOf(id).slice(0, 25);
    w.document.write('<!doctype html><meta charset="utf-8"><title>Rapor ' + esc(s.nama) + '</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111;max-width:760px;margin:auto}h2{margin:0}h3{margin:20px 0 6px;border-bottom:2px solid #c9a24a;padding-bottom:3px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #999;padding:5px 7px;text-align:left}td.k{width:34%;background:#f3f7f4;font-weight:bold}.ttd{margin-top:46px;display:flex;justify-content:space-between;font-size:13px}</style>'
      + '<h2>Rumah Quran dan Literasi Daarul Fikr</h2><div style="font-size:12px;color:#555">Desa Tolondadu, Bolaang Uki, Bolaang Mongondow Selatan</div><h3>Laporan Perkembangan Santri</h3>'
      + '<table><tr><td class="k">Nama</td><td>' + esc(s.nama) + '</td></tr><tr><td class="k">Program / Level</td><td>' + esc([s.program, s.level].filter(Boolean).join(' · ')) + '</td></tr><tr><td class="k">Pengajar</td><td>' + esc(s.pengajar || '-') + '</td></tr><tr><td class="k">Orang tua / wali</td><td>' + esc(s.ortu || '-') + '</td></tr></table>'
      + '<h3>Kehadiran</h3><p style="font-size:13px">Bulan ini (' + esc(bulanNama(bl)) + '): Hadir ' + a.Hadir + ' · Izin ' + a.Izin + ' · Sakit ' + a.Sakit + ' · Alpa ' + a.Alpa + (a.pct == null ? '' : ' — ' + a.pct + '%') + '<br>Keseluruhan: Hadir ' + at.Hadir + ' dari ' + at.n + ' pertemuan' + (at.pct == null ? '' : ' (' + at.pct + '%)') + '</p>'
      + '<h3>Hafalan &amp; Bacaan Terbaru</h3>' + (H.length ? '<table><tr><th>Tanggal</th><th>Jenis</th><th>Materi</th><th>Nilai</th><th>Catatan</th></tr>' + H.map(function (x) { return '<tr><td>' + fmt(x.tanggal) + '</td><td>' + esc(x.jenis || '') + '</td><td>' + esc(x.materi || '') + '</td><td>' + esc(x.nilai || '') + '</td><td>' + esc(x.catatan || '') + '</td></tr>'; }).join('') + '</table>' : '<p style="font-size:13px">Belum ada setoran.</p>')
      + (s.catatanGuru ? '<h3>Catatan Pengajar</h3><p style="font-size:13px;white-space:pre-wrap">' + esc(s.catatanGuru) + '</p>' : '')
      + '<div class="ttd"><div>Orang tua / wali<br><br><br>(................................)</div><div style="text-align:center">Tolondadu, ' + esc(fmt(today())) + '<br>Pengajar<br><br><br>(' + esc(ST.ctx.nama) + ')</div></div><script>setTimeout(function(){print()},300)<\/script>');
    w.document.close();
  }

  /* ===== Akun ===== */
  function rAkun() {
    var c = ST.ctx, p = $('p-akun'), nomor = (window.SITE && SITE.wa) || '', link = wa(nomor, 'Assalamu\'alaikum, saya ' + c.nama + ' (pengajar). ');
    var peran = c.role === 'admin' ? 'Admin' : c.role === 'kepala' ? 'Kepala' : 'Pengajar';
    p.innerHTML = '<div class="gr"><div class="gl pn c5"><h3>👤 Akun Saya</h3><table class="tbl dt"><tr><td>Nama</td><td>' + esc(c.nama) + '</td></tr><tr><td>Peran</td><td>' + peran + '</td></tr><tr><td>Email</td><td>' + esc(c.email || '-') + '</td></tr>' + (c.jabatan ? '<tr><td>Jabatan</td><td>' + esc(c.jabatan) + '</td></tr>' : '') + '<tr><td>Mode data</td><td>' + (DB.cloud ? 'Online (Firebase)' : 'Demo (hanya di perangkat ini)') + '</td></tr></table>'
      + (link ? '<a class="tb" style="margin-top:14px" target="_blank" rel="noopener" href="' + esc(link) + '">💬 Hubungi admin lewat WhatsApp</a>' : '') + '</div>'
      + '<div class="gl pn c7"><h3>🔒 Ganti Password</h3><form class="fm" id="gp" novalidate>' + (DB.cloud ? '' : '<label>Password lama<input type="password" id="gl" autocomplete="current-password"></label>') + '<label>Password baru (min. 6 karakter)<input type="password" id="gb" autocomplete="new-password"></label><label>Ulangi password baru<input type="password" id="gu" autocomplete="new-password"></label><p id="ge" class="kos"></p><button class="lgb" type="submit" style="width:auto;padding:11px 26px">Ubah password</button></form>'
      + (DB.cloud ? '<p class="kos" style="margin-top:12px;font-size:.82rem">Lupa password? Minta admin mengirim tautan reset ke email Anda, atau keluar lalu gunakan fitur lupa password di halaman login orang tua.</p>' : '') + '</div></div>';
    $('gp').onsubmit = function (e) {
      e.preventDefault(); var er = $('ge'), n = $('gb').value, u = $('gu').value; er.style.color = '';
      if (n.length < 6) { er.textContent = 'Password baru minimal 6 karakter.'; return; } if (n !== u) { er.textContent = 'Konfirmasi password tidak sama.'; return; }
      er.textContent = 'Menyimpan…'; DB.ganti($('gl') ? $('gl').value : '', n).then(function () { er.textContent = ''; $('gb').value = $('gu').value = ''; if ($('gl')) $('gl').value = ''; toast('Password berhasil diubah ✓'); }).catch(function (x) { er.style.color = '#ffb4bb'; er.textContent = (DB.err && DB.err(x)) || 'Gagal mengubah password.'; });
    };
  }

  /* ===== API ===== */
  window.PS = {
    init: function (ctx) {
      ctx.names = [ctx.nama]; ST.ctx = ctx; try { ST.prog = localStorage.getItem(progKey()) || ''; } catch (e) { ST.prog = ''; } ST.loaded = false; ST.mine = false; F.mine = null; AB.mine = null; RK.mine = null; pasangTab();
      var adm = ctx.role === 'admin' || ctx.role === 'kepala';
      var h = location.hash.slice(1); buka(h && $('p-' + h) ? h : 'beranda', true);
      return adm;
    },
    alias: function (n) { if (ST.ctx && n && ST.ctx.names.indexOf(n) < 0) { ST.ctx.names.push(n); if (ST.loaded && ST.pane === 'beranda') ringkasan(); } },
    reset: function () { ST.ctx = null; ST.loaded = false; ST.santri = ST.absensi = ST.hafalan = []; ST.prog = ''; ST.byId = {}; document.body.style.overflow = ''; var m = $('psm'); if (m) m.remove(); },
    refresh: function () { ST.loaded = false; buka(ST.pane, true); }
  };
})();
