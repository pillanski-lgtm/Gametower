/* Pixel-Grafik-Bausteine (Phase 1): Primitive, Sprites, Icons, Jahreszeiten-Palette */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
let W=344;const H=192;
let g=null;
const C={k:'#1a1008',d:'#3b2412',b:'#7a4a24',t:'#b9803f',w:'#f0e0b0',r:'#b02a20',R:'#e0503a',o:'#e8902c',y:'#f0c840',g:'#3f7a2a',G:'#7ac04a',u:'#2a5a8a',U:'#5aa0d8',s:'#6e6e78',S:'#c0c0c8',p:'#6a3a7a',n:'#8a8a42'};

function seed(s){let a=s>>>0;return function(){a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function use(ctx){g=ctx;g.imageSmoothingEnabled=false}
function ctx(){return g}
function pix(x,y,c){if(c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)}}
function rc(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function dith(x,y,w,h,c1,c2){for(let j=0;j<h;j++)for(let i=0;i<w;i++)pix(x+i,y+j,((x+i+y+j)&1)?c1:c2)}
function line(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);let dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy;for(;;){pix(x0,y0,c);if(x0==x1&&y0==y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function poly(pts,col){const y0=Math.floor(Math.min(...pts.map(p=>p[1]))),y1=Math.ceil(Math.max(...pts.map(p=>p[1])));for(let y=y0;y<y1;y++){const xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])/(b[1]-a[1])*(b[0]-a[0]))}xs.sort((p,q)=>p-q);for(let i=0;i<xs.length-1;i+=2)for(let x=Math.round(xs[i]);x<Math.round(xs[i+1]);x++)pix(x,y,typeof col=='function'?col(x,y):col)}}
function outline(pts,c){for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];line(a[0],a[1],b[0],b[1],c)}}
function ell(cx,cy,rx,ry,col){for(let y=-ry;y<=ry;y++){const hw=Math.round(rx*Math.sqrt(1-(y/(ry+.5))**2));for(let x=-hw;x<=hw;x++)pix(Math.round(cx+x),Math.round(cy+y),typeof col=='function'?col(cx+x,cy+y):col)}}
function spr(x,y,rows,flip){rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=flip?r[r.length-1-i]:r[i];if(C[ch])pix(x+i,y+j,C[ch])}})}

