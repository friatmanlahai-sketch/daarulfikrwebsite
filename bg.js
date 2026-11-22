/* Daarul Fikr — latar animasi, bintang & kunang-kunang, PWA (bg.js) */
(function(){
'use strict';
var D=document,RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* 1. lapisan hias pada bagian gelap */
var ORN='<svg class="bgx-orn %c" viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.1"><rect x="40" y="40" width="120" height="120"/><rect x="40" y="40" width="120" height="120" transform="rotate(45 100 100)"/><circle cx="100" cy="100" r="62"/><circle cx="100" cy="100" r="30"/><circle cx="100" cy="100" r="84" stroke-dasharray="2 6"/></g></svg>';
function hias(){
  D.querySelectorAll('.hero,.phead,.ayatband,.vm,footer').forEach(function(el){
    if(el.querySelector('.bgx-l'))return;
    var l=D.createElement('div');l.className='bgx-l';l.setAttribute('aria-hidden','true');
    l.innerHTML='<i></i><i></i><i></i>'+ORN.replace('%c','a')+ORN.replace('%c','b');
    el.classList.add('bgx-host');el.insertBefore(l,el.firstChild);
  });
}
/* 2. paralaks ringan */
var tick=false;
addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){D.documentElement.style.setProperty('--bgy',scrollY|0);tick=false})},{passive:true});
/* 3. kanvas: kunang-kunang emas, bintang berputar, bintang jatuh, cahaya kursor */
function kanvas(){
  if(RM)return;
  var cv=D.createElement('canvas');cv.id='bgx-cv';cv.setAttribute('aria-hidden','true');D.body.appendChild(cv);
  var c=cv.getContext('2d'),W=0,H=0,P=[],S=[],sh=null,mx=-999,my=-999,gx=-999,gy=-999,vis=true,nextSh=performance.now()+4000;
  var spr=D.createElement('canvas');spr.width=spr.height=32;var g=spr.getContext('2d').createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(.35,'rgba(231,200,114,.55)');g.addColorStop(1,'rgba(231,200,114,0)');
  var sc=spr.getContext('2d');sc.fillStyle=g;sc.fillRect(0,0,32,32);
  function size(){W=cv.width=innerWidth;H=cv.height=innerHeight}
  size();addEventListener('resize',size);
  var n=W<700?16:34,i;
  for(i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,r:6+Math.random()*10,vy:.08+Math.random()*.25,ph:Math.random()*6.28,sw:.3+Math.random()*.6,a:.35+Math.random()*.5});
  for(i=0;i<(W<700?5:10);i++)S.push({x:Math.random()*W,y:Math.random()*H,r:5+Math.random()*9,rot:Math.random()*6.28,vr:(Math.random()-.5)*.012,vy:.05+Math.random()*.15,a:.18+Math.random()*.22});
  addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;mx=e.clientX;my=e.clientY},{passive:true});
  D.addEventListener('visibilitychange',function(){vis=!D.hidden});
  function bintang(x,y,r,rot){
    c.beginPath();for(var k=0;k<16;k++){var a=rot+k*Math.PI/8,rr=k%2?r*.5:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.stroke();
  }
  function loop(t){
    requestAnimationFrame(loop);if(!vis)return;
    c.clearRect(0,0,W,H);
    if(mx>-900){gx+=(mx-gx)*.12;gy+=(my-gy)*.12;if(gx<-900){gx=mx;gy=my}
      var gr=c.createRadialGradient(gx,gy,0,gx,gy,110);gr.addColorStop(0,'rgba(231,200,114,.2)');gr.addColorStop(1,'rgba(231,200,114,0)');c.fillStyle=gr;c.fillRect(gx-110,gy-110,220,220)}
    P.forEach(function(p){
      p.y-=p.vy;p.ph+=.012;var x=p.x+Math.sin(p.ph)*28*p.sw;
      if(p.y<-20){p.y=H+20;p.x=Math.random()*W}
      c.globalAlpha=p.a*(.55+.45*Math.sin(p.ph*2.3));c.drawImage(spr,x-p.r,p.y-p.r,p.r*2,p.r*2);
    });
    c.globalAlpha=1;c.lineWidth=1;
    S.forEach(function(s){
      s.rot+=s.vr;s.y-=s.vy;if(s.y<-20){s.y=H+20;s.x=Math.random()*W}
      c.strokeStyle='rgba(201,162,74,'+s.a+')';bintang(s.x,s.y,s.r,s.rot);
    });
    if(!sh&&t>nextSh){sh={x:Math.random()*W*.7+W*.2,y:Math.random()*H*.35,l:0};nextSh=t+7000+Math.random()*7000}
    if(sh){
      sh.x-=9;sh.y+=4.5;sh.l+=1;var al=Math.max(0,1-sh.l/55);
      var lg=c.createLinearGradient(sh.x,sh.y,sh.x+90,sh.y-45);lg.addColorStop(0,'rgba(255,245,200,'+al+')');lg.addColorStop(1,'rgba(255,245,200,0)');
      c.strokeStyle=lg;c.lineWidth=2;c.beginPath();c.moveTo(sh.x,sh.y);c.lineTo(sh.x+90,sh.y-45);c.stroke();
      if(al<=0)sh=null;
    }
  }
  requestAnimationFrame(loop);
}
/* 4. PWA: pendaftaran service worker + ajakan pasang */
function pwa(){
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
  var dp=null,ok=true;try{ok=localStorage.getItem('df-pwa-tutup')!=='1'}catch(e){}
  addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();dp=e;if(!ok)return;
    var b=D.createElement('div');b.id='bgx-pwa';b.setAttribute('role','dialog');b.setAttribute('aria-label','Pasang aplikasi');
    b.innerHTML='<span>📲 Pasang Daarul Fikr di HP Anda</span><b type="button">Pasang</b><button class="x" type="button" aria-label="Tutup">✕</button>';
    D.body.appendChild(b);setTimeout(function(){b.classList.add('on')},3500);
    b.querySelector('b').onclick=function(){b.classList.remove('on');dp.prompt()};
    b.querySelector('.x').onclick=function(){b.classList.remove('on');try{localStorage.setItem('df-pwa-tutup','1')}catch(e){}};
  });
  addEventListener('appinstalled',function(){var b=D.getElementById('bgx-pwa');if(b)b.remove()});
}
function mulai(){hias();kanvas();pwa()}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',mulai);else mulai();
})();
