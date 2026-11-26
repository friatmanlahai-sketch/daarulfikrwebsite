/* Efek hidup untuk semua halaman: partikel bintang emas + kilau kursor, aurora latar, muncul saat digulir,
   kartu miring 3D, riak tombol, hitung naik angka statistik. Ringan, berhenti saat tab disembunyikan. */
(function(){
  if(window.__fx)return;window.__fx=1;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var lemah=(navigator.hardwareConcurrency||4)<=2||(navigator.deviceMemory||4)<=2;
  var de=document.documentElement;
  de.classList.add('fx-go');

  /* ===== latar aurora (kecuali halaman yang sudah punya sendiri) ===== */
  if(!document.querySelector('.bgfx,#fxa')){
    var a=document.createElement('div');a.id='fxa';a.setAttribute('aria-hidden','true');a.innerHTML='<i></i><i></i><i></i>';document.body.insertBefore(a,document.body.firstChild);
  }

  /* ===== kanvas partikel ===== */
  if(!reduce){
    var cv=document.createElement('canvas');cv.id='fxc';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);
    var HURUF='ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),cx=cv.getContext('2d'),W=0,H=0,dpr=Math.min(devicePixelRatio||1,2),P=[],S=[],mx=-999,my=-999,lastT=0,run=true,jalan=false;
    function ukur(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.min(lemah?18:46,Math.round(W*H/32000));while(P.length<n)P.push(buat(true));P.length=n}
    function buat(acak){var s=Math.random();return{x:Math.random()*W,y:acak?Math.random()*H:H+20,r:10+Math.random()*9,star:true,h:HURUF[Math.floor(Math.random()*HURUF.length)],
      vy:.12+Math.random()*.35,sw:Math.random()*6.28,sf:.3+Math.random()*.7,rot:(Math.random()-.5)*.6,rv:(Math.random()-.5)*.004,a:.22+Math.random()*.4}}
    function bintang(x,y,r,rot){cx.beginPath();for(var i=0;i<16;i++){var ang=rot+i*Math.PI/8,rr=i%2?r*.5:r;cx.lineTo(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr)}cx.closePath()}
    function gambar(t){
      jalan=false;if(!run)return;
      var dt=t-lastT;if(lemah&&dt<33){req();return}lastT=t;
      cx.clearRect(0,0,W,H);
      for(var i=0;i<P.length;i++){var p=P[i];
        p.y-=p.vy;p.x+=Math.sin(t/1000*p.sf+p.sw)*.25;p.rot+=p.rv;
        var dx=p.x-mx,dy=p.y-my,d=dx*dx+dy*dy;if(d<14000){var f=(1-d/14000)*1.6,l=Math.sqrt(d)||1;p.x+=dx/l*f;p.y+=dy/l*f}
        if(p.y<-20||p.x<-30||p.x>W+30){P[i]=buat(false);continue}
        cx.globalAlpha=p.a;cx.shadowColor='rgba(231,200,114,.9)';cx.shadowBlur=8;cx.fillStyle='#d9ae45';
        cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.font='700 '+p.r+'px Amiri,"Noto Naskh Arabic",serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(p.h,0,0);cx.restore();
      }
      cx.shadowBlur=0;
      /* garis tipis antar partikel yang berdekatan di sekitar kursor */
      if(fine&&mx>0){cx.lineWidth=1;for(var a=0;a<P.length;a++){var A=P[a];if(Math.abs(A.x-mx)>150||Math.abs(A.y-my)>150)continue;
        for(var b=a+1;b<P.length;b++){var B=P[b],q=(A.x-B.x)*(A.x-B.x)+(A.y-B.y)*(A.y-B.y);if(q<9000&&Math.abs(B.x-mx)<150&&Math.abs(B.y-my)<150){cx.globalAlpha=(1-q/9000)*.4;cx.strokeStyle='#e0b650';cx.beginPath();cx.moveTo(A.x,A.y);cx.lineTo(B.x,B.y);cx.stroke()}}}}
      /* kilau jejak kursor */
      for(var k=S.length-1;k>=0;k--){var s=S[k];s.l-=.025;if(s.l<=0){S.splice(k,1);continue}s.x+=s.vx;s.y+=s.vy;s.vy+=.02;
        cx.globalAlpha=s.l*.8;cx.shadowColor='rgba(231,200,114,1)';cx.shadowBlur=8;cx.fillStyle='#f3dc93';cx.font='700 '+Math.round(9+s.r*s.l*2.5)+'px Amiri,"Noto Naskh Arabic",serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(s.h,s.x,s.y);cx.shadowBlur=0}
      cx.globalAlpha=1;req();
    }
    function req(){if(!jalan&&run){jalan=true;requestAnimationFrame(gambar)}}
    ukur();addEventListener('resize',function(){ukur()});
    document.addEventListener('visibilitychange',function(){run=!document.hidden;if(run)req()});
    if(fine){var lt=0;addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;var n=Date.now();if(n-lt>45&&S.length<40){lt=n;S.push({x:mx,y:my,vx:(Math.random()-.5)*.8,vy:-.3-Math.random()*.6,l:1,r:2+Math.random()*3,h:HURUF[Math.floor(Math.random()*HURUF.length)]})}},{passive:true});
      addEventListener('pointerleave',function(){mx=my=-999})}
    req();
  }

  /* ===== muncul saat digulir + kartu miring + riak tombol ===== */
  var SEL_R='.card,.pk,.ocard,.gel,.gal,.cat,.qa,.jk,.tsl,.ifk,.qr,.ctl>div,.st,.stl>*,.stats>*,.kg>*,.kar,.pg,.pgj>.w>*,.grid2>*,.kos,.kosongpg,.wel,.pf,.tp,.fg>div,details,.lbn,.ayatband';
  var SEL_T='.card,.pk,.ocard,.gel,.gal,.cat,.jk,.tsl,.ifk,.qr,.st,.stl>*,.stats>*,.kar,.pg,.tp';
  var io=('IntersectionObserver' in window)&&!reduce?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('fx-in');io.unobserve(e.target);hitung(e.target)}})},{threshold:.08,rootMargin:'0px 0px -6% 0px'}):null;
  function tandai(root){
    (root.querySelectorAll?root.querySelectorAll(SEL_R):[]).forEach(function(el,i){
      if(el.__fx)return;el.__fx=1;
      if(el.closest('header,#lgm,#m,.modal,[hidden]')&&!el.closest('main,section'))return;
      var r=el.getBoundingClientRect();
      if(io&&r.top>innerHeight*.92){el.classList.add('fx-r');el.style.setProperty('--fxd',Math.min(i%6,5)*70+'ms');io.observe(el);setTimeout(function(){el.classList.add('fx-in')},4500)}
      else hitung(el);
      if(fine&&!reduce&&el.matches(SEL_T)&&!el.matches('details,input,textarea,select'))pasangMiring(el);
    });
  }
  function pasangMiring(el){el.classList.add('fx-t');
    el.addEventListener('pointermove',function(e){var b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
      el.style.setProperty('--ry',((x-.5)*7).toFixed(2)+'deg');el.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg');el.style.setProperty('--mx',(x*100)+'%');el.style.setProperty('--my',(y*100)+'%');el.classList.add('fx-h')});
    el.addEventListener('pointerleave',function(){el.classList.remove('fx-h');el.style.removeProperty('--rx');el.style.removeProperty('--ry')})}
  function hitung(root){
    if(reduce)return;
    var L=[];if(root.children&&root.children.length===0)L.push(root);else if(root.querySelectorAll)L=[].slice.call(root.querySelectorAll('b,strong,span,div,h3,h4')).filter(function(x){return x.children.length===0});
    L.forEach(function(el){
      if(el.__cnt)return;var tx=(el.textContent||'').trim();
      var m=/^(Rp\s?)?(\d{1,3}(?:\.\d{3})+|\d{1,7})(\+|%)?$/.exec(tx);if(!m||el.closest('input,textarea,select,table'))return;
      var tgt=parseInt(m[2].replace(/\./g,''),10);if(!(tgt>0)||tgt>9999999)return;el.__cnt=1;
      var t0=null,sep=m[2].indexOf('.')>-1;
      (function f(t){if(t0===null)t0=t;var k=Math.min(1,(t-t0)/1100),v=Math.round(tgt*(1-Math.pow(1-k,3)));
        var s=sep?String(v).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):String(v);el.textContent=(m[1]||'')+s+(m[3]||'');if(k<1)requestAnimationFrame(f)})(performance.now());
    });
  }
  document.addEventListener('pointerdown',function(e){
    var b=e.target.closest&&e.target.closest('.btn,.tbn,.cta,button.btn');if(!b||reduce)return;
    var r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement('span');s.className='fx-rp';
    s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';b.appendChild(s);setTimeout(function(){s.remove()},650)},{passive:true});

  /* tab / panel baru tampil dengan transisi halus */
  var mo=new MutationObserver(function(ms){
    ms.forEach(function(m){
      if(m.type==='attributes'&&m.attributeName==='hidden'&&!m.target.hidden&&m.target.matches&&m.target.matches('section,.panel,.tp,[role=tabpanel],form'))m.target.classList.remove('fx-sw'),void m.target.offsetWidth,m.target.classList.add('fx-sw');
    });
    clearTimeout(mo.t);mo.t=setTimeout(function(){tandai(document.body)},120);
  });
  function mulai(){tandai(document.body);mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mulai);else mulai();
})();