/* ---------- Icons ---------- */
const ICONS={
coin:["..kkkk..",".kyyyyk.","kyywwyok","kywyyyok","kyyyyyok","kyyyyook",".kooook.","..kkkk.."],
ship:["...k....","..kwwk..",".kwrrwk.","kwrrrrwk","...k....","kbbbbbbk",".kbbbbk.","..kkkk.."],
hammer:["..kkkk..",".kSSSSk.",".kSssSk.","..kkbk..","...kbk..","...kbk..","...kbk..","...kkk.."],
swords:["k.....k.",".kS.Sk..","..kSk...","..kbk...",".kb.bk..","kb...bk.","k.....k.","........"],
map:["kkkkkkkk","kwwwwwwk","kwgwuuwk","kwwgguwk","kwrwwwwk","kwwwwrwk","kwwwwwwk","kkkkkkkk"],
crown:["y..y..y.","yy.yy.yy","yyyyyyyy","yoyyyyoy","yyyyyyyy","kkkkkkkk"],
heart:[".rr.rr.","rRrrrrr","rrrrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."],
bread:[".kkkk.","kttttk","ktwtwk","kttttk",".kkkk."],
scale:["...k...","kkkkkkk","k..k..k","k..k..k","kkk.kkk"],
shield:["kkkkkk","kwwrrk","kwwrrk","kwwrrk",".kwrk.","..kk.."],
bag:["..kk..",".kbbk.","kbyybk","kbyybk","kbbbbk",".kkkk."],
fish:["..kkk....",".kUUUk.k.","kUkUUUkkk","kUUUUUUkk",".kUUUk.k.","..kkk...."],
salt:["..kkkk..",".kwwwwk.","kwSwwSwk","kwwwwwwk","kSwwwwSk",".kkkkkk."],
beer:["kkkkkk..","kwwwwkkk","kyyyykuk","kyyyykuk","kyyyykkk","kyyyyk..","kkkkkk.."],
beer2:["kkkkkk..","kwwwwkkk","kbbbbkdk","kbbbbkdk","kbbbbkkk","kbbbbk..","kkkkkk.."],
cloth:["kkkkkkk","kuUuUuk","kUuUuUk","kuUuUuk","kkkkkkk"],
grain:["..y.y...","..yyy...",".yyyyy..","..yyy...","..y.y...","...b...."],
hop:["..g..","gGGg.","GgGgG",".gGg.","..g.."],
drop:["..U..","..U..",".UUU.","UUwUU","UUUUU",".UUU."],
barrel:[".kkkk.","kbbbbk","kdddbk","kbbbbk","kdddbk","kbbbbk",".kkkk."],
skull:[".kwwwk.","kwwwwwk","kwkwkwk","kwwwwwk",".kwkwk.","..kkk.."],
hourg:["kkkkkk","kwyywk",".kwwk.","..kk..",".kyyk.","kyyyyk","kkkkkk"],
anchor:["..kk..","..kk..","kkkkkk","..kk..","k.kk.k","kkkkkk",".kkkk."],
sound:["..k.k..","kkkk.k.","kSSk..k","kSSk..k","kkkk.k.","..k.k.."],
info:[".kkkk.","kuuuuk","kuwwuk","kuuuuk","kuwwuk","kuwwuk",".kkkk."],
scroll:["kkkkkkk","kwwwwwk","kwkkkwk","kwwwwwk","kwkkkwk","kwwwwwk","kkkkkkk"],
house:["..kkkk..",".krrrrk.","krrrrrrk","kwwwwwwk","kwkwwkwk","kwkwwkwk","kkkkkkkk"],
warn:["...kk...","..kyyk..",".kykkyk.",".kykkyk.","kyyykyyk","kyyyyyyk","kkkkkkkk"],
check:["......k","....kk.","k..kk..","kkkk...",".kk...."],
plus:["..kk..","..kk..","kkkkkk","kkkkkk","..kk..","..kk.."],
};
function iconCanvas(name,s){const rows=ICONS[name];if(!rows)return null;const w=Math.max(...rows.map(r=>r.length)),h=rows.length;const c=document.createElement('canvas');c.width=w;c.height=h;c.style.width=w*s+'px';c.style.height=h*s+'px';const old=g;g=c.getContext('2d');spr(0,0,rows);g=old;return c}
function hydrate(root){root.querySelectorAll('i.ic[data-i]:not([data-done])').forEach(el=>{const c=iconCanvas(el.dataset.i,+el.dataset.s||3);if(c){el.appendChild(c);el.dataset.done=1}})}

