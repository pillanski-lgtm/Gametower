/* Phase 3: Stadtansichten der 12 Hansestädte (4 Regionalstile) und die Weltkarte.
   Alle Städte teilen das Layout der 6 Hotspots: Kontor, Markt, Rathaus, Schenke, Betriebe, Werft. */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
const X=HH.gfx,D=HH.data,sim=HH.sim,K=HH.kit;
let W=X.W;
const {H,seed,pix,rc,line,poly,outline,ell,sky,cloud,hills,tree,brickBlock,gable,timber,stoneHouse,barrel,crate,sack,cobbleFn,wallFn,waterBase,smoke,vig,spr,ICONS}=X;
const sw=K.sw;
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shade(hex,d){const n=parseInt(hex.slice(1),16);const f=v=>Math.max(0,Math.min(255,v+d));return'#'+[(n>>16)&255,(n>>8)&255,n&255].map(v=>f(v).toString(16).padStart(2,'0')).join('')}

/* ---------- Stil-Paletten ---------- */
const LOOK={
 step:{sky:X.SKY,water:['#3e6e86','#34607a'],hill:['#8a9a52','#a8b868','#7a8a42','#98a85a']},
 timber:{sky:['#8aa4b4','#a4b8c4','#bccad0','#d0d8d8','#e0e0d8'],water:['#4a6a74','#3e5c66'],hill:['#7a8c5e','#98a878','#6a7c52','#88987a']},
 wood:{sky:['#9ab8d0','#b4cce0','#cce0ec','#e4eef2','#f4f4f0'],water:['#2e5a7a','#264c68'],hill:['#6a7a8a','#98a8b4','#5a6a7a','#889aa8']},
 onion:{sky:['#7aa4c8','#a0bcd0','#c8d0d0','#e8dcc0','#f0d8b0'],water:['#4a6a60','#3e5a52'],hill:['#8a9a5a','#a8b46c','#7a8a4a','#98a85c']}
};

/* ---------- Haus-Typen ---------- */
function woodHouse(x,by,w,h,col){const top=by-h,rb=top+Math.round(h*.42);rc(x-1,rb-1,w+2,by-rb+2,'#1a1008');for(let px=x;px<x+w;px++)for(let py=rb;py<by;py++)pix(px,py,(px-x)%3==0?shade(col,-34):col);
 for(let i=0;i<Math.floor((w-4)/11);i++){const wx=x+4+i*11;rc(wx-1,rb+5,7,9,'#e8e0d0');rc(wx,rb+6,5,7,'#1a2a3a');rc(wx+2,rb+6,1,7,'#e8e0d0')}
 rc(x+(w>>1)-2,by-9,5,9,'#3a2412');const R=[[x-4,rb],[x+w/2,top],[x+w+4,rb]];poly(R,(px,py)=>(py%3==0?'#2a1c16':'#4a3428'));outline(R,'#e8e0d0');line(x-4,rb,x+w+4,rb,'#1a1008')}
function logHouse(x,by,w,h){const top=by-h,rb=top+Math.round(h*.4);rc(x-1,rb-1,w+2,by-rb+2,'#1a1008');for(let py=rb;py<by;py++)for(let px=x;px<x+w;px++)pix(px,py,((py-rb)%4==3)?'#4a2a14':(((px*3+py)%9==0)?'#9a6a3a':'#7a4a24'));
 for(let i=0;i<Math.max(1,Math.floor((w-4)/12));i++){const wx=x+4+i*12;rc(wx-1,rb+5,6,8,'#c8a04a');rc(wx,rb+6,4,6,'#1a1008')}
 rc(x+(w>>1)-2,by-9,5,9,'#2a1608');const R=[[x-3,rb],[x+w/2,top],[x+w+3,rb]];poly(R,(px,py)=>(((px+py*2)%5==0)?'#4a4a44':'#6a6a62'));outline(R,'#1a1008');rc(x+w-9,top+4,4,8,'#5a3a24')}
function brickWare(x,by,w,h,pal){brickShell(x,by,w,h);rc(x+3,by-h+6,w-6,3,'#2a1608');for(let i=0;i<2;i++)rc(x+4+i*((w-14)/2|0),by-h+14,6,9,'#2a1608');rc(x+(w>>1)-3,by-10,6,10,'#2a1608');line(x+w-2,by-h+4,x+w+8,by-h-2,'#4a2a14');rc(x+w+7,by-h-3,2,6,'#4a2a14')}
function brickShell(x,by,w,h){rc(x-1,by-h-1,w+2,h+2,'#2a0e08');brickBlock(x,by-h,x+w,by);const R=[[x-3,by-h],[x+w/2,by-h-10],[x+w+3,by-h]];poly(R,'#7a3a24');outline(R,'#2a0e08')}

