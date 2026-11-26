/* orang.js — pembantu bersama untuk foto + keterangan struktur & pengajar.
   Dipakai index.html dan portal-pengajar.html. Boleh juga dimuat di struktur.html / pengajar.html.
   API: DF.foto(x), DF.ket(x), DF.jab(x), DF.avatar(x, kelas), DF.detail(x) */
(function(){
  if(window.DF)return;

  /* Normalisasi alamat foto: data URI, https, path relatif (foto/ani.jpg), link Google Drive */
  function foto(x){
    var f=typeof x==='string'?x:(x&&(x.foto||x.gambar||x.photo||x.img))||'';
    f=String(f).trim();
    if(!f)return'';
    var m=f.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
    if(m)return'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w600';
    if(/^(data:image\/|https?:\/\/|blob:)/i.test(f))return f;
    if(/^\/\//.test(f))return'https:'+f;
    if(/^(javascript|vbscript|data):/i.test(f))return'';
    return f; /* path relatif di hosting yang sama */
  }
  function ket(x){return String((x&&(x.keterangan||x.deskripsi||x.bio||x.ket))||'').trim()}
  function jab(x){return String((x&&(x.jabatan||x.mapel||x.peran))||'').trim()}

  function avatar(x,cls){
    var s=foto(x),ini=String((x&&x.nama)||'?').trim().charAt(0).toUpperCase()||'?';
    function huruf(){var e=document.createElement('span');e.className=(cls||'')+' oav';e.textContent=ini;return e}
    if(!s)return huruf();
    var im=document.createElement('img');
    im.className=cls||'';im.alt='Foto '+((x&&x.nama)||'');im.loading='lazy';im.decoding='async';im.referrerPolicy='no-referrer';
    im.onerror=function(){if(im.parentNode)im.parentNode.replaceChild(huruf(),im)};
    im.src=s;
    return im;
  }

  /* CSS modal + avatar huruf */
  var css=document.createElement('style');
  css.textContent=
  '.oav{display:grid;place-items:center;background:linear-gradient(145deg,#0f5d3f,#2a8a62);color:#f3dc93;font-family:Amiri,serif;font-weight:700}'+
  '#dfm{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,18,12,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}'+
  '#dfm.on{display:flex;animation:dfIn .25s ease}'+
  '@keyframes dfIn{from{opacity:0}to{opacity:1}}'+
  '#dfm .dfc{position:relative;width:min(440px,100%);max-height:90vh;overflow:auto;text-align:center;color:#fff;padding:34px 26px 26px;border-radius:26px;background:linear-gradient(160deg,#0f5d3f,#06301f);border:1px solid rgba(231,200,114,.55);box-shadow:0 30px 80px rgba(0,0,0,.55);animation:dfUp .35s cubic-bezier(.2,.9,.3,1.15)}'+
  '@keyframes dfUp{from{transform:translateY(24px) scale(.94);opacity:0}to{transform:none;opacity:1}}'+
  '#dfm .dff{width:150px;height:150px;border-radius:50%;object-fit:cover;font-size:4rem;box-shadow:0 0 0 4px rgba(255,255,255,.92),0 0 0 7px #c9a24a,0 12px 34px rgba(0,0,0,.4);margin:0 auto 18px;display:block}'+
  '#dfm .dfc h3{font-family:Amiri,serif;font-size:1.6rem;margin:0;color:#fff}'+
  '#dfm .dfj{display:inline-block;margin-top:6px;padding:3px 14px;border-radius:20px;background:rgba(231,200,114,.18);border:1px solid rgba(231,200,114,.5);color:#f3dc93;font-weight:700;font-size:.85rem}'+
  '#dfm .dfk{margin:16px 0 0;color:#dbeae1;line-height:1.7;white-space:pre-line;text-align:left;font-size:.96rem}'+
  '#dfm .dfk.kosong{color:#9fbcae;text-align:center;font-style:italic}'+
  '#dfm .dfx{position:absolute;top:10px;right:12px;width:36px;height:36px;border-radius:50%;border:0;cursor:pointer;background:rgba(255,255,255,.12);color:#fff;font-size:20px;line-height:1}'+
  '#dfm .dfx:hover{background:rgba(255,255,255,.25)}'+
  '@media(prefers-reduced-motion:reduce){#dfm.on,#dfm .dfc{animation:none}}';
  document.head.appendChild(css);

  var box,last;
  function tutup(){if(!box)return;box.classList.remove('on');document.body.style.overflow='';if(last&&last.focus)try{last.focus()}catch(e){}}
  function detail(x){
    if(!x)return;
    last=document.activeElement;
    if(!box){
      box=document.createElement('div');box.id='dfm';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
      box.addEventListener('click',function(e){if(e.target===box)tutup()});
      document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('on'))tutup()});
      document.body.appendChild(box);
    }
    box.textContent='';
    var c=document.createElement('div');c.className='dfc';
    var xb=document.createElement('button');xb.type='button';xb.className='dfx';xb.setAttribute('aria-label','Tutup');xb.textContent='\u00d7';xb.onclick=tutup;
    c.appendChild(xb);
    c.appendChild(avatar(x,'dff'));
    var h=document.createElement('h3');h.textContent=x.nama||'';c.appendChild(h);
    var j=jab(x);if(j){var sj=document.createElement('span');sj.className='dfj';sj.textContent=j;c.appendChild(sj)}
    var k=ket(x),p=document.createElement('p');
    p.className='dfk'+(k?'':' kosong');p.textContent=k||'Keterangan belum ditambahkan.';
    c.appendChild(p);
    box.appendChild(c);
    box.setAttribute('aria-label','Detail '+(x.nama||''));
    box.classList.add('on');document.body.style.overflow='hidden';
    xb.focus();
  }

  window.DF={foto:foto,ket:ket,jab:jab,avatar:avatar,detail:detail};
})();
