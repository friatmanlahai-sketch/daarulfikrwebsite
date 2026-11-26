/* Portal Pengajar — kontrol santri: daftar santri, absensi, kontrol belajar (Iqra', Tahsin, Tahfidz, Literasi), rekap & rapor, pengumuman, profil.
   Dimuat setelah skrip utama di portal-pengajar.html. Semua teks ditulis lewat textContent. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  var TZ = 'Asia/Makassar';
  function today() { return new Date().toLocaleDateString('sv-SE', { timeZone: TZ }); }
  function bulanIni() { return today().slice(0, 7); }
  function fmt(d) { try { return d ? new Date(d + (String(d).length === 10 ? 'T00:00:00' : '')).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; } catch (e) { return d || ''; } }
  function nama(a, b) { return String(a.nama || '').localeCompare(String(b.nama || ''), 'id'); }
  function norm(t) { return String(t || '').toLowerCase(); }
  function waNo(h) { h = String(h || '').replace(/[^0-9]/g, ''); if (h.indexOf('0') === 0) h = '62' + h.slice(1); return h; }
  var KET = ['Hadir', 'Izin', 'Sakit', 'Alpa'], NILAI = ['A', 'B', 'C', 'Ulang'], JENIS = ["Iqra'", 'Tahsin', 'Tahfidz', 'Literasi'];
  var CONTOH = { "Iqra'": "mis. Iqra' 3 hal. 12", Tahsin: 'mis. Tajwid: mad thabi\'i, Al-Fatihah', Tahfidz: 'mis. An-Naba 1–10', Literasi: 'mis. Buku "Kisah Nabi" hal. 5–12 / menulis ringkasan' };
  function jenisRingkas(sid) { var r = {}; JENIS.forEach(function (j) { r[j] = 0; }); berkas(sid).forEach(function (h) { if (r[h.jenis] != null) r[h.jenis]++; }); return r; }
  /* foto: kecilkan lalu simpan ke dokumen */
  function pilihFoto(cb) { var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = function () { if (i.files && i.files[0]) cb(i.files[0]); }; i.click(); }

  var S = { san: [], abs: [], haf: [], me: null, uid: '', admin: false, ready: false, tab: 'beranda', agm: [] };
  var PJ = window.PJ = {};

  /* ===== util UI ===== */
  var tt; function toast(m, bad) { var t = $('pjt'); t.textContent = m; t.className = 'on' + (bad ? ' bad' : ''); clearTimeout(tt); tt = setTimeout(function () { t.className = ''; }, 3200); }
  function opt(sel, v, t) { var o = el('option', '', t || v); o.value = v; sel.appendChild(o); return o; }
  function chip(c, t) { return el('span', 'bd ' + c, t); }
  function mine(s) { return !!(S.me && S.me.nama && s.pengajar && norm(s.pengajar).trim() === norm(S.me.nama).trim()); }
  function adaMine() { return S.san.some(mine); }
  function absOf(sid, tgl) { return S.abs.filter(function (a) { return a.sid === sid && a.tanggal === tgl; })[0]; }
  function berkas(sid) { return S.haf.filter(function (h) { return h.sid === sid; }).sort(function (a, b) { return (b.tanggal || '') > (a.tanggal || '') ? 1 : -1; }); }
  function rekapSantri(sid, bln) {
    var r = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, n: 0 };
    S.abs.forEach(function (a) { if (a.sid === sid && (!bln || String(a.tanggal).slice(0, 7) === bln) && r[a.ket] != null) { r[a.ket]++; r.n++; } });
    r.pct = r.n ? Math.round(r.Hadir / r.n * 100) : null; return r;
  }
  function saring(L, q, saya, prog) {
    q = norm(q).trim();
    return L.filter(function (s) { return (!saya || mine(s)) && (!prog || s.program === prog) && (!q || norm([s.nama, s.kelas, s.program, s.ortu, s.pengajar, s.no].join(' ')).indexOf(q) > -1); });
  }
  function ctl(parent, id, ph, withProg) {
    var bar = el('div', 'fb'), q = el('input', 'pi'); q.type = 'search'; q.placeholder = ph || 'Cari nama santri…'; q.id = id + 'q'; q.setAttribute('aria-label', 'Cari santri'); bar.appendChild(q);
    var pg = el('select', 'pi'); pg.id = id + 'p'; pg.setAttribute('aria-label', 'Program'); opt(pg, '', 'Semua program');
    var ps = []; S.san.forEach(function (s) { if (s.program && ps.indexOf(s.program) < 0) ps.push(s.program); }); ps.sort().forEach(function (p) { opt(pg, p); }); bar.appendChild(pg);
    var lb = el('label', 'ck'), cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = id + 's'; cb.checked = adaMine(); lb.appendChild(cb); lb.appendChild(document.createTextNode(' Hanya santri saya')); bar.appendChild(lb);
    parent.appendChild(bar); return { q: q, p: pg, s: cb };
  }

  /* ===== modal ===== */
  var lastF;
  function modal(judul, build) {
    var m = $('pjm'); lastF = document.activeElement; m.textContent = '';
    var c = el('div', 'mc gl'), x = el('button', 'mx', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Tutup'); x.onclick = tutup;
    c.appendChild(x); c.appendChild(el('h3', 'mh', judul)); build(c); m.appendChild(c); m.classList.add('on'); document.body.style.overflow = 'hidden'; x.focus();
  }
  function tutup() { var m = $('pjm'); m.classList.remove('on'); m.textContent = ''; document.body.style.overflow = ''; if (lastF && lastF.focus) try { lastF.focus(); } catch (e) { } }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('pjm').classList.contains('on')) tutup(); });
  $('pjm').addEventListener('click', function (e) { if (e.target === this) tutup(); });

  /* ===== tab ===== */
  var RENDER = {};
  function buka(t) {
    S.tab = t;
    [].forEach.call(document.querySelectorAll('.tbn'), function (b) { var on = b.dataset.t === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    [].forEach.call(document.querySelectorAll('.tp'), function (p) { p.classList.toggle('on', p.id === 't-' + t); });
    if (S.ready && RENDER[t]) RENDER[t]();
    try { history.replaceState(null, '', '#' + t); } catch (e) { }
    scrollTo({ top: 0 });
  }
  PJ.buka = buka;
  /* foto + nama pengajar di bilah atas */
  window.PJ_head = function (av) {
    var old = $('hav'); if (old) old.remove();
    var k = $('kel'); if (!k || !av) return;
    var w = el('a', 'tb lb'); w.id = 'hav'; w.href = '#profil'; w.style.padding = '4px 14px 4px 5px'; w.title = 'Profil saya';
    var a = DF.avatar(av, 'sav sm'); a.style.cssText = 'width:30px;height:30px;font-size:.9rem;box-shadow:none'; w.appendChild(a);
    w.appendChild(el('span', '', String(av.nama || 'Pengajar').split(' ')[0]));
    w.onclick = function (e) { e.preventDefault(); buka('profil'); };
    k.parentNode.insertBefore(w, k);
  };
  if (window.PJ_me) window.PJ_head(window.PJ_me);
  [].forEach.call(document.querySelectorAll('.tbn,[data-go]'), function (b) { b.addEventListener('click', function () { buka(b.dataset.t || b.dataset.go); }); });

  /* ===== muat data ===== */
  function muat() {
    var ls = function (c) { return DB.list(c).catch(function (e) { toast('Gagal memuat ' + c + ': ' + DB.err(e), true); return []; }); };
    return Promise.all([ls('santri'), ls('absensi'), ls('hafalan')]).then(function (r) {
      S.san = (r[0] || []).filter(function (s) { return s.status === 'Diterima' && s.nama; }).sort(nama); S.abs = r[1] || []; S.haf = r[2] || []; S.ready = true;
    });
  }
  PJ.start = function (u, staf) {
    S.uid = (u && u.uid) || ''; S.me = staf || null; S.admin = !!(staf && staf.peran === 'Admin'); S.ready = false;
    muat().then(function () { stat(); var h = (location.hash || '').slice(1); buka(document.getElementById('t-' + h) ? h : 'beranda'); });
  };
  function stat() {
    var t = today(), wk = new Date(Date.now() - 6 * 864e5).toLocaleDateString('sv-SE', { timeZone: TZ });
    $('s1').dataset.n = S.san.length;
    $('s2').dataset.n = S.abs.filter(function (a) { return a.tanggal === t && a.ket === 'Hadir'; }).length;
    $('s3').dataset.n = S.haf.filter(function (h) { return h.tanggal >= wk && h.tanggal <= t; }).length;
    $('s4').dataset.n = S.san.filter(mine).length;
    if (window.PJ_hitung) window.PJ_hitung();
    var belum = S.san.filter(function (s) { return !absOf(s.id, t); }).length;
    var n = $('nudge'); n.textContent = '';
    if (S.san.length && belum) { var b = el('button', 'tb', '✅ ' + belum + ' santri belum diabsen hari ini — absen sekarang'); b.type = 'button'; b.onclick = function () { buka('absensi'); }; n.appendChild(b); }
  }

  /* ===== SANTRI ===== */
  RENDER.santri = function () {
    var box = $('t-santri'); box.textContent = '';
    var h = el('div', 'rh'); h.appendChild(el('h3', '', '🧑‍🎓 Daftar Santri')); var cn = el('span', 'cnt'); h.appendChild(cn); box.appendChild(h);
    var f = ctl(box, 'sn'), g = el('div', 'sg'); box.appendChild(g);
    function gambar() {
      var t = today(), L = saring(S.san, f.q.value, f.s.checked, f.p.value); g.textContent = ''; cn.textContent = L.length + ' dari ' + S.san.length + ' santri';
      if (!L.length) { g.appendChild(el('p', 'kos', S.san.length ? 'Tidak ada santri yang cocok.' : 'Belum ada santri berstatus Diterima. Terima pendaftar lewat panel admin.')); return; }
      L.forEach(function (s) {
        var c = el('button', 'gl sk'), a = absOf(s.id, t), hf = berkas(s.id)[0]; c.type = 'button';
        c.appendChild(DF.avatar(s, 'sav'));
        var b = el('div', 'sb'); b.appendChild(el('b', '', s.nama)); b.appendChild(el('small', '', [s.program, s.kelas].filter(Boolean).join(' · ') || 'Santri'));
        var m = el('div', 'smt'); m.appendChild(a ? chip('k' + a.ket, a.ket + ' hari ini') : chip('kx', 'Belum diabsen'));
        if (hf) m.appendChild(chip('kh', (hf.jenis || '') + ' ' + (hf.nilai || ''))); b.appendChild(m); c.appendChild(b);
        c.onclick = function () { detail(s); }; g.appendChild(c);
      });
    }
    ['input', 'change'].forEach(function (ev) { f.q.addEventListener(ev, gambar); f.p.addEventListener(ev, gambar); f.s.addEventListener(ev, gambar); }); gambar();
  };
  function dl(c, rows) { var d = el('dl', 'bio'); rows.forEach(function (r) { if (!r[1]) return; var w = el('div'); w.appendChild(el('dt', '', r[0])); var dd = el('dd', '', r[1]); w.appendChild(dd); d.appendChild(w); }); c.appendChild(d); return d; }
  function detail(s) {
    modal(s.nama, function (c) {
      var top = el('div', 'dtop'); top.appendChild(DF.avatar(s, 'sav big')); var tx = el('div'); tx.appendChild(el('div', 'dj', [s.program, s.kelas].filter(Boolean).join(' · '))); tx.appendChild(el('div', 'ds', 'No. ' + (s.no || '-'))); top.appendChild(tx); c.appendChild(top);
      var lahir = [s.tempat, s.lahir ? fmt(s.lahir) : ''].filter(Boolean).join(', ');
      dl(c, [['Jenis kelamin', s.jk], ['Tempat, tgl lahir', lahir], ['Sekolah', s.sekolah], ['Orang tua / wali', s.ortu], ['WhatsApp', s.hp], ['Alamat', [s.alamat, s.desa, s.kec].filter(Boolean).join(', ')], ['Pengajar', s.pengajar], ['Kemampuan membaca', s.level], ['Kesehatan / alergi', s.kesehatan], ['Catatan', s.catatan]]);
      var r = rekapSantri(s.id), rb = rekapSantri(s.id, bulanIni()), rw = el('div', 'rk4');
      KET.forEach(function (k) { var d = el('div', 'k' + k); d.appendChild(el('b', '', r[k])); d.appendChild(el('span', '', k)); rw.appendChild(d); });
      c.appendChild(el('h4', 'sh', 'Kehadiran (seluruhnya) · bulan ini ' + (rb.pct == null ? '-' : rb.pct + '%'))); c.appendChild(rw);
      var jr = jenisRingkas(s.id), jw = el('div', 'smt'); JENIS.forEach(function (j) { jw.appendChild(chip('kh', j + ': ' + jr[j])); });
      c.appendChild(el('h4', 'sh', 'Kontrol belajar (Iqra\', Tahsin, Tahfidz, Literasi)')); c.appendChild(jw);
      var hs = berkas(s.id).slice(0, 5);
      if (!hs.length) c.appendChild(el('p', 'kos', 'Belum ada catatan kontrol belajar.')); else { var ul = el('ul', 'hl2'); hs.forEach(function (h) { var li = el('li'); li.appendChild(el('span', 'tg', fmt(h.tanggal))); li.appendChild(el('b', '', [h.jenis, h.materi].filter(Boolean).join(' · '))); if (h.nilai) li.appendChild(chip('n' + h.nilai, h.nilai)); ul.appendChild(li); }); c.appendChild(ul); }
      var t = today(), a = absOf(s.id, t); c.appendChild(el('h4', 'sh', 'Absen hari ini' + (a ? ' (tercatat: ' + a.ket + ')' : '')));
      var seg = el('div', 'seg'); KET.forEach(function (k) { var b = el('button', 'k' + k + (a && a.ket === k ? ' on' : ''), k); b.type = 'button'; b.onclick = function () { simpanAbsen(s, t, k, a && a.catatan).then(function () { toast(s.nama + ': ' + k); stat(); detail(s); }, galat); }; seg.appendChild(b); }); c.appendChild(seg);
      c.appendChild(el('h4', 'sh', 'Ubah kemampuan & catatan'));
      var f = el('form', 'ef'), lv = el('input', 'pi'), ct = el('textarea', 'pi'); lv.value = s.level || ''; lv.placeholder = "Tingkat / kemampuan (mis. Iqra' 3, Tahsin, Tahfidz Juz 30, Literasi lancar)"; ct.value = s.catatan || ''; ct.rows = 2; ct.placeholder = 'Catatan perkembangan santri'; ct.maxLength = 500;
      var sv = el('button', 'tb', 'Simpan'); sv.type = 'submit'; f.appendChild(lv); f.appendChild(ct); f.appendChild(sv);
      f.onsubmit = function (e) { e.preventDefault(); sv.disabled = true; DB.set('santri', s.id, { level: lv.value.trim(), catatan: ct.value.trim() }).then(function () { s.level = lv.value.trim(); s.catatan = ct.value.trim(); toast('Tersimpan'); detail(s); }, function (er) { sv.disabled = false; galat(er); }); };
      c.appendChild(f);
      var fb2 = el('button', 'tb sm', '📷 ' + (s.foto ? 'Ganti foto' : 'Tambah foto')); fb2.type = 'button';
      fb2.onclick = function () { pilihFoto(function (file) { fb2.disabled = true; DB.fotoFile(file, 480, 0.8).then(function (u) { return DB.set('santri', s.id, { foto: u }).then(function () { s.foto = u; toast('Foto ' + s.nama + ' tersimpan ✓'); detail(s); if (S.tab === 'santri' && RENDER.santri) RENDER.santri(); }); }).catch(function (er) { fb2.disabled = false; galat(er); }); }); };
      top.appendChild(fb2);
      var ac = el('div', 'acts'), b1 = el('button', 'tb', '🎯 Kontrol santri'); b1.type = 'button'; b1.onclick = function () { tutup(); buka('hafalan'); var sl = $('hfs'); if (sl) sl.value = s.id; };
      ac.appendChild(b1);
      var w = waNo(s.hp); if (w) { var wa = el('a', 'tb', '💬 WhatsApp orang tua'); wa.href = 'https://wa.me/' + w + '?text=' + encodeURIComponent("Assalamu'alaikum, kami dari Daarul Fikr mengenai santri " + s.nama + '.'); wa.target = '_blank'; wa.rel = 'noopener'; ac.appendChild(wa); }
      c.appendChild(ac);
    });
  }
  function galat(e) { toast('Gagal: ' + (window.DB && DB.err ? DB.err(e) : (e && e.message) || e), true); }

  /* ===== ABSENSI ===== */
  function simpanAbsen(s, tgl, ket, cat) {
    var ex = absOf(s.id, tgl), d = { ket: ket, catatan: cat || '', oleh: (S.me && S.me.nama) || '', ouid: S.uid };
    if (ex) return DB.set('absensi', ex.id, d).then(function () { Object.assign(ex, d); });
    var n = Object.assign({ tanggal: tgl, sid: s.id, snama: s.nama }, d);
    return DB.add('absensi', n).then(function (id) { n.id = id; S.abs.push(n); });
  }
  RENDER.absensi = function () {
    var box = $('t-absensi'); box.textContent = '';
    var h = el('div', 'rh'); h.appendChild(el('h3', '', '✅ Absensi')); box.appendChild(h);
    var tb = el('div', 'fb'), dt = el('input', 'pi'); dt.type = 'date'; dt.value = today(); dt.max = today(); dt.setAttribute('aria-label', 'Tanggal'); tb.appendChild(dt); box.appendChild(tb);
    var f = ctl(box, 'ab'), sum = el('div', 'sumr'), lst = el('div', 'ar'), foot = el('div', 'acts'); box.appendChild(sum); box.appendChild(lst); box.appendChild(foot);
    var pilih = {}, cat = {};
    function muatTgl() { pilih = {}; cat = {}; S.san.forEach(function (s) { var a = absOf(s.id, dt.value); if (a) { pilih[s.id] = a.ket; cat[s.id] = a.catatan || ''; } }); }
    function hitung() {
      sum.textContent = ''; var c = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, belum: 0 };
      S.san.forEach(function (s) { var p = pilih[s.id]; if (p) c[p]++; else c.belum++; });
      KET.concat(['belum']).forEach(function (k) { var d = el('div', 'k' + (k === 'belum' ? 'x' : k)); d.appendChild(el('b', '', c[k])); d.appendChild(el('span', '', k === 'belum' ? 'Belum' : k)); sum.appendChild(d); });
    }
    function gambar() {
      var L = saring(S.san, f.q.value, f.s.checked, f.p.value); lst.textContent = '';
      if (!L.length) { lst.appendChild(el('p', 'kos', 'Tidak ada santri yang cocok.')); return; }
      L.forEach(function (s) {
        var r = el('div', 'gl ab'), nm = el('div', 'an'); nm.appendChild(DF.avatar(s, 'sav sm')); var tx = el('div'); tx.appendChild(el('b', '', s.nama)); tx.appendChild(el('small', '', s.program || '')); nm.appendChild(tx); r.appendChild(nm);
        var seg = el('div', 'seg'); KET.forEach(function (k) { var b = el('button', 'k' + k + (pilih[s.id] === k ? ' on' : ''), k); b.type = 'button'; b.setAttribute('aria-pressed', pilih[s.id] === k); b.onclick = function () { pilih[s.id] = k; [].forEach.call(seg.children, function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); hitung(); }; seg.appendChild(b); }); r.appendChild(seg);
        var ci = el('input', 'pi ci'); ci.placeholder = 'Catatan (opsional)'; ci.maxLength = 200; ci.value = cat[s.id] || ''; ci.oninput = function () { cat[s.id] = ci.value; }; r.appendChild(ci); lst.appendChild(r);
      });
    }
    var all = el('button', 'tb', '✔ Semua hadir'); all.type = 'button'; all.onclick = function () { saring(S.san, f.q.value, f.s.checked, f.p.value).forEach(function (s) { if (!pilih[s.id]) pilih[s.id] = 'Hadir'; }); gambar(); hitung(); };
    var sv = el('button', 'tb pr', '💾 Simpan absensi'); sv.type = 'button';
    sv.onclick = function () {
      var todo = S.san.filter(function (s) { var p = pilih[s.id], a = absOf(s.id, dt.value); return p && (!a || a.ket !== p || (a.catatan || '') !== (cat[s.id] || '')); });
      if (!todo.length) { toast('Tidak ada perubahan untuk disimpan.'); return; }
      sv.disabled = true; sv.textContent = 'Menyimpan…'; var ok = 0, gal = 0;
      todo.reduce(function (p, s) { return p.then(function () { return simpanAbsen(s, dt.value, pilih[s.id], cat[s.id]).then(function () { ok++; }, function () { gal++; }); }); }, Promise.resolve()).then(function () {
        sv.disabled = false; sv.textContent = '💾 Simpan absensi'; toast(gal ? ok + ' tersimpan, ' + gal + ' gagal (periksa izin akun).' : ok + ' absensi tersimpan ✓', !!gal); stat(); hitung();
      });
    };
    foot.appendChild(all); foot.appendChild(sv);
    dt.onchange = function () { muatTgl(); gambar(); hitung(); };
    ['input', 'change'].forEach(function (ev) { f.q.addEventListener(ev, gambar); f.p.addEventListener(ev, gambar); f.s.addEventListener(ev, gambar); });
    muatTgl(); gambar(); hitung();
  };

  /* ===== HAFALAN ===== */
  RENDER.hafalan = function () {
    var box = $('t-hafalan'); box.textContent = '';
    var h = el('div', 'rh'); h.appendChild(el('h3', '', '🎯 Kontrol Santri')); h.appendChild(el('span', 'cnt', "Iqra', Tahsin, Tahfidz & Literasi")); box.appendChild(h);
    var fm = el('form', 'gl pn hf'); box.appendChild(fm);
    function fld(lab, node) { var l = el('label', '', lab); l.appendChild(node); fm.appendChild(l); return node; }
    var tg = el('input', 'pi'); tg.type = 'date'; tg.value = today(); tg.max = today(); tg.required = true; fld('Tanggal', tg);
    var sl = el('select', 'pi'); sl.id = 'hfs'; sl.required = true; opt(sl, '', 'Pilih santri'); (adaMine() ? S.san.filter(mine).concat(S.san.filter(function (s) { return !mine(s); })) : S.san).forEach(function (s) { opt(sl, s.id, s.nama + (mine(s) ? ' ★' : '')); }); fld('Santri (★ = santri saya)', sl);
    var pv = el('div', 'dtop'); pv.style.cssText = 'grid-column:1/-1;margin:0'; fm.appendChild(pv);
    sl.onchange = function () { pv.textContent = ''; var z = S.san.filter(function (q) { return q.id === sl.value; })[0]; if (!z) return; pv.appendChild(DF.avatar(z, 'sav')); var t2 = el('div'); t2.appendChild(el('div', 'dj', z.nama)); t2.appendChild(el('div', 'ds', [z.program, z.kelas, z.level].filter(Boolean).join(' · '))); pv.appendChild(t2); };
    var jn = el('select', 'pi'); JENIS.forEach(function (j) { opt(jn, j); }); fld('Program', jn);
    var mt = el('input', 'pi'); mt.required = true; mt.maxLength = 120; mt.placeholder = CONTOH[JENIS[0]]; fld('Materi', mt);
    jn.onchange = function () { mt.placeholder = CONTOH[jn.value] || ''; };
    var nl = el('select', 'pi'); NILAI.forEach(function (n) { opt(nl, n); }); fld('Nilai', nl);
    var ct = el('input', 'pi'); ct.maxLength = 200; ct.placeholder = 'Catatan (opsional)'; fld('Catatan', ct);
    var sv = el('button', 'tb pr', '💾 Simpan kontrol'); sv.type = 'submit'; fm.appendChild(sv);
    fm.onsubmit = function (e) {
      e.preventDefault(); var s = S.san.filter(function (z) { return z.id === sl.value; })[0]; if (!s) return; sv.disabled = true;
      var d = { tanggal: tg.value, sid: s.id, snama: s.nama, jenis: jn.value, materi: mt.value.trim(), nilai: nl.value, catatan: ct.value.trim(), oleh: (S.me && S.me.nama) || '', ouid: S.uid };
      DB.add('hafalan', d).then(function (id) { d.id = id; S.haf.push(d); mt.value = ''; ct.value = ''; sv.disabled = false; toast('Kontrol ' + s.nama + ' (' + d.jenis + ') tersimpan ✓'); stat(); daftar(); }, function (er) { sv.disabled = false; galat(er); });
    };
    box.appendChild(el('h3', 'sub', 'Riwayat kontrol'));
    var fb = el('div', 'fb'), q = el('input', 'pi'); q.type = 'search'; q.placeholder = 'Cari santri atau materi…'; fb.appendChild(q); var fj = el('select', 'pi'); fj.setAttribute('aria-label', 'Program'); opt(fj, '', 'Semua program'); JENIS.forEach(function (j) { opt(fj, j); }); fb.appendChild(fj); var sa = el('label', 'ck'), cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = adaMine(); sa.appendChild(cb); sa.appendChild(document.createTextNode(' Hanya santri saya')); fb.appendChild(sa); box.appendChild(fb);
    var lst = el('div', 'hr'); box.appendChild(lst);
    function daftar() {
      var ids = {}; S.san.forEach(function (s) { ids[s.id] = s; }); var kt = norm(q.value).trim();
      var L = S.haf.filter(function (x) { return (!cb.checked || (ids[x.sid] && mine(ids[x.sid]))) && (!fj.value || x.jenis === fj.value) && (!kt || norm([x.snama, x.materi, x.jenis].join(' ')).indexOf(kt) > -1); }).sort(function (a, b) { return (b.tanggal || '') > (a.tanggal || '') ? 1 : (b.tanggal || '') < (a.tanggal || '') ? -1 : 0; }).slice(0, 40);
      lst.textContent = ''; if (!L.length) { lst.appendChild(el('p', 'kos', 'Belum ada catatan kontrol.')); return; }
      L.forEach(function (x) {
        var r = el('div', 'gl hi'), a = el('div', 'hb'); r.appendChild(DF.avatar(ids[x.sid] || { nama: x.snama }, 'sav sm')); a.appendChild(el('b', '', x.snama || '')); a.appendChild(el('small', '', fmt(x.tanggal) + ' · ' + [x.jenis, x.materi].filter(Boolean).join(' · ') + (x.catatan ? ' — ' + x.catatan : ''))); r.appendChild(a);
        if (x.nilai) r.appendChild(chip('n' + x.nilai, x.nilai));
        if (S.admin || (x.ouid && x.ouid === S.uid)) { var d = el('button', 'dx', '🗑'); d.type = 'button'; d.title = 'Hapus'; d.setAttribute('aria-label', 'Hapus setoran'); d.onclick = function () { if (!confirm('Hapus setoran ini?')) return; DB.del('hafalan', x.id).then(function () { S.haf = S.haf.filter(function (z) { return z !== x; }); toast('Dihapus'); stat(); daftar(); }, galat); }; r.appendChild(d); }
        lst.appendChild(r);
      });
    }
    q.oninput = daftar; cb.onchange = daftar; fj.onchange = daftar; daftar();
  };

  /* ===== REKAP & RAPOR ===== */
  RENDER.rekap = function () {
    var box = $('t-rekap'); box.textContent = '';
    var h = el('div', 'rh'); h.appendChild(el('h3', '', '📊 Rekap & Rapor')); box.appendChild(h);
    var fb = el('div', 'fb'), bl = el('input', 'pi'); bl.type = 'month'; bl.value = bulanIni(); bl.setAttribute('aria-label', 'Bulan'); fb.appendChild(bl); box.appendChild(fb);
    var f = ctl(box, 'rk'), wrap = el('div', 'gl pn tw2'); box.appendChild(wrap); var ac = el('div', 'acts'); box.appendChild(ac);
    var rows = [];
    function gambar() {
      var L = saring(S.san, f.q.value, f.s.checked, f.p.value); wrap.textContent = ''; rows = [];
      if (!L.length) { wrap.appendChild(el('p', 'kos', 'Tidak ada santri yang cocok.')); return; }
      var t = el('table', 'rt'), th = el('thead'), tr = el('tr'); ['Santri', 'H', 'I', 'S', 'A', '% Hadir', 'Setoran', 'Nilai terakhir', ''].forEach(function (x) { tr.appendChild(el('th', '', x)); }); th.appendChild(tr); t.appendChild(th); var tbd = el('tbody');
      L.forEach(function (s) {
        var r = rekapSantri(s.id, bl.value), hs = berkas(s.id).filter(function (x) { return String(x.tanggal).slice(0, 7) === bl.value; }), row = el('tr');
        var c0 = el('td', 'nm', s.nama); row.appendChild(c0); KET.forEach(function (k) { row.appendChild(el('td', 'k' + k, r[k])); });
        row.appendChild(el('td', r.pct != null && r.pct < 75 ? 'lw' : '', r.pct == null ? '-' : r.pct + '%')); row.appendChild(el('td', '', hs.length)); row.appendChild(el('td', '', hs[0] ? hs[0].nilai || '-' : '-'));
        var tdb = el('td'), b = el('button', 'tb sm', 'Rapor'); b.type = 'button'; b.onclick = function () { rapor(s, bl.value); }; tdb.appendChild(b); row.appendChild(tdb); tbd.appendChild(row);
        rows.push([s.nama, s.program || '', r.Hadir, r.Izin, r.Sakit, r.Alpa, r.pct == null ? '' : r.pct, hs.length, hs[0] ? hs[0].nilai || '' : '']);
      });
      t.appendChild(tbd); wrap.appendChild(t);
    }
    var ex = el('button', 'tb', '⬇ Unduh CSV'); ex.type = 'button';
    ex.onclick = function () {
      var csv = [['Nama', 'Program', 'Hadir', 'Izin', 'Sakit', 'Alpa', 'Persen hadir', 'Setoran', 'Nilai terakhir']].concat(rows).map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v) && isNaN(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'rekap-santri-' + bl.value + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    };
    var pr = el('button', 'tb', '🖨 Cetak rekap'); pr.type = 'button'; pr.onclick = function () { document.body.classList.remove('cprn'); window.print(); };
    ac.appendChild(ex); ac.appendChild(pr);
    bl.onchange = gambar; ['input', 'change'].forEach(function (ev) { f.q.addEventListener(ev, gambar); f.p.addEventListener(ev, gambar); f.s.addEventListener(ev, gambar); }); gambar();
  };
  function rapor(s, bln) {
    var c = $('cetak'); c.textContent = '';
    var r = rekapSantri(s.id, bln), hs = berkas(s.id).filter(function (x) { return String(x.tanggal).slice(0, 7) === bln; }).reverse();
    var bt = new Date(bln + '-01T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    c.appendChild(el('h1', '', 'Laporan Perkembangan Santri')); c.appendChild(el('p', 'cs', 'Rumah Quran dan Literasi Daarul Fikr · Desa Tolondadu, Bolaang Uki'));
    var d = el('table', 'cb'); [['Nama', s.nama], ['Level', s.level || '-'], ['No. pendaftaran', s.no || '-'], ['Program', s.program || '-'], ['Pengajar', s.pengajar || (S.me && S.me.nama) || '-'], ['Periode', bt]].forEach(function (x) { var tr = el('tr'); tr.appendChild(el('th', '', x[0])); tr.appendChild(el('td', '', x[1])); d.appendChild(tr); }); c.appendChild(d);
    c.appendChild(el('h2', '', 'Kehadiran')); c.appendChild(el('p', '', 'Hadir ' + r.Hadir + ' · Izin ' + r.Izin + ' · Sakit ' + r.Sakit + ' · Alpa ' + r.Alpa + (r.pct == null ? '' : ' · Kehadiran ' + r.pct + '%')));
    var jr2 = jenisRingkas(s.id); c.appendChild(el('h2', '', 'Kontrol belajar (Iqra\', Tahsin, Tahfidz, Literasi)')); c.appendChild(el('p', '', JENIS.map(function (j) { return j + ' ' + jr2[j]; }).join(' · ') + ' (seluruh waktu)'));
    if (!hs.length) c.appendChild(el('p', '', 'Tidak ada catatan pada bulan ini.')); else { var t = el('table', 'cb'), hr = el('tr'); ['Tanggal', 'Program', 'Materi', 'Nilai', 'Catatan'].forEach(function (x) { hr.appendChild(el('th', '', x)); }); t.appendChild(hr); hs.forEach(function (x) { var tr = el('tr'); [fmt(x.tanggal), x.jenis, x.materi, x.nilai, x.catatan].forEach(function (v) { tr.appendChild(el('td', '', v || '')); }); t.appendChild(tr); }); c.appendChild(t); }
    if (s.catatan) { c.appendChild(el('h2', '', 'Catatan pengajar')); c.appendChild(el('p', '', s.catatan)); }
    c.appendChild(el('p', 'ttd', 'Pengajar,\n\n\n' + ((S.me && S.me.nama) || '..............')));
    document.body.classList.add('cprn'); setTimeout(function () { window.print(); }, 100);
  }
  addEventListener('afterprint', function () { document.body.classList.remove('cprn'); });

  /* ===== PENGUMUMAN ===== */
  var KC = { Umum: 'Umum', Penting: 'Penting', Kegiatan: 'Kegiatan', Libur: 'Libur' };
  RENDER.pengumuman = function () {
    var box = $('t-pengumuman'); box.textContent = ''; var h = el('div', 'rh'); h.appendChild(el('h3', '', '📢 Pengumuman')); box.appendChild(h); var ul = el('ul', 'pg big'); box.appendChild(ul); ul.appendChild(el('li', 'kos', 'Memuat…'));
    DB.list('pengumuman').then(function (L) {
      L = (L || []).slice().sort(function (a, b) { if ((a.pin === 'Ya') !== (b.pin === 'Ya')) return a.pin === 'Ya' ? -1 : 1; return (a.tgl || '') < (b.tgl || '') ? 1 : -1; }); ul.textContent = '';
      if (!L.length) { ul.appendChild(el('li', 'kos', 'Belum ada pengumuman.')); return; }
      L.forEach(function (x) { var li = document.createElement('li'), m = el('span', 'pm'), k = KC[x.kategori] || 'Umum'; m.appendChild(el('span', 'kt ' + k, k)); m.appendChild(document.createTextNode([fmt(String(x.tgl || '').slice(0, 10)), x.oleh].filter(Boolean).join(' · '))); li.appendChild(el('b', '', (x.pin === 'Ya' ? '📌 ' : '') + (x.judul || ''))); li.appendChild(m); li.appendChild(el('span', 'is full', x.isi || '')); ul.appendChild(li); });
    }, function () { ul.textContent = ''; ul.appendChild(el('li', 'kos', 'Gagal memuat pengumuman.')); });
  };

  /* ===== PROFIL ===== */
  RENDER.profil = function () {
    var box = $('t-profil'); box.textContent = ''; var h = el('div', 'rh'); h.appendChild(el('h3', '', '👤 Profil Saya')); box.appendChild(h);
    var c = el('div', 'gl pn'), m = S.me || {}; var top = el('div', 'dtop'); top.appendChild(DF.avatar(window.PJ_me || m, 'sav big')); var tx = el('div'); tx.appendChild(el('div', 'dj', m.nama || 'Pengajar')); tx.appendChild(el('div', 'ds', m.jabatan || m.peran || '')); top.appendChild(tx); var fp = el('button', 'tb sm', '📷 Ganti foto saya'); fp.type = 'button'; top.appendChild(fp);
    fp.onclick = function () { pilihFoto(function (file) { fp.disabled = true; DB.fotoFile(file, 480, 0.8).then(function (u) { return DB.set('staf', S.uid, { foto: u }).then(function () { DB.list('pengajar').then(function (L) { if ((L || []).some(function (z) { return z.id === 'staf_' + S.uid; })) DB.set('pengajar', 'staf_' + S.uid, { foto: u }).catch(function () { }); }).catch(function () { }); if (S.me) S.me.foto = u; var av = Object.assign({}, window.PJ_me || {}, { foto: u }); window.PJ_me = av; var hf = $('hf'); if (hf) { hf.textContent = ''; hf.appendChild(DF.avatar(av, 'hp')); } if (window.PJ_head) window.PJ_head(av); toast('Foto profil tersimpan ✓'); RENDER.profil(); }); }).catch(function (er) { fp.disabled = false; galat(er.code === 'permission-denied' ? new Error('Foto belum bisa disimpan. Pastikan firestore.rules terbaru sudah di-deploy.') : er); }); }); };
    c.appendChild(top);
    dl(c, [['Email', m.email || (window.firebase && firebase.auth && firebase.auth().currentUser ? firebase.auth().currentUser.email : '')], ['WhatsApp', m.hp], ['Peran', m.peran], ['Jumlah santri saya', String(S.san.filter(mine).length)]]);
    var ac = el('div', 'acts'), rs = el('button', 'tb', '🔑 Kirim email reset password'); rs.type = 'button';
    rs.onclick = function () { var em = m.email || (window.firebase && firebase.auth().currentUser && firebase.auth().currentUser.email); if (!em || !(window.DB && DB.cloud)) { toast('Reset password hanya tersedia saat online (mode Firebase).', true); return; } firebase.auth().sendPasswordResetEmail(em).then(function () { toast('Email reset dikirim ke ' + em); }, galat); };
    ac.appendChild(rs); var lo = el('button', 'tb', 'Keluar'); lo.type = 'button'; lo.onclick = function () { $('kel').click(); }; ac.appendChild(lo); c.appendChild(ac);
    c.appendChild(el('p', 'kos', 'Foto bisa Anda ganti sendiri. Nama dan data akun diubah oleh admin lewat menu Akun Pengajar.')); box.appendChild(c);
  };
  RENDER.rekan = function () { var s = $('cr'); if (s) s.dispatchEvent(new Event('input')); };
  if (window.PJ_pending) { var pp = window.PJ_pending; window.PJ_pending = null; PJ.start(pp[0], pp[1]); }
})();