/* ---------- Rathäuser ---------- */
function townhall(look,x,by){
 if(look==='step'){gable(x,by,36,74,5,{},seed(3));rc(x+15,by-84,6,10,'#7a2e1c');poly([[x+13,by-84],[x+18,by-98],[x+23,by-84]],'#3f7a5a');outline([[x+13,by-84],[x+18,by-98],[x+23,by-84]],'#13281e');ell(x+18,by-62,3,3,'#f0e0b0')}
 else if(look==='timber'){rc(x-1,by-81,32,82,'#2a2a26');for(let py=by-80;py<by;py++)for(let px=x;px<x+30;px++)pix(px,py,(py%4==0||((px+((py>>2)%2)*4)%8)==0)?'#6a6a62':'#8a8a82');
  rc(x+8,by-100,14,20,'#8a8a82');rc(x+8,by-100,14,2,'#2a2a26');poly([[x+6,by-100],[x+15,by-116],[x+24,by-100]],'#3a4a5a');outline([[x+6,by-100],[x+15,by-116],[x+24,by-100]],'#1a1008');ell(x+15,by-90,3,3,'#f0e0b0');for(let i=0;i<3;i++){rc(x+5+i*8,by-60+i*0,4,10,'#1a1008');rc(x+5+i*8,by-36,4,10,'#1a1008')}}
 else if(look==='wood'){woodHouse(x-2,by,40,70,'#a83a2a');rc(x+14,by-82,10,14,'#e8e0d0');ell(x+19,by-76,3,3,'#f0e0b0');poly([[x+12,by-82],[x+19,by-94],[x+26,by-82]],'#2a1c16')}
 else{rc(x-1,by-51,34,52,'#1a1008');for(let py=by-50;py<by;py++)for(let px=x;px<x+32;px++)pix(px,py,'#e8e4d8');for(let i=0;i<3;i++)rc(x+4+i*10,by-40,5,12,'#3a4a5a');
  for(const dx of[8,24]){rc(x+dx-4,by-62,8,12,'#e8e4d8');ell(x+dx,by-68,5,6,'#3f9a7a');outline([[x+dx,by-74],[x+dx,by-80]],'#e8b030');pix(x+dx,by-81,'#e8b030')}
  ell(x+16,by-70,6,8,'#2a6a9a');line(x+16,by-78,x+16,by-86,'#e8b030');pix(x+16,by-87,'#e8b030')}}

