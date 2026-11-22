/* Skrip bersama semua halaman Daarul Fikr. Elemen yang tidak ada di sebuah halaman diabaikan dengan aman. */
var NIL = (function () {
  var f = function () {}, p = new Proxy(f, {
    get: function (t, k) { if (k === Symbol.toPrimitive) return function () { return 0; }; if (k === 'length') return 0; if (k === 'then') return undefined; return p; },
    set: function () { return true; }, apply: function () { return p; }, construct: function () { return p; }
  });
  return p;
})();
/* hanya muat data yang dipakai halaman ini (hemat pembacaan database) */
function DBL(c) { return ((window.PAGE && PAGE.need) || []).indexOf(c) > -1 ? DB.list(c) : Promise.resolve([]); }
/* KONTEN.apply tanpa error bila elemen target ada di halaman lain */
function konten(st) {
  if (!window.KONTEN) return;
  var gi = document.getElementById, qs = document.querySelector;
  document.getElementById = function (i) { return gi.call(document, i) || NIL; };
  document.querySelector = function (s) { return qs.call(document, s) || NIL; };
  try { KONTEN.apply(st); } catch (e) { } finally { delete document.getElementById; delete document.querySelector; }
}

var S = window.SITE || {}, $ = function (i) { return document.getElementById(i) || NIL; };
document.querySelectorAll('img[data-logo]').forEach(function (i) { i.src = window.LOGO64; i.style.display = ''; });
function waktuSalam() { var h = new Date().getHours(); return h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam'; }
$('salam').textContent = "Assalamu'alaikum · Selamat " + waktuSalam();
window.TICK_DEF = ["Assalamu'alaikum warahmatullahi wabarakatuh. Selamat {waktu}!", 'Selamat datang di Rumah Quran dan Literasi Daarul Fikr', 'Pendaftaran santri baru dibuka. Daftar online dari HP kapan saja', "Belajar Al-Qur'an dan literasi bersama pengajar yang sabar"];
function setTicker(list) {
  var box = $('tick'), t = $('tickt'), m = t.parentNode;
  list = (list || []).map(function (x) { return String(x).replace(/\{waktu\}/g, waktuSalam()).trim(); }).filter(Boolean);
  if (!list.length) { box.style.display = 'none'; if (window.ukurHdr) window.ukurHdr(); return; }
  box.style.display = ''; t.textContent = '';
  function tambah() { list.forEach(function (x) { var s = document.createElement('span'); s.textContent = x; t.appendChild(s); }); }
  tambah(); var g = 0; while (t.scrollWidth < m.clientWidth * 1.3 && g++ < 12) tambah();
  var w = t.scrollWidth, n = t.children.length;
  for (var i = 0; i < n; i++) t.appendChild(t.children[i].cloneNode(true));
  t.style.setProperty('--dur', Math.max(14, w / 70) + 's');
  if (window.ukurHdr) window.ukurHdr();
}
setTicker(window.TICK_DEF);
var tkR; addEventListener('resize', function () { clearTimeout(tkR); tkR = setTimeout(function () { if (window.TICK_CUR) setTicker(window.TICK_CUR); else setTicker(window.TICK_DEF); }, 250); });
if (!window.DB) { window.DB = new Proxy({ cloud: false, err: function (e) { return (e && e.message) || String(e); } }, { get: function (t, k) { if (k === 'onAuth') return function (cb) { cb(false); }; if (k === 'onUser') return function (cb) { cb(null); }; return k in t ? t[k] : function () { return Promise.reject(new Error('File db.js tidak ditemukan di hosting.')); }; } }); }

$('top').onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };
onscroll = function () { $('top').style.display = scrollY > 600 ? 'block' : 'none'; };
$('tahun').textContent = new Date().getFullYear();
var masuk = false;
$('lgbtn').onclick = function (e) { if (masuk) return; e.preventDefault(); $('menu').classList.remove('buka'); $('lgm').classList.add('on'); $('lgu').focus(); };
$('lgx').onclick = function () { $('lgm').classList.remove('on'); };
$('lgm').onclick = function (e) { if (e.target === this) this.classList.remove('on'); };
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('lgm').classList.remove('on'); });
$('lgf').onsubmit = async function (e) {
  e.preventDefault(); $('lge').textContent = ''; var b = e.target.querySelector('button[type=submit]'); b.disabled = true;
  try { var rl = await DB.masuk($('lgu').value.trim(), $('lgp').value); location.href = rl === 'admin' ? 'admin.html' : 'ortu.html'; }
  catch (er) { $('lge').textContent = DB.err ? DB.err(er) : er.message; b.disabled = false; }
};
DB.onUser(async function (u) {
  if (!u) { masuk = false; return; }
  try {
    var rr = await DB.role(), b = $('lgbtn'); masuk = true; b.textContent = rr === 'admin' ? 'Dashboard Admin' : 'Portal Saya'; b.href = rr === 'admin' ? 'admin.html' : 'ortu.html';
    var pf = rr === 'ortu' ? await DB.profil() : null, nm = rr === 'admin' ? 'Admin' : (pf && pf.nama ? String(pf.nama).split(' ')[0] : '');
    if (nm) $('salam').textContent = "Assalamu'alaikum, " + nm + ' · Selamat ' + waktuSalam();
  } catch (e) {}
});
$('burger').onclick = function () { $('menu').classList.toggle('buka'); };
$('menu').onclick = function (e) { if (e.target.tagName === 'A') $('menu').classList.remove('buka'); };
document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + S.wa; });
document.querySelectorAll('[data-email]').forEach(function (a) { a.href = 'mailto:' + S.email; a.textContent = S.email; });
document.querySelectorAll('[data-jam]').forEach(function (a) { a.textContent = S.jam; });
[['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube']].forEach(function (x) {
  if (!S[x[0]]) return; var a = document.createElement('a'); a.href = S[x[0]]; a.textContent = x[1]; a.target = '_blank'; a.rel = 'noopener'; $('sos').appendChild(a);
});
/* Jangan terima pendaftaran yang hanya tersimpan di browser pengunjung. */
if (!DB.cloud && /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname)) {
  $('fd').style.display = 'none'; $('cs').style.display = 'none';
  var nb = document.createElement('div');
  nb.style.cssText = 'background:#fff;border:2px solid var(--emas);border-radius:12px;padding:28px;text-align:center';
  nb.innerHTML = '<p style="margin-bottom:14px">Pendaftaran online sedang disiapkan. Untuk saat ini silakan mendaftar lewat WhatsApp.</p><a class="btn btn-e" data-wa target="_blank" rel="noopener" href="https://wa.me/' + (S.wa || '') + '">Daftar lewat WhatsApp</a>';
  $('fd').parentNode.insertBefore(nb, $('fd'));
}
$('fd').addEventListener('submit', async function (e) {
  e.preventDefault();
  var f = e.target, btn = f.querySelector('button'), d = {};
  new FormData(f).forEach(function (v, k) { d[k] = v.trim(); });
  if (d.website) return; delete d.website;
  btn.disabled = true; btn.textContent = 'Mengirim...';
  try {
    var no = await DB.daftar(d);
    $('no').textContent = no;
    $('wa2').href = 'https://wa.me/' + S.wa + '?text=' + encodeURIComponent("Assalamu'alaikum, saya mendaftarkan " + d.nama + ' (No. ' + no + ') di Daarul Fikr.');
    $('ok').style.display = 'block'; f.reset(); $('ok').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) { alert('Pendaftaran belum terkirim. ' + (DB.err ? DB.err(err) : 'Periksa koneksi internet, lalu coba lagi.')); }
  btn.disabled = false; btn.textContent = 'Kirim pendaftaran';
});
$('cs').addEventListener('submit', async function (e) {
  e.preventDefault(); var h = $('csh'), v = $('csno').value; if (!v.trim()) return;
  try { var r = await DB.cek(v); h.textContent = r ? r.nama + ' — status: ' + r.status : 'Nomor tidak ditemukan. Periksa kembali penulisannya.'; }
  catch (x) { h.textContent = 'Status belum bisa diperiksa. Coba lagi nanti.'; }
});
(async function () {
  try {
    var L = (await DBL('pengumuman')).sort(function (a, b) { return (b.tgl || '') > (a.tgl || '') ? 1 : -1; }).slice(0, (window.PAGE && PAGE.pgm) || 5);
    if (!L.length) return;
    L.forEach(function (x) {
      var li = document.createElement('li'), h = document.createElement('h3'), m = document.createElement('small'), p = document.createElement('p');
      h.textContent = x.judul; p.textContent = x.isi;
      m.textContent = new Date(x.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      li.append(h, m, p); $('pgm').appendChild(li);
    });
    $('pengumuman').style.display = 'block';
  } catch (e) {}
})();
(async function () {
  var by = function (a, b) { return (+a.urut || 999) - (+b.urut || 999); }, el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  try {
    var P = (await DBL('program')).filter(function (x) { return x.aktif !== 'Tidak'; }).sort(by);
    if (P.length) {
      var ul = $('progl'), sel = $('pgsel'); ul.textContent = ''; sel.length = 1;
      P.forEach(function (x) {
        var li = document.createElement('li'); li.append(el('span', 'i', x.ikon || '📖'), el('h3', '', x.judul), el('p', '', x.deskripsi)); ul.appendChild(li);
        var o = document.createElement('option'); o.textContent = x.judul; sel.appendChild(o);
      });
      document.dispatchEvent(new Event('programsiap'));
    }
  } catch (e) {}
  try {
    var J = (await DBL('jadwal')).sort(by);
    if (J.length) {
      var tb = $('jdw'); tb.textContent = '';
      J.forEach(function (x) { var tr = document.createElement('tr'); [x.hari, x.kegiatan, x.waktu].forEach(function (v) { tr.appendChild(el('td', '', v)); }); tb.appendChild(tr); });
    }
  } catch (e) {}
})();
(async function () {
  var by = function (a, b) { return (+a.urut || 999) - (+b.urut || 999); }, el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  try {
    var st = (await DBL('pengaturan')).filter(function (x) { return x.id === 'situs'; })[0];
    if (st) {
      ['wa', 'email', 'jam', 'biaya', 'instagram', 'facebook', 'youtube'].forEach(function (k) { if (st[k]) S[k] = st[k]; });
      document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + S.wa; });
      document.querySelectorAll('[data-email]').forEach(function (a) { a.href = 'mailto:' + S.email; a.textContent = S.email; });
      document.querySelectorAll('[data-jam]').forEach(function (a) { a.textContent = S.jam; });
      $('sos').textContent = '';
      [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube']].forEach(function (x) {
        if (!S[x[0]]) return; var a = el('a', '', x[1]); a.href = S[x[0]]; a.target = '_blank'; a.rel = 'noopener'; $('sos').appendChild(a);
      });
      konten(st);
      if (S.biaya) { $('biaya').textContent = S.biaya; if ($('faqb')) $('faqb').textContent = S.biaya; }
    }
  } catch (e) {}
  var GAL = [], gi = 0;
  try {
    var G = (await DBL('pengajar')).filter(function (x) { return x.aktif !== 'Tidak'; }).sort(by);
    if (G.length) { G.forEach(function (x) { var d = el('div'), av; d.dataset.peran = x.peran || 'Pengajar'; if (/^data:image\//.test(x.foto || '') || /^https?:/.test(x.foto || '')) { av = document.createElement('img'); av.className = 'pfoto'; av.src = x.foto; av.alt = 'Foto ' + (x.nama || ''); av.loading = 'lazy'; } else av = el('span', 'pav', String(x.nama || '?').trim().charAt(0).toUpperCase()); d.append(av, el('h3', '', x.nama), el('b', '', x.jabatan)); if (x.ket) d.appendChild(el('p', '', x.ket)); $('pgjl').appendChild(d); }); $('pengajar').style.display = 'block'; }
  } catch (e) {}
  try {
    var F = (await DBL('galeri')).sort(by);
    if (F.length) {
      F.forEach(function (x) {
        if (!/^data:image\//.test(x.foto || '') && !/^https?:/.test(x.foto || '')) return;
        var f = el('figure'), i = document.createElement('img'); i.src = x.foto; i.alt = x.ket || 'Kegiatan Daarul Fikr'; i.loading = 'lazy';
        var gx = GAL.push(x) - 1; i.onclick = function () { openLb(gx); };
        f.appendChild(i); if (x.ket) f.appendChild(el('figcaption', '', x.ket)); $('gall').appendChild(f);
      });
      $('galeri').style.display = 'block';
    }
  } catch (e) {}
  function openLb(i) { gi = (i + GAL.length) % GAL.length; $('lbi').src = GAL[gi].foto; $('lbc').textContent = GAL[gi].ket || ''; $('lb').style.display = 'grid'; }
  function closeLb() { $('lb').style.display = 'none'; }
  $('lb').onclick = function (e) { if (e.target === this || e.target.id === 'lbi') closeLb(); };
  $('lbp').onclick = function (e) { e.stopPropagation(); openLb(gi - 1); };
  $('lbn2').onclick = function (e) { e.stopPropagation(); openLb(gi + 1); };
  $('lbx').onclick = closeLb;
  document.addEventListener('keydown', function (e) { if ($('lb').style.display !== 'grid') return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') openLb(gi - 1); if (e.key === 'ArrowRight') openLb(gi + 1); });
  async function lst(col, sel, build) {
    try {
      var L = (await DBL(col)).filter(function (x) { return x.aktif !== 'Tidak'; }).sort(by);
      if (!L.length) return; var c = document.querySelector(sel); if (!c) return; c.textContent = '';
      L.forEach(function (x) { c.appendChild(build(x)); });
    } catch (e) {}
  }
  lst('sorotan', '.hl', function (x) { var li = el('li'); li.append(el('b', '', x.judul), document.createTextNode(x.teks || '')); return li; });
  lst('keunggulan', '.kel', function (x) { var d = el('div'); d.append(el('i', '', x.ikon || '⭐'), el('h3', '', x.judul), el('p', '', x.deskripsi)); return d; });
  lst('alur', '.alur', function (x) { var li = el('li'); li.append(el('h3', '', x.judul), el('p', '', x.deskripsi)); return li; });
  lst('faq', '#faq .w > div', function (x) { var d = el('details'); d.append(el('summary', '', x.tanya), el('p', '', x.jawab)); return d; });
  function hariStr() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  async function blok(col, sec, cont, build, flt, srt, max) {
    try {
      var L = (await DBL(col)).filter(function (x) { return x.aktif !== 'Tidak' && (!flt || flt(x)); }).sort(srt || by);
      if (max) L = L.slice(0, max);
      if (!L.length) return; var c = $(cont); c.textContent = '';
      L.forEach(function (x) { c.appendChild(build(x)); }); $(sec).style.display = '';
    } catch (e) {}
  }
  var BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  blok('statistik', 'statistik', 'stl', function (x) {
    var d = el('div', 'sti'), b = el('b', '', x.angka), m = /^(\D*)(\d[\d.,]*)(.*)$/.exec(String(x.angka || ''));
    if (m) { var n = parseFloat(m[2].replace(/\./g, '').replace(',', '.')); if (isFinite(n)) { b.dataset.n = n; b.dataset.p = m[1]; b.dataset.s = m[3]; b.dataset.raw = x.angka; } }
    d.append(b, el('span', '', x.label)); return d;
  }).then(function () { var gp = document.querySelector('.hero .gel path'); if ($('statistik').style.display !== 'none' && gp) gp.setAttribute('fill', '#04271a'); });
  blok('agenda', 'agenda', 'agl', function (x) {
    var t = String(x.tanggal).split('-'), d = el('div', 'agi'), dt = el('div', 'agt'), i = el('div');
    dt.append(el('b', '', String(+t[2])), el('span', '', BL[+t[1] - 1] + ' ' + t[0])); i.appendChild(el('h3', '', x.judul));
    var meta = [x.waktu, x.tempat].filter(Boolean).join(' · '); if (meta) i.appendChild(el('p', '', meta)); if (x.ket) i.appendChild(el('p', '', x.ket));
    d.append(dt, i); return d;
  }, function (x) { return x.tanggal && x.tanggal >= hariStr(); }, function (a, b) { return a.tanggal < b.tanggal ? -1 : 1; }, 6);
  blok('testimoni', 'testimoni', 'tsl', function (x) { var d = el('blockquote', 'tsi'); d.append(el('p', '', x.isi), el('b', '', x.nama)); if (x.peran) d.appendChild(el('small', '', x.peran)); return d; });
})();
/* ===== Efek tampilan ===== */
(function () {
  var hdr = document.querySelector('header'), bar = $('pbar'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, hasIO = 'IntersectionObserver' in window;
  function ukur() { document.documentElement.style.setProperty('--hh', hdr.offsetHeight + 'px'); }
  ukur(); addEventListener('resize', ukur); window.ukurHdr = ukur;
  function gulir() { var y = scrollY, h = document.documentElement.scrollHeight - innerHeight; hdr.classList.toggle('solid', y > 30); bar.style.width = (h > 0 ? y / h * 100 : 0) + '%'; }
  addEventListener('scroll', gulir, { passive: true }); gulir();
  var pr = document.getElementById('pr');
  if (pr && !reduce) for (var i = 0; i < 22; i++) { var d = document.createElement('i'), z = 2 + Math.random() * 4; d.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + z + 'px;height:' + z + 'px;animation-duration:' + (9 + Math.random() * 12) + 's;animation-delay:-' + (Math.random() * 20) + 's'; pr.appendChild(d); }
  var bk = document.querySelector('.buku'), hero = $('beranda');
  if (bk && !reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; bk.style.transform = 'rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 5) + 'deg)'; });
    hero.addEventListener('pointerleave', function () { bk.style.transform = ''; });
  }
  var links = [].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if (hasIO) {
    var nav = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); }); }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) nav.observe(s); });
  }
  function hitung(b) {
    var n = +b.dataset.n, p = b.dataset.p || '', s = b.dataset.s || '', t0 = null;
    function f(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3); b.textContent = p + Math.round(n * e).toLocaleString('id-ID') + s; if (k < 1) requestAnimationFrame(f); else b.textContent = b.dataset.raw; }
    requestAnimationFrame(f);
  }
  var IO = hasIO && !reduce ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.matches('.sti')) { var b = e.target.querySelector('b[data-n]'); if (b) hitung(b); } IO.unobserve(e.target); } }); }, { threshold: .1, rootMargin: '0px 0px -5% 0px' }) : null;
  function rvScan() {
    if (!IO) return;
    try {
      document.documentElement.classList.add('js');
      document.querySelectorAll('section:not(.hero) .w > h2, .lead, .jk, .ocard, .prog li, .kel > div, .alur li, .tw, .pgj > div, .gal figure, .png li, .fakta, .dua > div, #faq details, .form, .kon > *, .sti, .agi, .tsi, .ayatband .w > *, .cta .w > *').forEach(function (e, i) {
        if (e.dataset.rv) return; e.dataset.rv = 1; e.classList.add('rv'); e.style.transitionDelay = ((i % 6) * 70) + 'ms'; IO.observe(e);
      });
    } catch (er) { document.documentElement.classList.remove('js'); }
  }
  rvScan();
  var tm = 0; new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(rvScan, 120); }).observe(document.body, { childList: true, subtree: true });
  /* jadwal hari ini */
  var IDX = { senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, "jum'at": 5, sabtu: 6, ahad: 0, minggu: 0 };
  function hariIni() {
    var rows = [].slice.call(document.querySelectorAll('#jdw tr')), td = new Date().getDay(), hit = null;
    rows.forEach(function (r) { r.classList.remove('hari-ini'); });
    rows.forEach(function (r) {
      var c = r.children[0]; if (!c) return; var tx = c.textContent.toLowerCase(), f = [];
      Object.keys(IDX).forEach(function (k) { var p = tx.indexOf(k); if (p > -1) f.push([p, IDX[k]]); });
      f.sort(function (a, b) { return a[0] - b[0]; }); var d = f.map(function (z) { return z[1]; }); if (!d.length) return;
      var ok;
      if (d.length >= 2 && /[–-]|s\/d|sampai/.test(tx)) { var a = d[0] || 7, b = d[1] || 7, k = td || 7; ok = a <= b ? (k >= a && k <= b) : (k >= a || k <= b); } else ok = d.indexOf(td) > -1;
      if (ok) { r.classList.add('hari-ini'); if (!hit) hit = r; }
    });
    var h = $('hari'); if (!h) return;
    if (hit && hit.children[1]) { h.hidden = false; h.textContent = 'Hari ini: ' + hit.children[1].textContent + (hit.children[2] ? ' · ' + hit.children[2].textContent : ''); } else h.hidden = true;
  }
  hariIni(); var jjw = document.getElementById('jdw'); if (jjw) new MutationObserver(hariIni).observe(jjw, { childList: true });
})();

