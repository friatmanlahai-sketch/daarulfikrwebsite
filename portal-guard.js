/* Penjaga portal: satu pintu masuk (masuk.html). Setiap portal memeriksa peran akun lalu mengarahkan ke tempat yang benar. */
(function(){
  var HOME={admin:'admin.html',kepala:'admin.html',pengajar:'portal-pengajar.html',ortu:'ortu.html'};
  var BOLEH={'admin.html':['admin','kepala'],'portal-pengajar.html':['pengajar','admin'],'ortu.html':['ortu']};
  var hal=(location.pathname.split('/').pop()||'index.html');
  function buka(){var h=document.getElementById('pg-h');if(h)h.remove();document.documentElement.style.visibility='visible'}
  function ke(u){location.replace(u)}
  window.PORTAL_HOME=HOME;
  if(!BOLEH[hal]){return}
  (async function(){
    try{
      var r=await DB.peran();
      if(!r){ke('masuk.html?next='+encodeURIComponent(hal));return}
      if(BOLEH[hal].indexOf(r)<0){ke(HOME[r]||'masuk.html');return}
      window.PERAN=r;buka();
    }catch(e){ke('masuk.html?next='+encodeURIComponent(hal))}
  })();
  setTimeout(function(){if(!window.PERAN)ke('masuk.html?next='+encodeURIComponent(hal))},15000);
})();