/* ---------- Wahrzeichen (Ferne, hinter der Werft) ---------- */
const LM={
 holstentor(x,by){for(const dx of[0,30]){rc(x+dx-1,by-47,16,48,'#2a0e08');brickBlock(x+dx,by-46,x+dx+14,by);poly([[x+dx-2,by-46],[x+dx+7,by-64],[x+dx+16,by-46]],'#3f7a5a');outline([[x+dx-2,by-46],[x+dx+7,by-64],[x+dx+16,by-46]],'#13281e')}rc(x+13,by-34,18,35,'#2a0e08');brickBlock(x+14,by-33,x+30,by);rc(x+18,by-14,10,14,'#1a0e08')},
 krantor(x,by){rc(x-1,by-55,30,56,'#2a0e08');brickBlock(x,by-54,x+28,by);poly([[x-3,by-54],[x+14,by-72],[x+31,by-54]],'#7a3a24');outline([[x-3,by-54],[x+14,by-72],[x+31,by-54]],'#2a0e08');rc(x+26,by-44,22,14,'#6a4a2a');rc(x+26,by-44,22,2,'#3a2410');line(x+46,by-30,x+46,by-14,'#4a2a14');rc(x+10,by-16,8,16,'#1a0e08')},
 burg(x,by){rc(x-1,by-33,50,34,'#3a3a34');for(let py=by-32;py<by;py++)for(let px=x;px<x+48;px++)pix(px,py,(py%4==0||((px+((py>>2)%2)*4)%8)==0)?'#6a5a4a':'#8a7a64');for(let i=0;i<8;i++)rc(x+i*6,by-37,4,5,'#8a7a64');for(const dx of[-4,44]){rc(x+dx,by-48,10,50,'#8a7a64');poly([[x+dx-2,by-48],[x+dx+5,by-62],[x+dx+12,by-48]],'#a8482e')}},
 speicher(x,by){for(let i=0;i<3;i++){const hh=54+(i%2)*10;rc(x+i*18-1,by-hh-1,18,hh+2,'#2a0e08');brickBlock(x+i*18,by-hh,x+i*18+16,by);poly([[x+i*18-2,by-hh],[x+i*18+8,by-hh-12],[x+i*18+18,by-hh]],'#4a3a2a');rc(x+i*18+5,by-hh+8,6,8,'#1a0e08');rc(x+i*18+5,by-hh+24,6,8,'#1a0e08')}line(x+52,by-70,x+66,by-62,'#4a2a14');line(x+66,by-62,x+66,by-48,'#c8b890')},
 belfried(x,by){rc(x-1,by-69,20,70,'#2a0e08');brickBlock(x,by-68,x+18,by);rc(x-2,by-72,24,5,'#6a5a4a');for(let i=0;i<5;i++)rc(x-2+i*5,by-77,3,5,'#6a5a4a');rc(x+4,by-60,10,16,'#1a0e08');ell(x+9,by-46,3,3,'#f0e0b0');poly([[x+4,by-77],[x+9,by-92],[x+14,by-77]],'#4a5a6a');rc(x+8,by-30,3,3,'#1a0e08')},
 tower(x,by){rc(x-1,by-45,38,46,'#4a4a46');for(let py=by-44;py<by;py++)for(let px=x;px<x+36;px++)pix(px,py,(py%5==0)?'#b8b8b0':'#d8d8d0');for(const dx of[-4,30]){rc(x+dx,by-58,10,16,'#d8d8d0');poly([[x+dx-1,by-58],[x+dx+5,by-68],[x+dx+11,by-58]],'#4a5a6a')}rc(x+8,by-38,20,10,'#c8c8c0');for(let i=0;i<5;i++)rc(x+8+i*4,by-41,2,3,'#c8c8c0');rc(x+15,by-66,1,10,'#2a1608');rc(x+16,by-66,6,3,'#b02a20')},
 bryggen(x,by){const cols=['#a83a2a','#c89a3a','#e0d8c8','#a83a2a'];for(let i=0;i<4;i++){const hh=40+(i%2)*8,xx=x+i*14;for(let px=xx;px<xx+13;px++)for(let py=by-hh;py<by;py++)pix(px,py,(px-xx)%3==0?shade(cols[i],-30):cols[i]);poly([[xx-1,by-hh],[xx+6,by-hh-12],[xx+14,by-hh]],'#2a1c16');rc(xx+4,by-hh+8,5,6,'#e8e0d0')}},
 ringmauer(x,by){rc(x-1,by-25,70,26,'#6a5a4a');for(let py=by-24;py<by;py++)for(let px=x;px<x+68;px++)pix(px,py,(py%4==0||((px+((py>>2)%2)*4)%8)==0)?'#a89878':'#c8b898');for(const dx of[2,30,58]){rc(x+dx,by-42,10,44,'#c8b898');poly([[x+dx-2,by-42],[x+dx+5,by-56],[x+dx+12,by-42]],'#a8482e')}},
 kreml(x,by){rc(x-1,by-33,64,34,'#a8a89c');for(let py=by-32;py<by;py++)for(let px=x;px<x+62;px++)pix(px,py,(py%4==0)?'#c8c8bc':'#e8e8dc');for(const [dx,hh] of[[10,48],[30,60],[50,44]]){rc(x+dx-5,by-hh,10,hh-30,'#e8e8dc');ell(x+dx,by-hh-4,6,8,dx===30?'#e8b030':'#3f9a7a');line(x+dx,by-hh-12,x+dx,by-hh-18,'#e8b030')}},
 petri(x,by){rc(x-1,by-37,40,38,'#2a0e08');brickBlock(x,by-36,x+38,by);poly([[x-2,by-36],[x+19,by-48],[x+40,by-36]],'#3f7a5a');rc(x+14,by-60,10,26,'#a8482e');poly([[x+13,by-60],[x+19,by-100],[x+25,by-60]],'#3f7a5a');outline([[x+13,by-60],[x+19,by-100],[x+25,by-60]],'#13281e');pix(x+19,by-102,'#e8b030')},
 olaf(x,by){rc(x-1,by-35,34,36,'#8a8a82');for(let py=by-34;py<by;py++)for(let px=x;px<x+32;px++)pix(px,py,(py%4==0)?'#b8b8a8':'#d8d8c8');poly([[x+8,by-35],[x+14,by-88],[x+20,by-35]],'#3f6a5a');rc(x+34,by-28,18,29,'#c8c8b8');ell(x+43,by-28,9,5,'#a8482e')},
 festung(x,by){rc(x-1,by-37,54,38,'#3a3a34');for(let py=by-36;py<by;py++)for(let px=x;px<x+52;px++)pix(px,py,(py%4==0||((px+((py>>2)%2)*4)%8)==0)?'#8a7a6a':'#b8a890');for(const dx of[0,22,42]){rc(x+dx,by-52,10,16,'#b8a890');rc(x+dx,by-54,10,3,'#8a7a6a')}}
};

