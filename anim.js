/* Animasi bersama: website, admin, dan portal orang tua.
   Dimuat di <head> setelah window.LOGO64. Jika berkas ini tidak ada, halaman tetap berfungsi. */
(function () {
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function dl(sel, n, step, base) { var o = ''; for (var i = 1; i <= n; i++) o += sel + ':nth-child(' + i + '){animation-delay:' + (base + i * step).toFixed(2) + 's}'; return o; }

  var css = [
    '@keyframes fadeIn{from{opacity:0}}',
    '@keyframes rise{from{opacity:0;transform:translateY(18px)}}',
    '@keyframes slideR{from{opacity:0;transform:translateX(-18px)}}',
    '@keyframes rowIn{from{opacity:0;transform:translateX(10px)}}',
    '@keyframes pop{from{opacity:0;transform:scale(.86) translateY(10px)}}',
    '@keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}}',
    '@keyframes float{50%{transform:translateY(-9px)}}',
    '@keyframes spin{to{transform:rotate(360deg)}}',
    '@keyframes growY{from{transform:scaleY(0)}}',
    '@keyframes growX{from{transform:scaleX(0)}}',
    '@keyframes donut{from{opacity:0;transform:rotate(-140deg) scale(.55)}}',
    '@keyframes barIn{from{transform:scaleY(0)}}',
    '@keyframes gradMove{50%{background-position:100% 50%}}',
    '@keyframes wiggle{25%{transform:rotate(-12deg) scale(1.1)}75%{transform:rotate(10deg) scale(1.1)}}',
    '@keyframes ping{0%{transform:scale(.9);opacity:.8}100%{transform:scale(1.5);opacity:0}}',
    '@keyframes pulseB{0%{box-shadow:0 0 0 0 rgba(230,180,34,.6)}70%{box-shadow:0 0 0 9px rgba(230,180,34,0)}100%{box-shadow:0 0 0 0 rgba(230,180,34,0)}}',
    '@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}',
    '@keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(.93)}}',
    '@keyframes toastIn{from{opacity:0;transform:translate(-50%,30px) scale(.88)}}',
    '@keyframes rpl{to{transform:scale(1);opacity:0}}',
    '@keyframes cf{to{transform:translate3d(var(--dx),108vh,0) rotate(var(--r));opacity:.9}}',
    '@keyframes swing{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}',
    '@keyframes wordIn{from{opacity:0;transform:translateY(.55em) rotate(2deg)}to{opacity:1;transform:none}}',
    '@keyframes welcomeIn{from{opacity:0;letter-spacing:.3em;filter:blur(10px);transform:scale(.92)}}',
    '@keyframes sheen{to{background-position:-220% 0}}',
    '@keyframes glowP{50%{text-shadow:0 0 44px rgba(231,200,114,.95)}}',
    '@keyframes wave{0%,60%,100%{transform:rotate(0)}10%{transform:rotate(14deg)}20%{transform:rotate(-8deg)}30%{transform:rotate(14deg)}40%{transform:rotate(-4deg)}50%{transform:rotate(10deg)}}',
    '@keyframes lineGrow{from{width:0;opacity:0}}',
    '@keyframes naikP{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:.9}100%{transform:translateY(-105vh) scale(1.2);opacity:0}}',

    /* umum */
    '.btn{position:relative;overflow:hidden}',
    '.btn:active{transform:scale(.96)!important}',
    '.btn::after{content:"";position:absolute;top:0;left:-130%;width:55%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);transform:skewX(-20deg);transition:left .65s;pointer-events:none}',
    '.btn:hover::after{left:150%}',
    '.rpl{position:absolute;border-radius:50%;background:rgba(255,255,255,.5);transform:scale(0);animation:rpl .65s ease-out forwards;pointer-events:none}',
    '.mc,#lgf{animation:modalIn .32s cubic-bezier(.2,.9,.3,1.15)}',
    '.mod,#lgm{animation:fadeIn .25s}',
    '#toast.show{animation:toastIn .45s cubic-bezier(.2,.9,.3,1.3)}',
    '.cf{position:fixed;top:-14px;width:9px;height:14px;z-index:99998;pointer-events:none;animation:cf var(--t) cubic-bezier(.25,.6,.4,1) forwards}',
    '.pt{position:absolute;inset:0;overflow:hidden;pointer-events:none}',
    '.pt i{position:absolute;bottom:-12px;border-radius:50%;background:#e7c872;box-shadow:0 0 10px 2px rgba(231,200,114,.7);opacity:0;animation:naikP linear infinite}',
    '.sk{height:84px;border-radius:16px;margin-bottom:14px;background:linear-gradient(90deg,#e7ece8 25%,#f6f9f7 37%,#e7ece8 63%);background-size:400% 100%;animation:shimmer 1.3s infinite}',

    /* pemuat awal (website) */
    '#pl{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#0f5d3f,#04271a);transition:opacity .55s,visibility .55s;pointer-events:none}',
    '#pl.out{opacity:0;visibility:hidden}',
    '#pl .pb{position:relative;display:grid;place-items:center;width:230px;height:230px}',
    '#pl .pb::before{content:"";position:absolute;inset:0;border-radius:50%;border:3px solid transparent;border-top-color:#e7c872;border-right-color:rgba(231,200,114,.35);animation:spin 1.1s linear infinite}',
    '#pl .pb::after{content:"";position:absolute;inset:14px;border-radius:50%;border:2px solid transparent;border-bottom-color:rgba(231,200,114,.6);animation:spin 1.8s linear infinite reverse}',
    '#pl img{width:140px;background:#fff;border-radius:16px;padding:8px 12px;animation:float 2s ease-in-out infinite;box-shadow:0 0 50px rgba(231,200,114,.45)}',

    /* admin */
    '#login .lgl{position:relative;overflow:hidden}',
    '#login .lgl>*:not(.pt){position:relative;animation:rise .8s backwards}',
    '#login .lgl>img{animation:rise .8s backwards,float 4s ease-in-out .9s infinite}',
    dl('#login .lgl>*', 4, .12, .05),
    '#login .box{animation:rise .8s .2s backwards}',
    '#nav button{animation:slideR .45s backwards}',
    dl('#nav>*', 18, .035, .1),
    '#nav button i{transition:transform .25s}#nav button:hover i{transform:scale(1.25) rotate(-8deg)}',
    '#nav button.on::before{animation:barIn .35s}',
    '#main>*{animation:rise .5s backwards}',
    dl('#main>*', 6, .07, 0),
    '#main>.hello{background-size:230% 230%;animation:rise .55s backwards,gradMove 14s ease-in-out infinite}',
    '#main>.sk{animation:shimmer 1.3s infinite}',
    '.stats .st{animation:pop .55s cubic-bezier(.2,.9,.3,1.2) backwards}',
    dl('.stats .st', 8, .06, .1),
    '.st:hover i{animation:wiggle .6s}',
    '.col .br{transform-origin:bottom;animation:growY .95s cubic-bezier(.2,.8,.2,1) backwards}',
    dl('.chart .col', 8, .07, .25),
    '.hb .tr div{transform-origin:left;animation:growX 1.1s cubic-bezier(.2,.8,.2,1) .3s backwards}',
    '.dn{animation:donut 1.3s cubic-bezier(.2,.8,.2,1) .3s backwards}',
    '.rec{animation:slideR .45s backwards}',
    dl('.rec', 6, .07, .2),
    '#tb tr{animation:rowIn .35s backwards}',
    dl('#tb tr', 10, .035, 0),
    '.bdg{animation:pulseB 2s infinite}',
    '.av{transition:transform .25s}tr:hover .av{transform:scale(1.12) rotate(-6deg)}',

    /* portal orang tua */
    'body.guest .auth{animation:rise .8s backwards}',
    '#auth .card{animation:rise .8s .12s backwards}',
    '#fl:not([hidden]),#fr:not([hidden]){animation:fadeIn .45s}',
    '[id^=v-]:not([hidden]){animation:rise .45s backwards}',
    '.anak{animation:rise .6s backwards}',
    dl('#v-ring>.anak', 6, .12, .05),
    '.ah .av{position:relative}.ah .av::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid #c9a24a;animation:ping 2.6s infinite}',
    '.st4 div{animation:pop .5s backwards}',
    dl('.st4 div', 4, .07, .25),
    '.png{animation:slideR .4s backwards}',
    dl('#v-ring .png', 6, .06, .2),
    'body:not(.guest) .pt{display:none}',

    /* ucapan selamat datang */
    '.wl-ar{animation:fadeDown 1s backwards,glowP 3.4s ease-in-out 1.2s infinite}',
    '.wl-ar::before,.wl-ar::after{animation:lineGrow 1.2s .5s backwards}',
    '.wl-t{animation:welcomeIn 1.1s cubic-bezier(.2,.8,.2,1) .2s backwards,sheen 6s linear 1.4s infinite}',
    '.wl-s{animation:rise .9s .7s backwards}',
    '.wave{display:inline-block;transform-origin:70% 80%;animation:wave 2.4s ease-in-out 1s infinite}',
    '.wel{animation:rise .6s backwards}.wel b{animation:slideR .6s .2s backwards}',
    '.hi{animation:fadeDown .8s backwards}',

    /* website */
    '.hero .lan{position:absolute;top:0;z-index:1;transform-origin:50% 0;animation:swing 4.6s ease-in-out infinite alternate;filter:drop-shadow(0 0 16px rgba(231,200,114,.65));pointer-events:none}',
    '.hero .lan.l1{left:1.6%}.hero .lan.l2{right:2%;animation-duration:5.6s;animation-delay:-1.7s}',
    '@media(max-width:1239px){.hero .lan{display:none}}',
    '.hero .spot{position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(520px circle at var(--mx,50%) var(--my,30%),rgba(231,200,114,.16),transparent 62%)}',
    '.hw1{display:inline-block;opacity:0;animation:wordIn .75s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--w)*80ms + 500ms)}',
    '.js h2.rv::after{width:0;transition:width .9s .35s ease}.js h2.rv.in::after{width:70px}',
    '.prog .i,.kel i{transition:transform .35s}.prog li:hover .i{transform:rotate(-8deg) scale(1.12)}.kel>div:hover i{transform:scale(1.15) rotate(8deg)}',
    '.menu li{animation:fadeDown .6s backwards}',
    dl('.menu>li', 9, .06, .1),
    '.hero .hl li{animation:rise .7s backwards}',
    dl('.hero .hl li', 6, .1, .9),

    /* kurangi gerakan */
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}.hw1{opacity:1}#pl,.lan,.pt{display:none!important}}'
  ].join('\n');

  var st = document.createElement('style'); st.id = 'anim-css'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  if (RM) return;

  /* ---- pemuat awal: hanya di website ---- */
  var T0 = Date.now(), pl = null;
  function bukaPemuat() {
    pl = document.createElement('div'); pl.id = 'pl';
    pl.innerHTML = '<div class="pb">' + (window.LOGO64 ? '<img alt="" src="' + window.LOGO64 + '">' : '') + '</div>';
    document.documentElement.appendChild(pl);
    var done = false;
    function tutup() { if (done) return; done = true; setTimeout(function () { pl.classList.add('out'); setTimeout(function () { if (pl.parentNode) pl.remove(); }, 700); }, Math.max(0, 700 - (Date.now() - T0))); }
    if (document.readyState === 'complete') tutup(); else addEventListener('load', tutup);
    setTimeout(tutup, 4500);
  }
  if (/(^|\/)(index\.html)?$/.test(location.pathname) || /index\.html/.test(location.pathname)) bukaPemuat();

  /* ---- kertas konfeti ---- */
  var WARNA = ['#e7c872', '#c9a24a', '#0f5d3f', '#2e9e68', '#ffffff', '#f6d365'];
  window.confetti = function (n) {
    n = n || 80; var f = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var c = document.createElement('i'); c.className = 'cf';
      c.style.cssText = 'left:' + (10 + Math.random() * 80) + '%;background:' + WARNA[i % WARNA.length] + ';--dx:' + ((Math.random() - .5) * 340) + 'px;--r:' + ((Math.random() - .5) * 1400) + 'deg;--t:' + (2.2 + Math.random() * 1.8) + 's;animation-delay:' + (Math.random() * .35) + 's;' + (i % 3 === 0 ? 'border-radius:50%;width:9px;height:9px' : '');
      f.appendChild(c);
    }
    document.body.appendChild(f);
    setTimeout(function () { [].slice.call(document.querySelectorAll('.cf')).forEach(function (e) { e.remove(); }); }, 4600);
  };

  /* ---- hitung naik ---- */
  function countUp(el) {
    if (el.dataset.cu) return; var t = el.textContent.trim(), m = /^(\D*?)(\d[\d.,]*)(\D*)$/.exec(t); if (!m) return;
    var n = parseFloat(m[2].replace(/\./g, '').replace(',', '.')); if (!isFinite(n) || n === 0 || n > 1e9) return;
    el.dataset.cu = 1; var t0 = null;
    function f(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1000), e = 1 - Math.pow(1 - k, 3); el.textContent = m[1] + Math.round(n * e).toLocaleString('id-ID') + m[3]; if (k < 1) requestAnimationFrame(f); else el.textContent = t; }
    el.textContent = m[1] + '0' + m[3]; requestAnimationFrame(f);
  }
  function pantau(id, sel) {
    var e = document.getElementById(id); if (!e) return;
    function jalan() { [].slice.call(e.querySelectorAll(sel)).forEach(countUp); }
    new MutationObserver(jalan).observe(e, { childList: true }); jalan();
  }
  function partikel(wadah, n) {
    var p = document.createElement('div'); p.className = 'pt';
    for (var i = 0; i < n; i++) { var d = document.createElement('i'), z = 2 + Math.random() * 4; d.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + z + 'px;height:' + z + 'px;animation-duration:' + (9 + Math.random() * 12) + 's;animation-delay:-' + (Math.random() * 20) + 's'; p.appendChild(d); }
    if (wadah === document.body) p.style.position = 'fixed';
    wadah.insertBefore(p, wadah.firstChild);
  }
  function lentera(i) {
    return '<svg class="lan l' + i + '" width="58" height="160" viewBox="0 0 60 160" aria-hidden="true"><defs><radialGradient id="lg' + i + '" cx="50%" cy="55%" r="60%"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#e7c872"/><stop offset="1" stop-color="#9a7421"/></radialGradient></defs>'
      + '<line x1="30" y1="0" x2="30" y2="42" stroke="#c9a24a" stroke-width="2"/><path d="M21 42h18l-3 8H24z" fill="#c9a24a"/>'
      + '<path d="M13 50h34c5 16 5 42 0 56H13c-5-14-5-40 0-56z" fill="url(#lg' + i + ')" stroke="#e7c872" stroke-width="1.5"/>'
      + '<path d="M30 50v56M21 50c-5 16-5 40 0 56M39 50c5 16 5 40 0 56" stroke="#9a7421" stroke-opacity=".55" fill="none"/>'
      + '<path d="M20 106h20l-3 8H23z" fill="#c9a24a"/><path d="M30 114v16" stroke="#c9a24a" stroke-width="2"/><circle cx="30" cy="135" r="4.5" fill="#e7c872"/><path d="M30 139v14" stroke="#c9a24a" stroke-width="1.5"/></svg>';
  }
  function pecahKata() {
    var h = document.querySelector('.hal-k h1'); if (!h || h.querySelector('.hw1')) return;
    var t = h.textContent.trim(); if (!t) return; h.textContent = '';
    t.split(/\s+/).forEach(function (w, i) { var s = document.createElement('span'); s.className = 'hw1'; s.style.setProperty('--w', i); s.textContent = w; h.appendChild(s); h.appendChild(document.createTextNode(' ')); });
  }

  function mulai() {
    /* riak saat klik */
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn'); if (!b || b.disabled) return;
      var r = b.getBoundingClientRect(), z = Math.max(r.width, r.height) * 2, s = document.createElement('span');
      s.className = 'rpl'; s.style.cssText = 'width:' + z + 'px;height:' + z + 'px;left:' + (e.clientX - r.left - z / 2) + 'px;top:' + (e.clientY - r.top - z / 2) + 'px';
      b.appendChild(s); setTimeout(function () { s.remove(); }, 700);
    }, { passive: true });

    /* konfeti: sukses pendaftaran (website) dan notifikasi sukses (admin/portal) */
    var ok = document.getElementById('ok');
    if (ok) { var tampil = false; new MutationObserver(function () { var s = ok.style.display === 'block'; if (s && !tampil) window.confetti(110); tampil = s; }).observe(ok, { attributes: true, attributeFilter: ['style'] }); }
    var ts = document.getElementById('toast'), last = 0;
    if (ts) new MutationObserver(function () {
      if (!ts.classList.contains('show') || Date.now() - last < 1200) return;
      if (/berhasil dibuat|^Terkirim|Status diubah: Diterima|disetujui|ditautkan/i.test(ts.textContent)) { last = Date.now(); window.confetti(70); }
    }).observe(ts, { attributes: true, attributeFilter: ['class'] });

    /* angka naik */
    pantau('main', '.st b'); pantau('v-ring', '.st4 b');

    /* partikel di layar masuk */
    var lgl = document.querySelector('#login .lgl'); if (lgl) partikel(lgl, 20);
    if (document.body.classList.contains('guest')) partikel(document.body, 18);

    /* website: lentera, sorotan kursor, kata judul */
    var hero = document.querySelector('.hero');
    if (hero) {
      var w = document.createElement('div'); w.innerHTML = lentera(1) + lentera(2); while (w.firstChild) hero.appendChild(w.firstChild);
      var sp = document.createElement('div'); sp.className = 'spot'; hero.appendChild(sp);
      var raf = 0; hero.addEventListener('pointermove', function (e) { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; var r = hero.getBoundingClientRect(); sp.style.setProperty('--mx', (e.clientX - r.left) + 'px'); sp.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
      pecahKata(); var h1 = document.querySelector('.hal-k h1'); if (h1) new MutationObserver(function () { if (!h1.querySelector('.hw1')) pecahKata(); }).observe(h1, { childList: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();
