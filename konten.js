/* Pemetaan teks website <-> pengaturan admin. Dipakai index.html (apply) dan pembuat konten-default.js (read). */
(function () {
  var Q = function (s) { return document.querySelector(s); };
  var M = {
    tagline: ['.logo small'], ticker_label: ['.tick-l span'], selamat_arab: ['.wl-ar'], selamat_judul: ['.wl-t'], selamat_teks: ['.wl-n'],
    hero_judul: ['.hal-k h1'], hero_teks: ['.hal-k p'], hero_btn1: ['.aksi a:nth-child(1)'], hero_btn2: ['.aksi a:nth-child(2)'],
    hero_bismillah: ['.hal-b .bis'], hero_ayat: ['.hal-b .ayat'], hero_ayat_arti: ['.hal-b p'],
    alamat: ['.lok', '.kon dl > div:first-child dd', 'footer .fg > div:nth-child(3) > p'],
    tentang_judul: ['#tentang h2'], tentang_p1: ['#tentang .dua > div:first-child p:nth-of-type(1)'], tentang_p2: ['#tentang .dua > div:first-child p:nth-of-type(2)'],
    fakta_peserta: ['.fakta div:nth-child(1)', 't'], fakta_tempat: ['.fakta div:nth-child(2)', 't'], fakta_waktu: ['.fakta div:nth-child(3)', 't'],
    ayat_arab: ['.ayatband .ar'], ayat_arti: ['.ayatband p'],
    program_judul: ['#program h2'], program_lead: ['#program .lead'],
    keunggulan_judul: ['#keunggulan h2'], keunggulan_lead: ['#keunggulan .lead'],
    alur_judul: ['#alur h2'], alur_lead: ['#alur .lead'],
    jadwal_judul: ['#jadwal h2'], jadwal_catatan: ['#jadwal .cat'],
    pengajar_judul: ['#pengajar h2'], agenda_judul: ['#agenda h2'], testimoni_judul: ['#testimoni h2'], galeri_judul: ['#galeri h2'], pengumuman_judul: ['#pengumuman h2'],
    visi_judul: ['.vm .dua > div:first-child h2'], visi: ['.vm .dua > div:first-child p'], misi_judul: ['.vm .dua > div:nth-child(2) h3'],
    cta_judul: ['.cta h2'], cta_teks: ['.cta p'], cta_btn: ['.cta .btn'],
    faq_judul: ['#faq h2'],
    daftar_judul: ['#daftar h2'], daftar_lead: ['#daftar .lead'], daftar_catatan: ['#fd p.full'],
    kontak_judul: ['#kontak h2'], footer_teks: ['footer .fg > div:first-child > p:first-of-type']
  };
  function put(el, v, mode) { if (!el) return; if (mode === 't') { if (el.lastChild && el.lastChild.nodeType === 3) el.lastChild.nodeValue = v; } else el.textContent = v; }
  window.KONTEN = {
    keys: Object.keys(M),
    apply: function (st) {
      if (!st) return;
      Object.keys(M).forEach(function (k) { if (st[k]) M[k][0] && M[k].slice(0, M[k][1] === 't' ? 1 : M[k].length).forEach(function (s) { put(Q(s), st[k], M[k][1] === 't' ? 't' : null); }); });
      if (st.nama) { var sp = Q('.logo span'); if (sp && sp.firstChild && sp.firstChild.nodeType === 3) sp.firstChild.nodeValue = st.nama; var fs = Q('footer strong'); if (fs) fs.textContent = st.nama; }
      if (st.misi) { var ul = Q('.vm .dua > div:nth-child(2) ul'); if (ul) { ul.textContent = ''; st.misi.split('\n').forEach(function (t) { t = t.trim(); if (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); } }); } }
      if (st.peta) { var f = Q('.peta iframe'); if (f) f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(st.peta) + '&output=embed'; var a = Q('.kon a.btn'); if (a) a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(st.peta); }
      if (st.banner_teks) { var bn = Q('#bnr'); if (bn) { var sp2 = bn.querySelector('span'); sp2.textContent = st.banner_teks; var old = bn.querySelector('a'); if (old) old.remove(); if (st.banner_link && /^(https?:\/\/|#|\/|[\w.-]+\.html)/i.test(st.banner_link)) { var ba = document.createElement('a'); ba.href = st.banner_link; ba.textContent = ' Selengkapnya →'; bn.appendChild(ba); } bn.hidden = false; if (window.ukurHdr) window.ukurHdr(); } }
      if (st.ticker_tampil === 'Tidak') { var tk = Q('#tick'); if (tk) tk.style.display = 'none'; if (window.ukurHdr) window.ukurHdr(); }
      else if (st.ticker_teks && window.setTicker) { window.TICK_CUR = st.ticker_teks.split('\n'); window.setTicker(window.TICK_CUR); }
      if (st.selamat_tampil === 'Tidak') { var wc = Q('#welcome'); if (wc) wc.style.display = 'none'; }
      if (st.judul_web) document.title = st.judul_web;
      if (st.deskripsi_web) { var m = Q('meta[name=description]'); if (m) m.content = st.deskripsi_web; }
      if (st.logo) { document.querySelectorAll('[data-logo]').forEach(function (i) { i.src = st.logo; i.style.display = ''; }); var ic = Q('link[rel=icon]'); if (ic) ic.href = st.logo; }
    },
    read: function () {
      var o = {};
      Object.keys(M).forEach(function (k) { var el = Q(M[k][0]); if (el) o[k] = (M[k][1] === 't' ? (el.lastChild ? el.lastChild.nodeValue : '') : el.textContent).trim(); });
      var sp = Q('.logo span'); if (sp && sp.firstChild) o.nama = sp.firstChild.nodeValue.trim();
      o.misi = [].map.call(document.querySelectorAll('.vm .dua > div:nth-child(2) li'), function (l) { return l.textContent.trim(); }).join('\n');
      var f = Q('.peta iframe'), mm = f && /[?&]q=([^&]+)/.exec(f.src); if (mm) o.peta = decodeURIComponent(mm[1].replace(/\+/g, ' '));
      o.ticker_teks = (window.TICK_DEF || []).join('\n'); o.ticker_tampil = 'Ya'; o.selamat_tampil = 'Ya';
      o.judul_web = document.title; var m = Q('meta[name=description]'); if (m) o.deskripsi_web = m.content;
      return o;
    }
  };
})();