/* ---------- Szene einer Stadt ---------- */
function cityScene(cid){const c=D.cities[cid],look=c.look||'step',L=LOOK[look];
 const pal=K.cityStyle[c.style]||K.cityStyle.ostsee;
 const s={key:S=>cid+'|'+W,
 bg(S){W=X.W;const r=seed(hash(cid));sky(80,L.sky);cloud(70,16,18);cloud(200,26,22);
  if(look==='wood'){const m=(x0,x1,pk)=>poly([[x0,84],[(x0+x1)/2,pk],[x1,84]],(px,py)=>(py<pk+10?'#e8eef2':((px+py)%7==0?'#7a8a9a':'#6a7a8a')));m(80,190,22);m(160,280,34);m(250,W+40,26)}
  hills(60,L.hill[0],L.hill[1],5,.03,1);hills(68,L.hill[2],L.hill[3],4,.045,2);if(look!=='wood')for(let i=0;i<60;i++)tree(r()*W,56+r()*16,null,r);
  // Häuserzeile (Rathaus bei x=62, Schenke bei x=98)
  const xs=[-6,28,62,98,130],ws=[36,32,36,34,34],hs=[58,48,70,54,60];
  for(let i=0;i<5;i++){const x=xs[i],w=ws[i],h=hs[i],by=86-(i%2)*2;
   if(i===2){townhall(look,x,by);continue}
   if(look==='step')gable(x,by,w,h,3+(i%3),{body:pal.bodies[i%5],dk:pal.dk[i%pal.dk.length],lt:pal.lt[i%pal.lt.length]},r);
   else if(look==='timber')timber(x,by,w,h,['#b4482c','#8a3a24','#a8452c','#7a4a30','#b4482c'][i]);
   else if(look==='wood')woodHouse(x,by,w,h,['#a83a2a','#c89a3a','#e0d8c8','#a83a2a','#4a6a8a'][i]);
   else logHouse(x,by,w,h-6)}
  for(let x=170;x<W;x+=0){break}
  // Betriebe (Lagerhäuser) und Wahrzeichen
  if(look==='step'){stoneHouse(150,84,32,36);stoneHouse(186,86,30,40)}
  else if(look==='timber'){brickWare(150,84,32,38);brickWare(186,86,30,42)}
  else if(look==='wood'){woodHouse(150,84,32,36,'#7a2a1c');woodHouse(186,86,30,40,'#c89a3a')}
  else{logHouse(150,84,32,36);logHouse(186,86,30,42)}
  if(LM[c.landmark])LM[c.landmark](228,92);
  for(let x=300;x<W;x+=34){if(look==='step')gable(x,94,28,40+(x%3)*6,3,{},r);else if(look==='timber')timber(x,96,26,30+(x%3)*5);else if(look==='wood')woodHouse(x,96,26,34,['#a83a2a','#c89a3a','#e0d8c8'][x%3]);else logHouse(x,96,26,34)}
  waterBase(84,H,L.water[0],L.water[1],5);
  poly([[150,92],[250,92],[256,110],[160,106]],cobbleFn());poly([[160,106],[256,110],[256,126],[164,122]],wallFn());
  poly([[0,82],[82,86],[148,108],[152,134],[112,160],[0,176]],cobbleFn());
  poly([[0,176],[112,160],[152,134],[152,142],[116,170],[0,188],[0,192]],wallFn());
  // Kontor auf dem Kai
  if(look==='step'||look==='timber')timber(2,106,44,42,look==='step'?'#a8452c':'#7a4a30');else if(look==='wood')woodHouse(2,106,44,44,'#c89a3a');else logHouse(2,106,44,44);
  // Schenke: Wirtshausschild
  rc(104,52,1,10,'#1a1008');rc(104,52,10,1,'#1a1008');rc(110,54,8,7,'#e8b030');rc(111,55,6,5,'#f0e0b0');rc(112,56,2,3,'#b9803f');
  // Werft: Kran + Helling
  rc(236,60,3,48,'#5a3a1c');rc(236,60,22,3,'#5a3a1c');line(256,63,256,84,'#c8b890');rc(252,84,8,3,'#6a4a2a');rc(222,96,36,12,'#6a4a2a');for(let i=0;i<5;i++)rc(224+i*7,96,2,12,'#4a2a14');line(222,96,236,84,'#7a5028');
  // Markt
  K.tent(72,126,14,'#a42e24');K.tent(100,130,14,'#2a5a8a');
  [[30,116],[38,120],[34,126],[22,128],[16,134],[62,148],[70,152],[10,158],[22,164]].forEach(p=>barrel(p[0],p[1]));[[50,146],[56,152],[120,140]].forEach(p=>sack(p[0],p[1]));[[40,134],[84,150]].forEach(p=>crate(p[0],p[1]));
  vig()},
 anim(S,t){W=X.W;const b=Math.round(Math.sin(t/14));X.ship(186,106+b,1,false);X.ship(W>330?300:262,92-b,.5,false);X.ship(W>330?330:290,100+b,.5,true);
  K.walkers(t,[{x0:6,x1:60,y:112,v:.25,o:0,c:'#b02a20'},{x0:10,x1:110,y:122,v:.3,o:20,c:'#2a5a8a'},{x0:30,x1:130,y:142,v:.22,o:50,c:'#3f7a2a'},{x0:6,x1:100,y:154,v:.28,o:8,c:'#e8b030'},{x0:60,x1:140,y:134,v:.2,o:60,c:'#6a3a7a'}]);
  for(let i=0;i<14;i++)if((t+i*7)%24<5)pix(158+((i*37)%90),130+((i*13)%50),'#cfe8f0');
  if(S.b.brauerei.state==='ready'&&sim.status(S,'brauerei').code==='laeuft'&&cid===S.home){smoke(168+((t/6)%6),46-((t/3)%18),2,'#d8dce0')}
  if(look==='onion'&&sw(t,30))pix(248,60,'#fff0a0');
  if(cid===S.home){rc(4,56,1,8,'#2a1608');rc(5,56,7,4,'#b02a20');rc(5,57+sw(t,10),7,1,'#8a1c12')}}
 };
 s.hot=[{id:'kontor',label:'Kontor',x:2,y:62,w:46,h:46,page:'kontor'},{id:'markt',label:'Markt',x:56,y:100,w:62,h:34,page:'markt'},
  {id:'rathaus',label:'Rathaus',x:62,y:34,w:36,h:52,page:'rathaus'},{id:'schenke',label:'Schenke',x:100,y:34,w:32,h:52,page:'schenke'},
  {id:'gut',label:'Betriebe',x:146,y:38,w:72,h:48,page:'gut'},{id:'werft',label:'Werft',x:222,y:70,w:36,h:40,page:'werft'}];
 return s}
