/* Animasi sambutan di beranda: tulisan "Selamat Datang" berganti dengan efek ketik, dan kilau emas bergerak.
   Aman dimuat di semua halaman; bila elemen #wlt tidak ada, tidak melakukan apa pun. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = document.createElement('style');
  st.textContent =
    '.wl-t{animation:wlShine 6s linear infinite}' +
    '@keyframes wlShine{to{background-position:220% 0}}' +
    '.wl-t.ketik::after{content:"";display:inline-block;width:3px;height:.8em;margin-left:6px;vertical-align:-.04em;background:#e7c872;-webkit-text-fill-color:initial;animation:wlCaret .8s steps(1) infinite}' +
    '@keyframes wlCaret{50%{opacity:0}}' +
    '@media(prefers-reduced-motion:reduce){.wl-t{animation:none}.wl-t.ketik::after{animation:none}}';
  document.head.appendChild(st);

  function mulai() {
    var t = document.getElementById('wlt');
    if (!t || reduce) return;
    var kata = ['Selamat Datang', 'Welcome', 'Marhaban', 'Selamat Datang'], i = 0, timer;
    t.style.minHeight = t.offsetHeight + 'px';
    function ketik(s, k, sel) { // tulis s huruf demi huruf
      var n = 0;
      (function f() { n++; t.textContent = s.slice(0, n); if (n < s.length) timer = setTimeout(f, 70); else sel(); })();
    }
    function hapus(sel) {
      var s = t.textContent, n = s.length;
      (function f() { n--; t.textContent = s.slice(0, Math.max(n, 0)); if (n > 0) timer = setTimeout(f, 35); else sel(); })();
    }
    function putar() {
      timer = setTimeout(function () {
        t.classList.add('ketik');
        hapus(function () {
          i = (i + 1) % kata.length;
          ketik(kata[i], 0, function () { t.classList.remove('ketik'); putar(); });
        });
      }, 3200);
    }
    putar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();