/* ===== Fitur interaktif tambahan ===== */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  /* pemberitahuan setelah akun dihapus */
  if (/[?&]akun=dihapus/.test(location.search)) { var nt = el('div', '', 'Akun Anda sudah dihapus. Terima kasih telah bergabung.'); nt.id = 'notif'; document.body.appendChild(nt); setTimeout(function () { nt.remove(); history.replaceState(null, '', location.pathname + location.hash); }, 6000); }

  /* pilih program lalu lompat ke formulir */
  function norm(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' '); }
  function kata(t) { return norm(t).split(/\s+/).filter(function (w) { return w.length > 3 && w !== 'belajar'; }); }
  function pilihProgram(judul, level) {
    if (!document.getElementById('fd')) { location.href = 'daftar.html?program=' + encodeURIComponent(judul) + (level ? '&level=' + encodeURIComponent(level) : ''); return; }
    var sel = $('pgsel'); if (!sel) return;
    var best = null, sc = 0, kj = kata(judul);
    [].slice.call(sel.options).forEach(function (o) {
      if (!o.value && !o.text) return; var t = norm(o.text), j = norm(judul), n = 0;
      if (t === j) n = 99; else if (t.indexOf(j) > -1 || j.indexOf(t) > -1) n = 50; else kj.forEach(function (w) { if (t.indexOf(w) > -1) n++; });
      if (n > sc) { sc = n; best = o; }
    });
    if (best) sel.value = best.value || best.text;
    var lv = document.querySelector('#fd [name=level]'); if (lv && level) { [].slice.call(lv.options).forEach(function (o) { if (o.text === level) lv.value = o.value || o.text; }); }
    var f = $('fd'); $('daftar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    if (f) { f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); }
    hitungForm();
  }
  $('progl').addEventListener('click', function (e) { var li = e.target.closest('li'); if (li && li.querySelector('h3')) pilihProgram(li.querySelector('h3').textContent); });

  /* kuis pemilih program */
  var QS = [
    { q: 'Siapa yang akan belajar?', k: 'usia', o: ['Anak usia SD', 'Remaja (SMP/SMA)', 'Dewasa / warga umum'] },
    { q: "Bagaimana kemampuan membaca Al-Qur'an saat ini?", k: 'level', o: ['Belum bisa', "Iqra'", "Al-Qur'an terbata-bata", 'Lancar'] },
    { q: 'Apa yang paling ingin dicapai?', k: 'tujuan', o: ["Bisa membaca Al-Qur'an dengan benar", "Menghafal Al-Qur'an", 'Gemar membaca buku', 'Terampil menulis dan bercerita', 'Memahami dasar-dasar keislaman'] }
  ], JW = {}, qi = 0;
  function qTampil() {
    var c = $('qzc'); c.textContent = '';
    if (qi >= QS.length) return qHasil();
    var Q = QS[qi], p = el('div', 'qzp'), i = el('i'); i.style.width = (qi / QS.length * 100) + '%'; p.appendChild(i);
    var o = el('div', 'qzo');
    Q.o.forEach(function (t) { var b = el('button', '', t); b.type = 'button'; b.onclick = function () { JW[Q.k] = t; qi++; qTampil(); }; o.appendChild(b); });
    var x = el('button', 'btn btn-o', 'Tutup'); x.type = 'button'; x.style.marginTop = '16px'; x.onclick = qTutup;
    c.append(el('h3', '', Q.q), el('p', 'qs', 'Pertanyaan ' + (qi + 1) + ' dari ' + QS.length), p, o, x);
  }
  function qHasil() {
    var t = JW.tujuan || '', lv = JW.level || '', key = /menghafal/i.test(t) ? 'tahfidz' : /buku/i.test(t) ? 'literasi' : /menulis/i.test(t) ? 'menulis' : /keislaman/i.test(t) ? 'kajian' : 'membaca', alasan;
    if (key === 'membaca' && lv === 'Lancar') { key = 'tahfidz'; alasan = 'Bacaan sudah lancar, jadi langkah berikutnya adalah mulai menghafal.'; }
    else if (key === 'tahfidz' && (lv === 'Belum bisa' || lv === "Iqra'")) { key = 'membaca'; alasan = 'Sebelum menghafal, mantapkan dulu bacaan dan tajwidnya. Hafalan bisa menyusul.'; }
    else alasan = { membaca: 'Cocok untuk memperbaiki dan melancarkan bacaan dari tingkat Anda sekarang.', tahfidz: 'Cocok untuk menambah hafalan dengan setoran rutin.', literasi: 'Cocok untuk menumbuhkan kebiasaan membaca buku.', menulis: 'Cocok untuk melatih menulis dan berpikir kritis.', kajian: 'Cocok untuk memahami akidah, akhlak, dan fikih dasar.' }[key];
    var rx = { membaca: /membaca|iqra/i, tahfidz: /tahfidz/i, literasi: /literasi|taman baca/i, menulis: /menulis/i, kajian: /kajian/i }[key], opts = progOpsi().filter(function (o) { return o.value || o.text.indexOf('Pilih') < 0; }), m = opts.filter(function (o) { return rx.test(o.text); })[0] || opts[0];
    var judul = m ? m.text : 'Program Daarul Fikr', c = $('qzc'), r = el('div', 'qzr');
    var emo = { membaca: '📖', tahfidz: '🧠', literasi: '📚', menulis: '✍️', kajian: '🕌' }[key];
    var b1 = el('button', 'btn btn-h', 'Daftar program ini'); b1.type = 'button'; b1.onclick = function () { qTutup(); pilihProgram(judul, JW.level); };
    var b2 = el('button', 'btn btn-o', 'Ulangi'); b2.type = 'button'; b2.onclick = function () { qi = 0; JW = {}; qTampil(); };
    var ac = el('div', 'aksi'); ac.style.justifyContent = 'center'; ac.append(b1, b2);
    r.append(el('div', 'em', emo), el('p', 'qs', 'Program yang kami sarankan'), el('h3', '', judul), el('p', '', alasan), ac);
    c.append(r);
  }
  function progOpsi() {
    var s = document.getElementById('pgsel');
    if (s) return [].slice.call(s.options);
    return [].slice.call(document.querySelectorAll('#progl li h3')).map(function (h) { return { value: h.textContent, text: h.textContent }; });
  }
  function qBuka() { qi = 0; JW = {}; $('qz').classList.add('on'); qTampil(); }
  function qTutup() { $('qz').classList.remove('on'); }
  $('qz-open').onclick = qBuka; $('qz').onclick = function (e) { if (e.target === this) qTutup(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') qTutup(); });

  /* progres pengisian formulir */
  function hitungForm() {
    var f = $('fd'); if (!f) return; var rq = [].slice.call(f.querySelectorAll('[required]')); if (!rq.length) return;
    var ok = rq.filter(function (x) { return String(x.value || '').trim() !== ''; }).length, pc = Math.round(ok / rq.length * 100);
    $('fpb').style.width = pc + '%'; $('fpt').textContent = pc >= 100 ? 'Siap dikirim ✓' : pc + '% terisi';
  }
  $('fd').addEventListener('input', hitungForm); $('fd').addEventListener('change', hitungForm); $('fd').addEventListener('reset', function () { setTimeout(hitungForm, 0); }); hitungForm();

  /* cari FAQ */
  $('faqq').addEventListener('input', function () {
    var q = norm(this.value).trim(), ds = [].slice.call(document.querySelectorAll('#faq details')), n = 0;
    ds.forEach(function (d) { var ok = !q || norm(d.textContent).indexOf(q) > -1; d.style.display = ok ? '' : 'none'; if (ok) n++; if (q && ok) d.open = true; else if (!q) d.open = false; });
    $('faqn').hidden = !(q && !n);
  });

  /* filter pengajar / pengurus */
  var tabBuilt = false;
  function bangunTab() {
    var g = $('pgjl'), t = $('pgtab'); if (!g || !t || tabBuilt || !g.children.length) return;
    var ps = []; [].slice.call(g.children).forEach(function (d) { var p = d.dataset.peran; if (p && ps.indexOf(p) < 0) ps.push(p); });
    if (ps.length < 2) return; tabBuilt = true; t.hidden = false; t.textContent = '';
    ['Semua'].concat(ps).forEach(function (n, i) {
      var b = el('button', i ? '' : 'on', n); b.type = 'button';
      b.onclick = function () { [].slice.call(t.children).forEach(function (x) { x.classList.toggle('on', x === b); }); [].slice.call(g.children).forEach(function (d) { d.classList.toggle('sembunyi', i > 0 && d.dataset.peran !== n); }); };
      t.appendChild(b);
    });
  }
  var pgjEl = document.getElementById('pgjl'); if (pgjEl) { new MutationObserver(bangunTab).observe(pgjEl, { childList: true }); bangunTab(); }

  /* titik navigasi samping */
  var SEC = [['beranda', 'Beranda'], ['tentang', 'Tentang'], ['program', 'Program'], ['keunggulan', 'Keunggulan'], ['alur', 'Cara daftar'], ['jadwal', 'Jadwal'], ['pengajar', 'Pengajar'], ['galeri', 'Galeri'], ['faq', 'Tanya jawab'], ['daftar', 'Daftar'], ['kontak', 'Kontak']];
  var dn = el('nav'); dn.id = 'dots'; dn.setAttribute('aria-label', 'Navigasi bagian');
  SEC.forEach(function (s) { var a = el('a'); a.href = '#' + s[0]; a.dataset.s = s[0]; a.setAttribute('aria-label', s[1]); a.appendChild(el('span', '', s[1])); dn.appendChild(a); });
  document.body.appendChild(dn);
  function dotUpdate() {
    var cur = null, mid = innerHeight * 0.4;
    SEC.forEach(function (s) { var e = document.getElementById(s[0]), a = dn.querySelector('[data-s=' + s[0] + ']'); if (!e || !e.offsetParent) { a.style.display = 'none'; return; } a.style.display = ''; var r = e.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = s[0]; });
    [].slice.call(dn.children).forEach(function (a) { a.classList.toggle('on', a.dataset.s === cur); });
    dn.style.display = [].slice.call(dn.children).filter(function (a) { return a.style.display !== 'none'; }).length < 3 ? 'none' : '';
    var dft = document.getElementById('daftar'), m = $('mcta'), d = dft ? dft.getBoundingClientRect() : { top: 1e9, bottom: -1 }, inD = d.top < innerHeight && d.bottom > 0;
    m.classList.toggle('on', scrollY > innerHeight * 0.7 && !inD);
  }
  var tk = 0; addEventListener('scroll', function () { if (tk) return; tk = requestAnimationFrame(function () { tk = 0; dotUpdate(); }); }, { passive: true }); addEventListener('resize', dotUpdate); dotUpdate();

  /* testimoni berganti sendiri */
  var ts = document.getElementById('tsl'), hov = false;
  if (ts && !reduce) {
    ts.addEventListener('pointerenter', function () { hov = true; }); ts.addEventListener('pointerleave', function () { hov = false; }); ts.addEventListener('touchstart', function () { hov = true; }, { passive: true });
    setInterval(function () {
      if (hov || !ts.children.length || ts.offsetParent === null) return;
      var w = ts.children[0].offsetWidth + 20, end = ts.scrollLeft + ts.clientWidth >= ts.scrollWidth - 4;
      ts.scrollTo({ left: end ? 0 : ts.scrollLeft + w, behavior: 'smooth' });
    }, 5500);
  }

  /* ===== multi-halaman ===== */
  /* dari halaman Program / kuis: buka formulir dengan program terpilih */
  (function () {
    var q = new URLSearchParams(location.search), p = q.get('program');
    if (!p || !document.getElementById('fd')) return;
    var lv = q.get('level') || '', done = false;
    function pakai() { try { pilihProgram(p, lv); } catch (e) { } }
    pakai(); document.addEventListener('programsiap', function () { if (!done) { done = true; pakai(); } });
  })();
  /* pesan "belum ada data" setelah data selesai dimuat */
  var siap = false;
  function cekKosong() {
    [].slice.call(document.querySelectorAll('[data-cek]')).forEach(function (b) {
      var ada = b.dataset.cek.split(',').some(function (id) {
        var e = document.getElementById(id); if (!e) return false;
        return e.tagName === 'SECTION' ? e.style.display !== 'none' : e.children.length > 0;
      });
      b.hidden = ada || !siap;
    });
  }
  setTimeout(function () { siap = true; cekKosong(); }, 2500);
  if (document.querySelector('[data-cek]')) new MutationObserver(cekKosong).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
  /* transisi halus antarhalaman */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce) return;
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || a.target || a.hasAttribute('download') || a.hasAttribute('data-wa') || /^(mailto:|tel:|javascript:)/.test(h)) return;
    var u; try { u = new URL(a.href); } catch (x) { return; }
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault(); document.body.classList.add('keluar'); setTimeout(function () { location.href = a.href; }, 220);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('keluar'); });
})();