const cache={};
HH.cityScene=cid=>cache[cid]||(cache[cid]=cityScene(cid));

/* ---------- Weltkarte (Pixel) ---------- */
const LAND=[
 [[24,100],[34,92],[44,98],[50,112],[48,128],[54,138],[46,146],[30,142],[26,126],[22,112]],
 [[56,176],[56,144],[64,138],[76,134],[88,130],[96,132],[100,128],[104,126],[112,124],[124,124],[136,122],[150,120],[162,118],[172,112],[180,104],[186,98],[192,98],[198,92],[204,88],[210,86],[222,82],[236,80],[252,78],[252,176]],
 [[98,126],[98,104],[100,86],[106,76],[112,82],[110,100],[110,122]],
 [[100,62],[98,44],[106,32],[120,24],[140,22],[168,24],[180,32],[176,44],[168,50],[160,60],[156,72],[150,86],[140,96],[130,100],[124,92],[122,80],[116,70],[108,70]],
 [[176,44],[190,34],[210,26],[252,24],[252,76],[232,76],[214,74],[200,70],[194,60],[188,52]]
];
const kmap={key:S=>'karte|'+sim.calendar(S.day).season+'|'+W,
 bg(S){W=X.W;const r=seed(55);const g=X.ctx();
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)pix(x,y,((x>>2)+(y>>2))%2?'#3a2414':'#33200f');
  rc(12,16,244,164,'#1a1008');rc(14,18,240,160,'#c9a468');
  g.save();g.beginPath();g.rect(16,20,236,156);g.clip();
  rc(16,20,236,156,'#a9c2b8');for(let i=0;i<220;i++)rc(16+(r()*236|0),20+(r()*156|0),3,1,'#8cb0a8');
  for(const P of LAND){poly(P,(x,y)=>((x*7+y*13)%23==0?'#c8a868':'#d8c07a'))}
  ell(164,84,4,8,'#d8c07a');for(let i=0;i<60;i++){const tx=16+(r()*236|0),ty=24+(r()*150|0);if(g.getImageData(tx,ty,1,1).data[0]>180)tree(tx,ty,['#6a8a3a','#4a7a2a'],r)}
  // Küstenlinie
  const im=g.getImageData(14,18,240,160),d=im.data,wd=240,isLand=(x,y)=>{const i=(y*wd+x)*4;return d[i]>190&&d[i+1]>160&&d[i+2]<150};
  const out=[];for(let y=1;y<159;y++)for(let x=1;x<239;x++){const l=isLand(x,y);if(l){if(!isLand(x-1,y)||!isLand(x+1,y)||!isLand(x,y-1)||!isLand(x,y+1))out.push([x+14,y+18,'#5a3a1c'])}else if(isLand(x-1,y)||isLand(x+1,y)||isLand(x,y-1)||isLand(x,y+1))if((x+y)%2==0)out.push([x+14,y+18,'#8cb0a8'])}
  for(const [x,y,c] of out)pix(x,y,c);
  if(sim.calendar(S.day).season==='winter'){for(const [x0,y0,x1,y1] of[[186,74,252,86],[176,44,194,76],[182,92,200,100]])for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=g.getImageData(x,y,1,1).data;if(i[2]>150&&i[0]<190&&((x+y)&1))pix(x,y,'#f4fafc')}}
  g.restore();
  rc(236,28,1,0,'#000');ell(238,36,10,10,'#f0e0b0');line(238,27,238,46,'#1a1008');line(229,36,248,36,'#1a1008');poly([[238,27],[240,36],[236,36]],'#b02a20');
  for(const id of D.cityOrder){const m=D.cities[id].map;rc(m[0]-3,m[1]-3,7,7,'#1a1008');rc(m[0]-2,m[1]-2,5,5,D.cities[id].ice?'#9fc0d0':'#e8b030');pix(m[0]-1,m[1]-1,'#fff0a0')}
  vig()},
 anim(S,t){const here=S.trip?null:D.cities[S.city].map;const hm=D.cities[S.home].map;
  rc(hm[0]-1,hm[1]-9,1,7,'#1a1008');rc(hm[0],hm[1]-9,6,4,'#b02a20');
  if(here&&sw(t,6)){rc(here[0]-5,here[1]-5,11,1,'#fff');rc(here[0]-5,here[1]+5,11,1,'#fff');rc(here[0]-5,here[1]-5,1,11,'#fff');rc(here[0]+5,here[1]-5,1,11,'#fff')}
  if(S.trip){const a=D.cities[S.trip.from].map,b=D.cities[S.trip.to].map,p=1-S.trip.left/S.trip.total;
   for(let u=0;u<1;u+=.05)if(Math.round(u*40)%2==0)pix(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,'#b02a20');
   const x=a[0]+(b[0]-a[0])*p,y=a[1]+(b[1]-a[1])*p+Math.round(Math.sin(t/4));
   rc(x-4,y,9,3,'#7a4a24');rc(x-5,y-1,2,2,'#7a4a24');rc(x,y-7,1,7,'#1a1008');rc(x+1,y-6,5,4,'#f0e0b0');rc(x+1,y-6,5,1,'#b02a20')}
 }};