/* ---------- Szenen-Bausteine ---------- */
const SKY=['#5f9fd6','#7ab4e0','#98c8e8','#b8dcec','#d8ecea'];
function sky(h,cols){cols=cols||SKY;const n=cols.length,bs=h/n;for(let y=0;y<h;y++){const b=Math.min(n-1,Math.floor(y/bs)),pos=y-b*bs;for(let x=0;x<W;x++)pix(x,y,(pos<2&&b>0&&((x+y)&1))?cols[b-1]:cols[b])}}
function cloud(x,y,w){ell(x,y,w,3,'#f4f0e0');ell(x-w/3,y-2,w/2,3,'#f4f0e0');ell(x+w/3,y-1,w/2.5,3,'#f4f0e0');for(let i=-w;i<w;i++)pix(x+i,y+3,'#c4d4dc')}
function hills(y0,c1,c2,amp,f,ph){for(let x=0;x<W;x++){const y=Math.round(y0+Math.sin(x*f+ph)*amp+Math.sin(x*f*2.3+ph)*amp*.4);rc(x,y,1,H-y,c1);pix(x,y,c2)}}
function tree(x,y,cols,rnd){const cs=cols||['#5a9a30','#6aa838','#4a8a28','#7aa838'];const col=cs[Math.floor((rnd?rnd():Math.random())*cs.length)];ell(x,y,3,3,col);pix(x-1,y-1,'#f0d070');rc(x,y+3,1,2,'#4a2a14')}
function brickBlock(x0,y0,x1,y1,o){o=o||{};const base=o.base||'#a8482e',dk=o.dk||'#7a2e1c',lt=o.lt||'#c86a42';for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++){let c=base;if(py%3==0||((px+((py/3|0)%2)*3)%6)==0)c=dk;else if((px*7+py*3)%11==0)c=lt;pix(px,py,c)}}
function gable(x,by,w,h,st,o,rnd){o=o||{};rnd=rnd||Math.random;const body=o.body||'#a8482e',dk=o.dk||'#7a2e1c',lt=o.lt||'#c86a42',out='#2a0e08';const sh=3,top=by-h,sw=Math.max(2,Math.floor((w/2-3)/Math.max(1,st))),mt=top+st*sh;const steps=[[x,mt,w]];for(let i=1;i<=st;i++)steps.push([x+i*sw,mt-i*sh,w-2*i*sw]);
 for(const[sx,sy,s2]of steps)if(s2>0)rc(sx-1,sy-1,s2+2,by-sy+2,out);
 for(const[sx,sy,s2]of steps)if(s2>0)rc(sx,sy,s2,by-sy,body);
 const inside=(px,py)=>steps.some(([sx,sy,s2])=>s2>0&&px>=sx&&px<sx+s2&&py>=sy&&py<by);
 for(let py=top;py<by;py++)for(let px=x;px<x+w;px++){if(!inside(px,py))continue;let c=null;if(py%3==0)c=dk;else if(((px+((py/3|0)%2)*3)%6)==0)c=dk;else if(py%3==1&&(px*7+py*3)%11==0)c=lt;if(px>=x+w-2)c=dk;if(c)pix(px,py,c)}
 for(const[sx,sy,s2]of steps)if(s2>0)rc(sx,sy,s2,1,lt);
 const rows=Math.max(1,Math.floor((by-mt-12)/12)),cols=Math.max(1,Math.floor((w-6)/9));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const wx=(x+4+c*((w-8)/cols)+((w-8)/cols-4)/2)|0,wy=mt+4+r*12;rc(wx-1,wy-1,6,8,'#d8c8a0');rc(wx,wy,4,6,rnd()<.3?'#f0c840':'#1a0e08')}
 rc(x+(w>>1)-3,by-9,6,9,'#d8c8a0');rc(x+(w>>1)-2,by-8,4,8,'#2a1608')}
function timber(x,by,w,h,roof){roof=roof||'#b4482c';const top=by-h,rb=top+(h*.45|0);rc(x-1,rb-1,w+2,by-rb+2,'#2a1608');rc(x,rb,w,by-rb,'#d8c89a');rc(x,rb,w,1,'#f0e0b0');rc(x+w-2,rb,2,by-rb,'#a89868');
 for(let i=0;i<=3;i++)rc(x+Math.round(i*(w-2)/3),rb,2,by-rb,'#4a2a14');rc(x,rb+((by-rb)/2|0),w,2,'#4a2a14');line(x,by-1,x+(w>>2),rb+2,'#4a2a14');line(x+w,by-1,x+w-(w>>2),rb+2,'#4a2a14');
 for(let i=0;i<3;i++){const wx=x+3+i*((w-6)/3|0);rc(wx,rb+4,5,6,'#1a0e08');rc(wx+1,rb+5,3,2,'#f0c840')}
 rc(x+(w>>1)-2,by-8,5,8,'#2a1608');
 const R=[[x-4,rb],[x+w/2,top],[x+w+4,rb]];poly(R,(px,py)=>((py%3)==0?'#7a2a1c':(((px+(py/3|0)*2)%4)==0?'#8a3220':roof)));outline(R,'#2a0e08');line(x-4,rb,x+w+4,rb,'#2a0e08')}
