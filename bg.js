/* Pelengkap tampilan semua halaman: teks berjalan di atas + sorot kursor di kepala halaman. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Teks berjalan ===== */
  var tick = document.getElementById('tick'), m = tick && tick.querySelector('.tick-m');
  if (m && !document.getElementById('tickx')) {
    var run = document.createElement('div'); run.id = 'tickx'; run.setAttribute('aria-hidden', 'true'); m.appendChild(run);
    var lab = tick.querySelector('.tick-l span'); if (lab) lab.textContent = 'Info';
    var h = new Date().getHours(), waktu = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
    var DEF = [
      { t: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ', c: 'ar' },
      { t: 'Selamat ' + waktu + '! Selamat datang di Rumah Quran dan Literasi Daarul Fikr, Desa Tolondadu, Bolaang Uki' },
      { t: 'Pendaftaran santri baru dibuka. Daftar online dari HP, tanpa antre!', h: 'daftar.html' },
      { t: "Senin–Kamis: Iqra' & Tahsin, 16.00–17.30 WITA" },
      { t: 'Jumat: Tahfidz & setoran hafalan  •  Sabtu: Taman Baca & literasi' },
      { t: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', c: 'ar' }
    ];
    var extra = [], dari = null; /* dari = daftar kalimat dari Pengaturan admin */
    function isi() {
      var base = dari ? dari.map(function (x) { return { t: x }; }) : DEF, items = extra.concat(base), g = document.createElement('div');
      g.className = 'tg';
      items.forEach(function (x) {
        var s = document.createElement('span'); s.className = 'ti' + (x.c ? ' ' + x.c : '') + (x.p ? ' pn' : '');
        if (x.h) { var a = document.createElement('a'); a.href = x.h; a.textContent = x.t; s.appendChild(a); } else s.textContent = x.t;
        var st = document.createElement('span'); st.className = 'st'; st.textContent = '✦';
        g.appendChild(s); g.appendChild(st);
      });
      run.textContent = ''; run.appendChild(g); run.appendChild(g.cloneNode(true));
      var w = g.getBoundingClientRect().width || 1200; run.style.setProperty('--tkd', Math.max(20, Math.round(w / 70)) + 's'); /* ~70 px/detik */
    }
    /* konten.js memanggil ini setelah membaca Pengaturan */
    window.setTickerItems = function (list) { dari = (list && list.length) ? list : null; isi(); };
    if (window.TICK_SETTINGS && window.TICK_SETTINGS.length) dari = window.TICK_SETTINGS;
    isi();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(isi);
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(isi, 250); });
    /* pengumuman yang disematkan ikut berjalan */
    (function () {
      function ambil() {
        if (!window.DB || !DB.list) return;
        DB.list('pengumuman').then(function (L) {
          extra = (L || []).filter(function (x) { return x.pin === 'Ya' && x.judul; }).slice(0, 3).map(function (x) { return { t: 'Pengumuman: ' + x.judul, p: 1, h: 'pengumuman.html' }; });
          if (extra.length) isi();
        }).catch(function () { });
      }
      if (document.readyState === 'complete') setTimeout(ambil, 800); else addEventListener('load', function () { setTimeout(ambil, 800); });
    })();
  }

  /* ===== Sorot kursor (hanya perangkat dengan mouse) ===== */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    [].forEach.call(document.querySelectorAll('.hero,.phead'), function (box) {
      var g = document.createElement('div'); g.className = 'glow'; g.setAttribute('aria-hidden', 'true'); box.appendChild(g);
      box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); g.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px)'; g.classList.add('on'); });
      box.addEventListener('pointerleave', function () { g.classList.remove('on'); });
    });
  }
})();