const LABPOS={luebeck:'t',hamburg:'b',danzig:'t',stettin:'b',bruegge:'b',london:'l',bergen:'t',visby:'t',novgorod:'b',riga:'t',reval:'t',narva:'b'};
kmap.hot=D.cityOrder.map(id=>{const m=D.cities[id].map;return{id,label:D.cities[id].n,x:m[0]-6,y:m[1]-6,w:13,h:13,act:'dest',d:{c:id},cls:'maphot lab-'+(LABPOS[id]||'t')}});
HH.mapScene=kmap;

/* ---------- Innenräume: Rathaus, Schenke, Werft ---------- */
function cityCols(cid){const h=hash(cid);return[['#b02a20','#c89a3a','#2a5a8a','#3f7a2a','#6a3a7a'][h%5],['#e8e4d8','#e8b030','#e8e4d8','#d8d0b0'][(h>>3)%4]]}
const rathaus={key:S=>S.city+'|'+W,
 bg(S){W=X.W;const [c1,c2]=cityCols(S.city);rc(0,0,W,H,'#4a4a46');for(let y=0;y<112;y++)for(let x=0;x<W;x++)pix(x,y,(y%6==0||((x+((y/6|0)%2)*8)%16)==0)?'#5a5a54':(((x*5+y*3)%17==0)?'#9a9a90':'#78786e'));
  for(let y=112;y<H;y++)for(let x=0;x<W;x++)pix(x,y,(((x>>4)+((y-112)>>3))%2)?'#8a8478':'#6a645a');rc(0,110,W,3,'#2a2a26');
  for(let wx=24;wx<W;wx+=84){rc(wx-1,22,26,60,'#1a1008');rc(wx,24,24,58,'#98c8e8');ell(wx+12,24,12,8,'#98c8e8');rc(wx+11,16,2,66,'#3a3a34');rc(wx,52,24,2,'#3a3a34')}
  for(let bx=66;bx<W;bx+=84){rc(bx-1,20,12,48,'#1a1008');rc(bx,21,10,46,c1);rc(bx,21,10,3,c2);poly([[bx,67],[bx+5,74],[bx+10,67]],c1);rc(bx+3,36,4,4,c2)}
  rc(40,96,170,14,'#3a2412');rc(40,96,170,2,'#7a4a24');rc(36,108,6,12,'#2a170a');rc(206,108,6,12,'#2a170a');
  for(let i=0;i<5;i++){rc(52+i*30,100,12,18,'#5a3a1c');rc(53+i*30,101,10,3,'#8a5a30')}
  rc(110,64,26,32,'#1a1008');rc(112,66,22,28,c1);rc(118,60,10,8,c2);
  vig()},
 anim(S,t){const fl=sw(t,5);for(const cx of[60,190]){rc(cx,82,2,12,'#e8dcc0');rc(cx,78+fl,2,3,fl?'#fff0a0':'#f0c840')}
  for(let i=0;i<5;i++){const x=56+i*30;K.person(x,100+((t/16+i)%2|0),['#6a3a7a','#b02a20','#2a5a8a','#3f7a2a','#e8b030'][i],0)}
  const k=sw(t,4);rc(95,92,3,1,'#fff');K.person(100,100,'#3a2a1a',0);rc(105,93-k,1,6,'#e8dcc0');
  K.dust(t,14,6,240,26,100)}};