/* ===== bagan struktur pengurus ===== */
function orgBuild(list, box) {
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  var L = (list || []).filter(function (x) { return x.aktif !== 'Tidak' && x.nama; }).map(function (x) { return Object.assign({}, x); })
    .sort(function (a, b) { return (+a.urut || 999) - (+b.urut || 999); });
  box.textContent = '';
  if (!L.length) return 0;
  var map = {}; L.forEach(function (x) { x._k = []; var k = String(x.nama).trim().toLowerCase(); if (!map[k]) map[k] = x; });
  var roots = [];
  L.forEach(function (x) { var p = x.induk ? map[String(x.induk).trim().toLowerCase()] : null; if (p && p !== x) p._k.push(x); else roots.push(x); });
  var seen = new Set();
  function kartu(x) {
    var c = el('div', 'ocard' + (x._root ? ' oroot' : '')), f = x.foto || '', av;
    if (/^data:image\//.test(f) || /^https?:/.test(f)) { av = document.createElement('img'); av.className = 'ofoto'; av.src = f; av.alt = 'Foto ' + x.nama; av.loading = 'lazy'; }
    else av = el('span', 'ofoto oav', String(x.nama).trim().charAt(0).toUpperCase());
    var t = el('div', 'ot'); t.append(el('b', '', x.nama)); if (x.jabatan) t.append(el('small', '', x.jabatan));
    c.append(av, t); return c;
  }
  function node(x) {
    if (seen.has(x)) return null; seen.add(x);
    var li = el('li'), c = kartu(x); li.appendChild(c);
    var kids = x._k.map(node).filter(Boolean);
    if (kids.length) {
      var ul = el('ul'); kids.forEach(function (k) { ul.appendChild(k); }); li.appendChild(ul);
      c.classList.add('punya'); c.setAttribute('role', 'button'); c.tabIndex = 0; c.title = 'Klik untuk melipat atau membuka bawahan';
      var tg = function () { li.classList.toggle('tutup'); c.setAttribute('aria-expanded', li.classList.contains('tutup') ? 'false' : 'true'); };
      c.addEventListener('click', tg); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tg(); } });
    }
    return li;
  }
  var ul = el('ul');
  roots.forEach(function (r) { r._root = 1; var n = node(r); if (n) ul.appendChild(n); });
  L.forEach(function (x) { if (!seen.has(x)) { x._root = 1; var n = node(x); if (n) ul.appendChild(n); } });   /* jaga-jaga atasan saling menunjuk */
  box.appendChild(ul); return L.length;
}

(async function () {
  var b = document.getElementById('orgc'); if (!b) return;
  try { var L = await DBL('struktur'); if (orgBuild(L, b)) $('struktur').style.display = ''; } catch (e) { }
})();