function stoneHouse(x,by,w,h){rc(x-1,by-h-1,w+2,h+2,'#2a2a26');for(let py=by-h;py<by;py++)for(let px=x;px<x+w;px++){let c='#8a8a82';if(py%4==0||((px+((py/4|0)%2)*4)%8)==0)c='#6a6a62';else if((px*5+py*3)%13==0)c='#a8a8a0';if(px>=x+w-2)c='#5a5a54';pix(px,py,c)}
 const R=[[x-4,by-h],[x+w/2,by-h-26],[x+w+4,by-h]];poly(R,(px,py)=>((py%3)==0?'#8a3220':'#b4482c'));outline(R,'#2a0e08');rc(x+4,by-18,7,18,'#2a1608');rc(x+w-11,by-18,7,18,'#2a1608');rc(x+(w>>1)-2,by-h+8,4,7,'#1a1008')}
function barrel(x,y,band){band=band||C.d;rc(x-3,y-6,7,7,C.k);rc(x-2,y-5,5,5,'#8a5a30');rc(x-2,y-5,5,1,'#b9803f');rc(x-2,y-3,5,1,band);rc(x-2,y-1,5,1,band)}
function crate(x,y){rc(x-4,y-7,8,8,C.k);rc(x-3,y-6,6,6,'#b9803f');line(x-3,y-6,x+2,y-1,'#7a4a24');line(x+2,y-6,x-3,y-1,'#7a4a24')}
function sack(x,y,col){col=col||'#d0bc88';rc(x-3,y-5,6,5,C.k);rc(x-2,y-4,4,4,col);pix(x-1,y-5,C.k);pix(x,y-5,col);pix(x+1,y-5,C.k)}
const SK='#e0b080',CL=['#b02a20','#2a5a8a','#3f7a2a','#e8b030','#6a3a7a','#7a4a24'];
function person(x,y,c,step){x=Math.round(x);y=Math.round(y);rc(x,y-7,2,1,'#4a2a14');rc(x,y-6,2,2,SK);rc(x-1,y-4,4,3,c||CL[0]);const s=step?1:0;rc(x-s,y-1,1,2,'#2a1a10');rc(x+1+s,y-1,1,2,'#2a1a10')}
function cobbleFn(base,mort,hi){base=base||'#8a7a5a';mort=mort||'#5e5038';hi=hi||'#a89870';return(x,y)=>{const r=((y/4)|0)%2;if(y%4==0||((x+r*3)%6)==0)return mort;if((x*13+y*7)%17==0)return hi;return base}}
function wallFn(){return(px,py)=>(py%4==0||((px+((py>>2)%2)*4)%8)==0)?'#33312c':'#5c5a54'}
function waterBase(y0,y1,c1,c2,sv){const rnd=seed(sv||5);for(let y=y0;y<y1;y++)for(let x=0;x<W;x++)pix(x,y,((y-y0)%6<3)?c1:c2);for(let i=0;i<150;i++){const x=rnd()*W|0,y=(y0+rnd()*(y1-y0))|0;rc(x,y,3+(rnd()*4|0),1,'#8cc0d0')}}
function smoke(x,y,r,c){ell(x,y,r,Math.max(2,r-1),c||'#d8dce0');ell(x-1,y-1,Math.max(1,r-2),Math.max(1,r-3),'#f0f4f6')}
function flame(x,y,t){const f=(t||0)%3;rc(x-2,y-5,5,6,'#b02a20');rc(x-1,y-8+(f==1?1:0),3,5,'#e8902c');rc(x,y-10+(f==2?1:0),2,4,'#f0c840');pix(x,y-11+f%2,'#fff0a0')}
function vig(){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=Math.max(Math.abs(x-W/2)/(W/2),Math.abs(y-H/2)/(H/2));if(d>.92&&((x+y)&1))pix(x,y,'#00000040');else if(d>.97)pix(x,y,'#00000040')}}
function shipRaw(x,by,o){o=o||{};const hull=['#8a5a30','#5e3a1c'];
 ell(x+2,by+8,36,3,'#1a3e52');
 const H1=[[x-30,by-6],[x-26,by+5],[x-14,by+9],[x+18,by+9],[x+30,by+3],[x+34,by-8],[x+26,by-5],[x-22,by-8]];
 poly(H1,(px,py)=>(py>by-1?hull[1]:(((py-by)%3==0)?'#6a4220':hull[0])));outline(H1,'#1a1008');
 for(let i=-20;i<24;i+=8)rc(x+i,by-1,2,2,'#e8b030');
 rc(x-31,by-15,12,9,'#1a1008');rc(x-30,by-14,10,7,hull[0]);rc(x-30,by-14,10,1,'#b9803f');
 rc(x+22,by-13,12,6,'#1a1008');rc(x+23,by-12,10,4,hull[0]);
 rc(x-1,by-62,3,56,'#2a1608');rc(x-17,by-60,36,2,'#2a1608');
 const S=[[x-15,by-58],[x+17,by-58],[x+19,by-22],[x+2,by-19],[x-17,by-22]];
 poly(S,(px)=>(((((px-x+40)/4)|0)%2)?'#e8dcc0':'#a42e24'));outline(S,'#1a1008');rc(x+16,by-57,3,35,'#00000030');
 const F=[[x-27,by-48],[x-12,by-48],[x-11,by-22],[x-27,by-20]];rc(x-28,by-47,2,28,'#2a1608');poly(F,(px)=>(((px/3)|0)%2)?'#e8dcc0':'#a42e24');outline(F,'#1a1008');
 rc(x,by-68,9,5,'#b02a20');rc(x-1,by-70,1,10,'#2a1608');
 person(x-24,by-15,'#b02a20');person(x-8,by-8,'#2a5a8a');person(x+28,by-13,'#e8b030')}