const schenke={key:S=>S.city+'|'+W,
 bg(S){W=X.W;rc(0,0,W,H,'#3a2412');for(let y=0;y<112;y++)for(let x=0;x<W;x++)pix(x,y,((x%12)<2)?'#2a170a':(((x*3+y*7)%19==0)?'#7a4a24':'#5a3a1c'));
  for(let y=112;y<H;y++)for(let x=0;x<W;x++)pix(x,y,((y>>3)%2?((x+8)%24<2):(x%24<2))?'#2a170a':(((x*5+y*3)%13==0)?'#9a6a3a':'#7a5028'));rc(0,110,W,3,'#2a170a');
  rc(0,60,70,60,'#1a1008');for(let i=0;i<2;i++)rc(6,70+i*22,58,3,'#5a3a1c');for(let i=0;i<6;i++){barrel(14+i*8,70);rc(10+i*9,88,6,7,'#c8c8d0')}
  rc(0,100,120,18,'#6a4426');rc(0,100,120,3,'#9a6a3a');
  rc(176,42,54,68,'#4a4a46');for(let y=44;y<110;y+=5)line(178,y,228,y,'#6a6a62');rc(184,58,38,52,'#1a1008');rc(180,40,46,4,'#3a3a34');
  for(const lx of[100,160]){rc(lx,20,1,14,'#1a1008');rc(lx-3,34,8,6,'#1a1008')}
  for(const [tx,ty] of[[100,150],[160,166],[40,160]]){rc(tx-12,ty-14,26,4,'#6a4426');rc(tx-12,ty-14,26,1,'#9a6a3a');rc(tx-8,ty-10,3,12,'#3a2410');rc(tx+8,ty-10,3,12,'#3a2410');rc(tx-4,ty-18,4,4,'#e8c040');rc(tx+4,ty-18,4,4,'#e8c040')}
  vig()},
 anim(S,t){const fl=(t%3);for(let i=0;i<3;i++){X.flame(196+i*10,108,t+i)}ell(206,104,22,10,sw(t,4)?'#f0883018':'#f0883010');
  for(const lx of[100,160]){rc(lx-2,36,6,4,sw(t+lx,7)?'#fff0a0':'#f0c840')}
  K.person(30,106,'#b02a20',0);const m=sw(t,10);rc(34,96+m,3,3,'#e8c040');
  [[100,148,'#2a5a8a'],[160,164,'#6a3a7a'],[40,158,'#3f7a2a']].forEach(([x,y,c],i)=>{K.person(x-14,y,c,0);K.person(x+16,y,['#e8b030','#b02a20','#7a4a24'][i],0);if(sw(t+i*5,12))rc(x+5,y-24,3,3,'#f0e0b0')});
  K.dust(t,10,6,240,30,130)}};
