/* Teks berjalan bersama untuk semua halaman. Membuat bar #tick bila belum ada. */
(function(){if(!document.getElementById('tick')){var d=document.createElement('div');d.className='tick';d.id='tick';d.setAttribute('role','marquee');d.setAttribute('aria-label','Selamat datang');d.innerHTML='<div class="tick-l"><span>Selamat Datang</span></div><div class="tick-m"><div class="tick-t" id="tickt"></div></div>';var h=document.querySelector('header');if(h)h.insertBefore(d,h.firstChild);else{d.className+=' solo';document.body.insertBefore(d,document.body.firstChild)}}})();
/* Teks berjalan: menimpa isi ticker lama, otomatis menambah pengumuman sematan */
(function(){
  var tick=document.getElementById('tick'),m=tick&&tick.querySelector('.tick-m');if(!m)return;
  var run=document.createElement('div');run.id='tickx';run.setAttribute('aria-hidden','true');m.appendChild(run);
  var lab=tick.querySelector('.tick-l span');if(lab)lab.textContent='Info';
  var base=[
    {t:'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',c:'ar'},
    {t:'Selamat datang di Rumah Quran dan Literasi Daarul Fikr, Desa Tolondadu, Bolaang Uki'},
    {t:'Pendaftaran santri baru dibuka. Daftar online dari HP, tanpa antre!',h:'daftar.html'},
    {t:'Senin–Kamis: Iqra’ & Tahsin, 16.00–17.30 WITA'},
    {t:'Jumat: Tahfidz & setoran hafalan  •  Sabtu: Taman Baca & literasi'},
    {t:'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',c:'ar'}
  ];
  var extra=[];
  function isi(){
    var items=extra.concat(base),g=document.createElement('div');g.className='tg';
    items.forEach(function(x){
      var s=document.createElement('span');s.className='ti'+(x.c?' '+x.c:'')+(x.p?' pn':'');
      if(x.h){var a=document.createElement('a');a.href=x.h;a.textContent=x.t;s.appendChild(a)}else s.textContent=x.t;
      var st=document.createElement('span');st.className='st';st.textContent='✦';
      g.appendChild(s);g.appendChild(st);
    });
    run.textContent='';run.appendChild(g);run.appendChild(g.cloneNode(true));
    /* kecepatan tetap ~70px/detik, berapa pun panjang teksnya */
    var w=g.getBoundingClientRect().width||1200;run.style.setProperty('--tkd',Math.max(20,Math.round(w/70))+'s');
  }
  isi();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(isi);
  function ambil(){
    if(!window.DB||!DB.list)return;
    DB.list('pengumuman').then(function(L){
      extra=(L||[]).filter(function(x){return x.pin==='Ya'&&x.judul}).slice(0,3).map(function(x){return {t:'Pengumuman: '+x.judul,p:1,h:'pengumuman.html'}});
      if(extra.length)isi();
    }).catch(function(){});
  }
  if(document.readyState==='complete')setTimeout(ambil,700);else addEventListener('load',function(){setTimeout(ambil,700)});
})();
