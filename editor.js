/* Editor tulisan halaman. Dimuat oleh site.js.
   Semua pengunjung: menerapkan perubahan tulisan. Admin dengan ?edit=1: bisa klik tulisan untuk mengubahnya.
   Data: koleksi 'pengaturan', dokumen hal_<halaman> dan hal__umum (menu atas & footer, dipakai semua halaman). */
(function () {
  if (!window.DB || !DB.list) return;
  var HAL = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  var ID = { hal: 'hal_' + HAL, umum: 'hal__umum' };
  var data = { hal: { t: {}, s: [] }, umum: { t: {}, s: [] } };
  var edit = /[?&]edit=1/.test(location.search), bolehEdit = false;
  /* Isi yang berasal dari menu admin (database) tidak diedit di sini */
  var DINAMIS = [['#pgjl,#pgjg', 'Pengajar'], ['#progl', 'Program'], ['#jdw', 'Jadwal'], ['#gall', 'Galeri'], ['#pgm', 'Pengumuman'], ['#stl', 'Angka & Capaian'],
    ['#agl', 'Agenda'], ['#tsl', 'Testimoni'], ['#orgc,#org,#sldt', 'Struktur Pengurus'], ['.hl', 'Sorotan Beranda'], ['.kel', 'Keunggulan'], ['.alur', 'Cara Mendaftar'],
    ['#faq details', 'Tanya Jawab'], ['#tickt,#tickx,.tick-m', 'Teks & Pengaturan Situs (pita berjalan)'], ['#salam,#hari,#tahun,[data-email],[data-jam],#biaya', 'Teks & Pengaturan Situs']];
  var LEWATI = 'script,style,noscript,textarea,option,svg,#dfe-bar,#dfe-box,#dots';

  function dinamis(el) { for (var i = 0; i < DINAMIS.length; i++) if (el.closest(DINAMIS[i][0])) return DINAMIS[i][1]; return null; }
  function zona(el) {
    if (el.closest('header,footer')) return 'umum';
    return 'hal';
  }
  function kunci(node, asli) {
    var el = node.parentElement, a = el.closest('header,footer,section[id],div[id],form[id]');
    return (a ? (a.id || a.tagName.toLowerCase()) : 'body') + '|' + el.tagName.toLowerCase() + '|' + asli;
  }
  function terapNode(n) {
    var el = n.parentElement;
    if (!el || el.closest(LEWATI) || dinamis(el)) return;
    var v = n.nodeValue;
    if (n._dfBaru !== v) { n._dfAsli = v; n._dfBaru = v; }       /* teks baru dari halaman */
    var asli = n._dfAsli, inti = asli.trim(); if (!inti) return;
    var g = data[zona(el)].t[kunci(n, inti)];
    var hasil = g == null ? asli : asli.replace(inti, function () { return g; });
    if (hasil !== v) { n._dfBaru = hasil; n.nodeValue = hasil; }
  }
  function teksDi(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, a = [];
    while ((n = w.nextNode())) a.push(n);
    return a;
  }
  function kunciBagian(s) {
    if (s.id) return s.id;
    return 'ke' + [].indexOf.call(document.querySelectorAll('body > section'), s) + '-' + (s.classList[0] || '');
  }
  function terap() {
    teksDi(document.body).forEach(terapNode);
    [].forEach.call(document.querySelectorAll('body > section'), function (s) { s.classList.toggle('dfe-sembunyi', data.hal.s.indexOf(kunciBagian(s)) > -1); });
  }
  var css = document.createElement('style');
  css.textContent = 'body:not(.dfe) .dfe-sembunyi{display:none!important}';
  document.head.appendChild(css);

  function pakai(L) {
    Object.keys(ID).forEach(function (z) {
      var d = L.filter(function (x) { return x.id === ID[z]; })[0], o = {};
      try { o = d && d.isi ? JSON.parse(d.isi) : {}; } catch (e) { }
      data[z] = { t: o.t || {}, s: o.s || [] };
    });
    terap();
  }
  var CACHE = 'df_teks_' + HAL;
  try { var c = JSON.parse(localStorage.getItem(CACHE) || 'null'); if (c) { data = c; terap(); } } catch (e) { }
  var muat = DB.list('pengaturan').then(function (L) {
    pakai(L);
    try { localStorage.setItem(CACHE, JSON.stringify(data)); } catch (e) { }
  });
  muat.catch(function () { });
  var t = 0;
  new MutationObserver(function () { if (t) return; t = requestAnimationFrame(function () { t = 0; terap(); }); })
    .observe(document.body, { childList: true, subtree: true, characterData: true });

  /* ===== Daftar tulisan untuk panel admin (halaman dimuat dalam bingkai tersembunyi) ===== */
  if (/[?&]daftar=1/.test(location.search) && window.parent !== window) {
    var kirim = function () {
      terap();
      var ada = {}, items = [], bagian = [];
      teksDi(document.body).forEach(function (n) {
        var el = n.parentElement;
        if (!el || el.closest(LEWATI) || el.closest('#lb,#qz,#notif') || dinamis(el)) return;
        terapNode(n);
        var asli = (n._dfAsli || '').trim(); if (!/[A-Za-z0-9؀-ۿ]/.test(asli)) return;
        var z = zona(el), k = kunci(n, asli); if (ada[z + k]) return; ada[z + k] = 1;
        var s = el.closest('body > section'), h = s && s.querySelector('h1,h2');
        var grup = el.closest('header') ? 'Menu atas' : el.closest('footer') ? 'Footer' : el.closest('#lgm') ? 'Jendela masuk' : h ? h.textContent.trim() : 'Lainnya';
        items.push({ z: z, k: k, asli: asli, nilai: n.nodeValue.trim(), grup: grup });
      });
      [].forEach.call(document.querySelectorAll('body > section'), function (s) {
        var h = s.querySelector('h1,h2'); if (h) bagian.push({ k: kunciBagian(s), judul: h.textContent.trim(), sembunyi: data.hal.s.indexOf(kunciBagian(s)) > -1 });
      });
      parent.postMessage({ df: 'tulisan', hal: HAL, items: items, bagian: bagian }, '*');
    };
    var tunggu = function () { muat.then(function () { setTimeout(kirim, 1500); }, function (e) { parent.postMessage({ df: 'tulisan', hal: HAL, galat: DB.err(e) }, '*'); }); };
    if (document.readyState === 'complete') tunggu(); else addEventListener('load', tunggu);
    return;
  }

  /* ===== Mode edit (admin) ===== */
  if (!edit) return;
  var PAGES = [['index', 'Beranda'], ['tentang', 'Tentang'], ['struktur', 'Struktur'], ['program', 'Program'], ['pengajar', 'Pengajar'], ['kegiatan', 'Kegiatan'], ['pengumuman', 'Pengumuman'],
    ['faq', 'FAQ'], ['kontak', 'Kontak'], ['daftar', 'Daftar'], ['galeri', 'Galeri'], ['infaq', 'Infaq'], ['privasi', 'Privasi']];
  function E(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function tombol(text, fn, cls) { var b = E('button', cls || '', text); b.type = 'button'; b.onclick = fn; return b; }
  var bar, info, box;

  async function simpan(z) {
    await DB.set('pengaturan', ID[z], { isi: JSON.stringify(data[z]) });
    try { localStorage.removeItem(CACHE); } catch (e) { }
  }
  function pesan(m) { info.textContent = m; }
  function tutup() { if (box) { box.remove(); box = null; } }

  function panel(node, bagian) {
    tutup(); box = E('div'); box.id = 'dfe-box';
    var area = null;
    if (node) {
      var z = zona(node.parentElement), asli = node._dfAsli.trim(), k = kunci(node, asli);
      box.append(E('b', '', 'Ubah tulisan' + (z === 'umum' ? ' (berlaku di semua halaman)' : '')));
      area = E('textarea'); area.rows = 4; area.value = node.nodeValue.trim(); box.append(area);
    } else box.append(E('b', '', 'Bagian halaman'));
    var baris = E('div', 'dfe-row');
    async function jalankan(zz, ubah) {
      var cadang = JSON.stringify(data[zz]);
      ubah(); terap(); pesan('Menyimpan…');
      try { await simpan(zz); pesan('Tersimpan ✓'); tutup(); }
      catch (e) { data[zz] = JSON.parse(cadang); terap(); pesan('Gagal menyimpan: ' + DB.err(e)); }
    }
    if (node) {
      baris.append(tombol('Simpan', function () {
        var v = area.value.trim(); if (!v) { pesan('Tulisan tidak boleh kosong.'); return; }
        jalankan(z, function () { if (v === asli) delete data[z].t[k]; else data[z].t[k] = v; });
      }, 'utama'));
      if (data[z].t[k] != null) baris.append(tombol('Kembalikan asli', function () { jalankan(z, function () { delete data[z].t[k]; }); }));
    }
    if (bagian) {
      var kb = kunciBagian(bagian), tersembunyi = data.hal.s.indexOf(kb) > -1;
      baris.append(tombol(tersembunyi ? 'Tampilkan bagian ini' : 'Sembunyikan bagian ini', function () {
        jalankan('hal', function () { if (tersembunyi) data.hal.s.splice(data.hal.s.indexOf(kb), 1); else data.hal.s.push(kb); });
      }));
    }
    baris.append(tombol('Batal', tutup)); box.append(baris); document.body.append(box); if (area) area.focus();
  }

  function cariTeks(e) {
    var el = e.target, calon = [].filter.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
    if (!calon.length) calon = teksDi(el).filter(function (n) { return n.nodeValue.trim() && !n.parentElement.closest(LEWATI); });
    if (calon.length < 2) return calon[0];
    var r = document.createRange(), terdekat = calon[0], jarak = 1e9;
    calon.forEach(function (n) {
      r.selectNodeContents(n);
      [].forEach.call(r.getClientRects(), function (q) {
        var d = Math.hypot(Math.max(q.left - e.clientX, 0, e.clientX - q.right), Math.max(q.top - e.clientY, 0, e.clientY - q.bottom));
        if (d < jarak) { jarak = d; terdekat = n; }
      });
    });
    return terdekat;
  }
  function klik(e) {
    if (e.target.closest('#dfe-bar,#dfe-box')) return;
    if (e.target.closest('.burger')) return;
    e.preventDefault(); e.stopPropagation();
    var el = e.target, dari = dinamis(el);
    if (dari) { tutup(); pesan('Isi ini diubah lewat panel admin → menu ' + dari + '.'); return; }
    var n = cariTeks(e), bagian = el.closest('body > section');
    if (n && (n.parentElement.closest(LEWATI) || dinamis(n.parentElement))) n = null;
    if (n) { terapNode(n); pesan(''); }
    if (n || bagian) panel(n, bagian);
  }

  function mulai() {
    document.body.classList.add('dfe');
    var s = E('style');
    s.textContent = '.dfe section.dfe-sembunyi{opacity:.35;outline:3px dashed #c0392b;outline-offset:-6px}.dfe{padding-bottom:110px}.dfe .wa,.dfe .mcta,.dfe .top{display:none!important}' +
      '.dfe .rv{opacity:1!important;transform:none!important}' +
      '#dfe-bar,#dfe-box{position:fixed;z-index:99999;background:#fff;color:#1d2b24;font:600 14px "Nunito Sans",sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35)}' +
      '#dfe-bar{left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px 16px;border-top:4px solid #c9a24a}' +
      '#dfe-box{left:50%;transform:translateX(-50%);bottom:74px;width:min(560px,94vw);padding:16px;border-radius:14px;display:grid;gap:10px}' +
      '#dfe-box textarea{width:100%;box-sizing:border-box;font:400 15px "Nunito Sans",sans-serif;padding:10px;border:1px solid #bbb;border-radius:8px}.dfe-row{display:flex;flex-wrap:wrap;gap:8px}' +
      '#dfe-bar button,#dfe-box button,#dfe-bar select{font:700 13px "Nunito Sans",sans-serif;padding:8px 14px;border-radius:8px;border:1px solid #08402b;background:#fff;color:#08402b;cursor:pointer}' +
      '#dfe-box button.utama{background:#08402b;color:#fff}';
    document.head.append(s);
    bar = E('div'); bar.id = 'dfe-bar';
    var sel = E('select'); sel.setAttribute('aria-label', 'Pilih halaman');
    PAGES.forEach(function (p) { var o = E('option', '', p[1]); o.value = p[0]; o.selected = p[0] === HAL; sel.append(o); });
    sel.onchange = function () { location.href = sel.value + '.html?edit=1'; };
    info = E('span'); info.setAttribute('role', 'status');
    bar.append(E('b', '', '✏️ Mode edit: klik tulisan'), sel, tombol('Selesai', function () { location.href = location.pathname; }), info);
    document.body.append(bar);
    window.addEventListener('click', klik, true);
    window.addEventListener('submit', function (e) { e.preventDefault(); e.stopPropagation(); }, true);
    terap();
  }
  (async function () {
    try { bolehEdit = (await DB.peran()) === 'admin'; await muat; } catch (e) { bolehEdit = false; }
    if (bolehEdit) mulai(); else alert('Mode edit hanya untuk admin. Silakan login sebagai admin, lalu buka lagi dari panel admin.');
  })();
})();