const shipCache={};
function shipSprite(k,flip){const key=k+'|'+flip;if(shipCache[key])return shipCache[key];const off=document.createElement('canvas');off.width=100;off.height=96;const main=g;g=off.getContext('2d');shipRaw(50,76);g=main;
 const o2=document.createElement('canvas');o2.width=Math.round(100*k);o2.height=Math.round(96*k);const c2=o2.getContext('2d');c2.imageSmoothingEnabled=false;c2.save();if(flip){c2.translate(o2.width,0);c2.scale(-1,1)}c2.drawImage(off,0,0,o2.width,o2.height);c2.restore();return shipCache[key]={cv:o2,ox:Math.round(50*k),oy:Math.round(76*k)}}
function ship(x,by,k,flip){const s=shipSprite(k||1,!!flip);g.drawImage(s.cv,Math.round(x-(flip?s.cv.width-s.ox:s.ox)),Math.round(by-s.oy))}

/* ---------- Jahreszeiten: Palettentausch auf fertigem Bild ---------- */
function tint(c,season){if(season==='fruehling')return;const x=c.getContext('2d');const im=x.getImageData(0,0,c.width,c.height),d=im.data;
 for(let i=0;i<d.length;i+=4){let r=d[i],gr=d[i+1],b=d[i+2];const greenish=gr>r+6&&gr>b+10,yellowish=r>150&&gr>130&&b<110&&gr>r-50&&!greenish;
  if(season==='winter'){if(greenish||yellowish){r=232;gr=240;b=246}else{r=r*.78+232*.22;gr=gr*.78+240*.22;b=b*.78+248*.22}}
  else if(season==='herbst'){if(greenish){r=Math.min(255,r+95);gr=Math.max(0,gr-5);b=Math.max(0,b-30)}else{r=Math.min(255,r*1.04+6);b*=.94}}
  else if(season==='sommer'){if(greenish){r+=8;gr+=14}r=Math.min(255,r*1.05);gr=Math.min(255,gr*1.04);b*=.96}
  d[i]=r;d[i+1]=gr;d[i+2]=b}x.putImageData(im,0,0)}
function snow(t,season){if(season!=='winter')return;for(let i=0;i<70;i++){const sp=.25+(i%3)*.15;const x=(i*37+Math.sin((t+i*9)/17)*4+t*0.08)%W,y=(i*53+t*sp*2.2)%H;pix(x,y,'#ffffff');if(i%4==0)pix(x+1,y,'#dfe8f0')}}

function setSize(w){W=w;HH.gfx.W=w}
HH.gfx={W,H,setSize,C,ICONS,seed,use,ctx,pix,rc,dith,line,poly,outline,ell,spr,iconCanvas,hydrate,sky,cloud,hills,tree,brickBlock,gable,timber,stoneHouse,barrel,crate,sack,person,cobbleFn,wallFn,waterBase,smoke,flame,vig,shipRaw,ship,tint,snow,SKY,CL};
})();