const werft={key:S=>S.city+'|'+W,
 bg(S){W=X.W;sky(76);cloud(60,18,18);cloud(240,28,20);hills(60,'#8a9a52','#a8b868',5,.03,1);hills(68,'#7a8a42','#98a85a',4,.045,2);
  waterBase(84,H,'#3e6e86','#34607a',9);
  poly([[0,92],[170,92],[170,176],[0,176]],(x,y)=>((y>>2)%2?(x%14==0):((x+7)%14==0))?'#4a2f16':(((x*5+y*3)%13==0)?'#a8803f':'#8a6a3a'));
  poly([[0,176],[170,176],[176,192],[0,192]],wallFn());
  // Helling mit Rumpfgerippe
  poly([[10,150],[150,150],[170,170],[0,170]],'#6a4a2a');for(let i=0;i<8;i++)rc(14+i*18,150,2,20,'#4a2a14');
  for(let i=0;i<7;i++){const x=28+i*16,hh=22-Math.abs(i-3)*3;rc(x,148-hh,3,hh,'#9a7444');rc(x,148-hh,3,1,'#c8a468')}rc(22,148,120,3,'#6a4a2a');
  for(let i=0;i<4;i++)rc(40+i*30,130,24,2,'#c8a468');
  for(let i=0;i<5;i++)rc(150,160-i*3,16,2,'#9a7444');for(let i=0;i<4;i++)barrel(176+(i%2)*9,168-((i>>1)*8),'#1a1008');
  rc(120,60,4,92,'#5a3a1c');rc(120,60,40,3,'#5a3a1c');line(122,64,140,62,'#4a2a14');
  vig()},
 anim(S,t){const h=sw(t,3),p=((t*.4)%100)/100;line(158,63,158,90+Math.round(Math.sin(t/10)*12),'#c8b890');rc(152,90+Math.round(Math.sin(t/10)*12),12,3,'#6a4a2a');
  [[40,150,'#c9a227',0],[80,150,'#2a5a8a',1],[116,150,'#b02a20',2]].forEach(([x,y,c,ph])=>{const hh=sw(t+ph,3);K.person(x,y,c,hh);rc(x+3,y-8+(hh?0:3),1,6,'#7a4a24');rc(x+2,y-9+(hh?0:3),3,2,'#c8c8d0');if(hh)pix(x+6,y-3,'#f8e070')});
  X.ship(250,112+Math.round(Math.sin(t/14)),.9,true);
  if(sw(t,12))for(let i=0;i<3;i++)pix(30+i*40+((t*3)%12),160,'#d8c8a0')}};
HH.extraScenes={rathaus,schenke,werft};
})();
