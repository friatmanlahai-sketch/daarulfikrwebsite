/* Daarul Fikr — service worker sederhana. Naikkan nomor V setiap kali Anda mengubah file. */
var V='df-v33';
var SHELL=['./','index.html','struktur.html','tentang.html','program.html','kegiatan.html','faq.html','kontak.html','daftar.html','pengajar.html','pengumuman.html','galeri.html','infaq.html','privasi.html','halaman.css','style.css','bg.css','bg.js','editor.js','ticker.css','fx.css','fx.js','ticker.js','offline.html','masuk.html','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||/admin\.html|setup\.html|firebase-config\.js/.test(u.pathname))return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(function(x){var cp=x.clone();caches.open(V).then(function(c){c.put(r,cp)});return x}).catch(function(){return caches.match(r).then(function(x){return x||caches.match('offline.html')})}));
    return;
  }
  e.respondWith(caches.match(r).then(function(hit){
    var net=fetch(r).then(function(x){if(x&&x.ok){var cp=x.clone();caches.open(V).then(function(c){c.put(r,cp)})}return x}).catch(function(){return hit});
    return hit||net;
  }));
});
