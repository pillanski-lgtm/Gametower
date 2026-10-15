/* Szenen: statischer Hintergrund (gecacht) + Animations-Ebene. Jede Seite hat ihre eigene Szene. */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
const X=HH.gfx,D=HH.data,sim=HH.sim;
let W=X.W;
const {H,seed,pix,rc,dith,line,poly,outline,ell,spr,sky,cloud,hills,tree,brickBlock,gable,timber,stoneHouse,barrel,crate,sack,person,cobbleFn,wallFn,waterBase,smoke,flame,vig,ICONS}=X;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sw=(t,p)=>Math.floor(t/p)%2;

/* ---------- gemeinsame Helfer ---------- */
function grass(y0,seedv){const r=seed(seedv||3);for(let y=y0;y<H;y++)for(let x=0;x<W;x++)pix(x,y,((x+y)&1)&&y%3==0?'#6a8a30':'#7a9a3a');for(let i=0;i<260;i++){const x=r()*W|0,y=y0+(r()*(H-y0)|0);rc(x,y,1,2,'#5a7a28');pix(x+1,y,'#9ab44a')}}
function farmSky(){sky(76);hills(60,'#8a9a52','#a8b868',5,.03,1);hills(68,'#7a8a42','#98a85a',4,.045,2);const r=seed(9);for(let i=0;i<50;i++)tree(r()*W,58+r()*12,null,r)}
function walkers(t,list){for(const w of list){const span=w.x1-w.x0,ph=(t*w.v+w.o)%(2*span),x=w.x0+(ph<span?ph:2*span-ph);person(x,w.y,w.c,sw(t,4)&&1)}}
function sign(x,y,txt){rc(x,y-14,2,14,'#4a2a14');rc(x-9,y-22,20,9,'#1a1008');rc(x-8,y-21,18,7,'#b9803f');rc(x-6,y-19,14,1,'#7a4a24');rc(x-6,y-17,14,1,'#7a4a24')}
function dust(t,n,x0,x1,y0,y1){for(let i=0;i<n;i++){const x=x0+((i*53+t*0.3*(1+i%3))%(x1-x0)),y=y0+((i*37+Math.sin((t+i*7)/9)*5+t*.1)%(y1-y0));pix(x,y,'#e8dcc0')}}
const cityStyle={ostsee:{bodies:['#a8482e','#8a6a52','#a8482e','#8a6a52','#a8482e'],dk:['#7a2e1c','#6a4a38'],lt:['#c86a42','#a8866a']},
 nordsee:{bodies:['#8a3a2a','#6a4a3a','#8a3a2a','#a8482e','#6a4a3a'],dk:['#5a2418','#4a3224'],lt:['#a8523a','#8a6a52']},
 ostsee2:{bodies:['#d8a04a','#5a9a9a','#d88a8a','#a8482e','#c8b858'],dk:['#a8782a','#3a7a7a','#b06a6a','#7a2e1c','#a89838'],lt:['#f0c060','#7ab8b8','#f0a8a8','#c86a42','#e0d078']}};
function cityHouses(style,r){const cs=cityStyle[style]||cityStyle.ostsee;let x=-6;const hs=[[36,58,4],[32,48,3],[38,66,5],[34,54,4],[34,60,5]];
 hs.forEach((h,i)=>{gable(x,86-(i%2)*2,h[0],h[1],h[2],{body:cs.bodies[i%5],dk:cs.dk[i%cs.dk.length],lt:cs.lt[i%cs.lt.length]},r);x+=h[0]-2})}
function tent(x,y,w,c){rc(x-w,y-14,2*w,2,'#4a3a20');for(let i=-w;i<w;i++)rc(x+i,y-12,1,10,(((i+w)>>2)%2)?'#e8dcc0':c);rc(x-w+1,y-2,2*w-2,6,'#7a4a24');rc(x-w+1,y-2,2*w-2,1,'#b9803f');rc(x-w,y-14,1,16,'#2a1608');rc(x+w-1,y-14,1,16,'#2a1608')}
function spire(x,y,h,w){const P=[[x-w,y],[x,y-h],[x+w,y]];poly(P,(px,py)=>(((px+py)%4==0)?'#2a5a44':'#3f7a5a'));outline(P,'#13281e');pix(x,y-h-1,'#e8b030')}
const bst=(S,id)=>S.b[id].state;

/* ---------- Szene: Stadt ---------- */
const stadt={
 key:S=>D.cities[S.city].style,
 bg(S){const r=seed(11);sky(80);cloud(70,16,18);cloud(200,26,22);hills(60,'#8a9a52','#a8b868',5,.03,1);hills(68,'#7a8a42','#98a85a',4,.045,2);for(let i=0;i<60;i++)tree(r()*W,56+r()*16,null,r);
  cityHouses(D.cities[S.city].style,r);
  timber(2,108,44,44);stoneHouse(150,84,32,36);stoneHouse(188,86,30,42);timber(222,92,22,30,'#a8452c');timber(240,96,28,34,'#b4482c');
  waterBase(84,H,'#3e6e86','#34607a',5);
  poly([[150,92],[250,92],[256,110],[160,106]],cobbleFn());poly([[160,106],[256,110],[256,126],[164,122]],wallFn());
  poly([[0,82],[82,86],[148,108],[152,134],[112,160],[0,176]],cobbleFn());
  poly([[0,176],[112,160],[152,134],[152,142],[116,170],[0,188],[0,192]],wallFn());
  for(let x=272;x<W;x+=34)timber(x,96+((x/34|0)%2)*2,26,28+((x/34|0)%3)*5,(x/34|0)%2?'#a8452c':'#b4482c');
  tent(72,126,14,'#a42e24');tent(100,130,14,'#2a5a8a');
  [[30,116],[38,120],[34,126],[22,128],[16,134],[62,148],[70,152],[10,158],[22,164]].forEach(p=>barrel(p[0],p[1]));[[50,146],[56,152],[120,140]].forEach(p=>sack(p[0],p[1]));[[40,134],[84,150]].forEach(p=>crate(p[0],p[1]));
  vig()},
 anim(S,t){
  const b=Math.round(Math.sin(t/14));X.ship(186,104+b,1,false);X.ship(262,92-b,.5,false);X.ship(300,100+b,.5,true);
  walkers(t,[{x0:6,x1:60,y:112,v:.25,o:0,c:'#b02a20'},{x0:10,x1:110,y:122,v:.3,o:20,c:'#2a5a8a'},{x0:30,x1:130,y:142,v:.22,o:50,c:'#3f7a2a'},{x0:6,x1:100,y:154,v:.28,o:8,c:'#e8b030'},{x0:60,x1:140,y:134,v:.2,o:60,c:'#6a3a7a'}]);
  for(let i=0;i<14;i++)if((t+i*7)%24<5)pix(158+((i*37)%90),96+((i*13)%80)%(i%2?60:30),'#cfe8f0');
  const run=sim.status(S,'brauerei').code==='laeuft';if(run||sw(t,40)){smoke(168+((t/6)%6),44-((t/3)%18),2,'#d8dce0')}}
};
stadt.hot=[{id:'kontor',label:'Kontor',x:2,y:62,w:46,h:48,page:'kontor'},{id:'markt',label:'Markt',x:56,y:100,w:62,h:34,page:'markt'},{id:'gut',label:'Betriebe',x:146,y:36,w:76,h:50,page:'gut'},
 {id:'rathaus',label:'Rathaus (bald)',x:66,y:22,w:34,h:46,off:1},{id:'werft',label:'Werft (bald)',x:226,y:70,w:26,h:30,off:1}];

/* ---------- Szene: Markt ---------- */
const markt={
 key:S=>D.cities[S.city].style,
 bg(S){const r=seed(22);sky(106);cloud(110,14,22);cloud(260,24,18);hills(64,'#8a9a52','#a8b868',4,.03,3);
  [[200,48],[230,44]].forEach(([tx,ty])=>{rc(tx-1,ty-1,24,106-ty+2,'#2a0e08');brickBlock(tx,ty,tx+22,106);spire(tx+11,ty,30,13);ell(tx+11,ty+12,4,4,'#f0e0b0');for(let wy=ty+24;wy<100;wy+=14){rc(tx+8,wy,6,9,'#1a0e08');rc(tx+9,wy-2,4,2,'#1a0e08')}});
  rc(79,49,98,58,'#2a0e08');brickBlock(80,50,176,107);rc(80,50,96,2,'#d89a72');
  [84,104,124,144,166].forEach(x=>{rc(x-3,28,6,24,'#8a3a28');spire(x,28,18,5)});rc(116,22,14,30,'#8a3a28');spire(123,22,14,8);ell(123,34,3,3,'#f0e0b0');
  for(let i=0;i<8;i++){const wx=84+i*10;rc(wx,60,4,10,'#1a0e08');rc(wx,58,4,2,'#1a0e08');rc(wx,86,4,16,'#1a0e08');rc(wx,84,4,2,'#1a0e08')}
  [98,125,152].forEach(x=>ell(x,76,2,2,'#f0e0b0'));
  timber(4,108,40,56);timber(42,108,36,50,'#a8452c');gable(178,108,20,50,3,{},r);gable(252,108,22,56,3,{},r);
  for(let x=282;x<W;x+=34)gable(x,108,28,46+(x%3)*6,3,{},r);
  poly([[0,106],[W,106],[W,H],[0,H]],cobbleFn());
  ell(176,124,18,5,'#7a7a74');ell(176,123,15,4,'#4d7f94');rc(174,106,5,16,'#9a958a');ell(176,106,6,2,'#9a958a');
  tent(130,122,16,'#a42e24');tent(220,124,16,'#2a5a8a');tent(75,136,18,'#3f7a2a');tent(125,150,20,'#a42e24');tent(225,142,18,'#e8b030');tent(250,130,16,'#a42e24');tent(152,114,12,'#2a5a8a');tent(205,112,12,'#e8b030');for(let x=290;x<W;x+=44)tent(x,128+(x%3)*8,16,x%2?'#a42e24':'#2a5a8a');
  for(let i=0;i<14;i++)barrel(14+(r()*220|0),122+(r()*50|0));
  [[140,176],[150,172],[160,178],[170,174],[145,184],[155,186],[165,184],[180,182],[132,182]].forEach(p=>barrel(p[0],p[1]));[[172,188],[190,186]].forEach(p=>crate(p[0],p[1]));[[200,186],[212,184],[206,178]].forEach(p=>sack(p[0],p[1]));
  vig()},
 anim(S,t){const cs=['#b02a20','#2a5a8a','#3f7a2a','#e8b030','#6a3a7a','#7a4a24'];const list=[];for(let i=0;i<16;i++)list.push({x0:6+(i*29)%60,x1:150+(i*47)%100,y:116+(i*23)%68,v:.16+(i%5)*.05,o:i*31,c:cs[i%6]});walkers(t,list);
  for(let i=0;i<5;i++){const h=4+((t+i*5)%10<5?1:0);rc(176+(i-2),99-h+4,1,h,'#c8e0e8')}
  const f=sw(t,6);rc(80,50-4,1,1,'#fff');for(let i=0;i<4;i++)pix(140+i*8+f,24-(i%2),'#b02a20')}
};
markt.hot=[];

/* ---------- Szene: Kontor (Lager, Haufen wachsen mit dem Bestand) ---------- */
const PILE=[['gerste','sack','#d0bc88'],['hopfen','sack','#7ab050'],['wasser','barrel','#5aa0d8'],['duenn','barrel','#e8c040'],['stark','barrel','#b02a20']];
function pileItems(S,g){const n=S.kontor.goods[g];return n<=0?0:Math.min(10,Math.ceil(n/(sim.cap(S)*.1)))}
const kontor={
 key:S=>S.kontor.level+'|'+D.goodOrder.map(g=>pileItems(S,g)).join(','),
 bg(S){rc(0,0,W,H,'#3a2a1e');brickBlock(0,0,W,112,{base:'#8a5a3a',dk:'#5e3a22',lt:'#a8744a'});
  for(let x=0;x<W;x+=46){rc(x,0,4,112,'#3a2210');rc(x+1,0,1,112,'#5a3a1c')}rc(0,28,W,4,'#3a2210');
  for(let wx=40;wx<W;wx+=110){rc(wx-1,38,22,30,'#1a1008');rc(wx,39,20,28,'#98c8e8');rc(wx,39,20,3,'#b8dcec');rc(wx+9,39,2,28,'#3a2210');rc(wx,52,20,2,'#3a2210')}
  for(let y=112;y<H;y++)for(let x=0;x<W;x++)pix(x,y,((x+((y>>3)%2)*10)%20==0||y%8==0)?'#4a2f16':(((x*5+y*3)%13==0)?'#9a6a3a':'#7a5028'));
  rc(0,110,W,3,'#2a170a');
  for(let s=0;s<S.kontor.level+1;s++){const sx=8+s*76;rc(sx,76,64,3,'#5a3a1c');rc(sx,98,64,3,'#5a3a1c');rc(sx+2,76,3,34,'#4a2a14');rc(sx+59,76,3,34,'#4a2a14');for(let i=0;i<4;i++){crate(sx+10+i*13,98);if(i<3)crate(sx+16+i*13,76)}}
  // Haufen
  PILE.forEach(([g,kind,col],pi)=>{const n=pileItems(S,g),cx=34+pi*46,by=172;const rows=[4,3,2,1];let c=0;for(let r=0;r<4;r++){for(let i=0;i<rows[r];i++){if(c>=n)break;const x=cx+(i-(rows[r]-1)/2)*9,y=by-r*7;if(kind==='sack')sack(x,y,col);else barrel(x,y,col);c++}}
   ell(cx,by+4,18,2,'#00000030');const ic=D.goods[g].ic;spr(cx-4,176,ICONS[ic].map(s=>s));});
  vig()},
 anim(S,t){const fl=sw(t,5);rc(190,24,2,8,'#1a1008');rc(188,32,6,6,'#d8a020');rc(189,33,4,4,fl?'#fff0a0':'#f0c840');ell(191,36,10,8,fl?'#f0c84018':'#f0c84010');
  dust(t,18,6,240,40,170);
  const ph=(t*.35)%160,x=ph<80?20+ph*2.4:20+(160-ph)*2.4;person(x,150,'#2a5a8a',sw(t,4)&&1);if(ph<80)crate(x+1,138+(sw(t,4)&&1)-8)}
};
kontor.hot=[];

/* ---------- Szene: Gut (Übersicht der Betriebe) ---------- */
function fieldColor(st){return['#6a4a2a','#6a4a2a','#8ab040','#5a9a30','#e8c040','#b89850'][st]}
function miniField(x0,x1,y0,y1,S,id){const b=S.b[id];for(let y=y0;y<y1;y++){const tt=(y-y0)/(y1-y0),xl=x0-tt*8,xr=x1+tt*6;for(let x=Math.round(xl);x<xr;x++)pix(x,y,(y%4<2)?'#6a4a2a':'#5a3a1e')}
 if(b.state==='ready'){const st=sim.fieldPhase(S,id).stage;if(st>=2){for(let y=y0;y<y1;y+=4){const tt=(y-y0)/(y1-y0),xl=x0-tt*8,xr=x1+tt*6;for(let x=Math.round(xl);x<xr;x+=2)rc(x,y,1,id==='hopfen'?4:2+(st>=3?2:0),fieldColor(st))}}}}
function plotBare(x0,y0,x1,y1){poly([[x0,y0],[x1,y0],[x1+6,y1],[x0-6,y1]],(x,y)=>((x+y)&1)?'#8a6a3a':'#7a5a2e');[[x0,y0],[x1,y0],[x1+6,y1],[x0-6,y1]].forEach(p=>{rc(p[0]-1,p[1]-5,2,6,'#4a2a14')})}
const gut={
 key:S=>D.buildOrder.map(id=>{const b=S.b[id];return b.state+b.level+(D.buildings[id].kind==='field'?sim.fieldPhase(S,id).stage:'')}).join('|'),
 bg(S){farmSky();grass(76,4);
  // Fluss
  for(let y=150;y<170;y++)for(let x=0;x<W;x++)pix(x,y,((y-150)%6<3)?'#4d7f94':'#3e6e86');
  for(let x=0;x<W;x++){pix(x,149,'#3a5a24');pix(x,170,'#3a5a24')}
  // Weg
  poly([[150,192],[190,192],[176,170],[168,170]],cobbleFn('#9a8a62','#6e5e3e','#b8a880'));poly([[160,150],[168,150],[170,98],[160,98]],(x,y)=>((x+y)&1)?'#a8946a':'#98845a');
  // Felder
  const g=S.b.gerste,h=S.b.hopfen;
  if(g.state==='ready')miniField(8,92,100,148,S,'gerste');else plotBare(10,102,92,146);
  if(h.state==='ready'){miniField(112,152,100,146,S,'hopfen');const st=sim.fieldPhase(S,'hopfen').stage;for(let x=116;x<156;x+=14)for(let y=100;y<146;y+=18){rc(x+(y-100)/6,y-12,2,12,'#6a4a2a');if(st>=2)rc(x+(y-100)/6,y-Math.min(12,2+st*2),2,Math.min(12,2+st*2),'#4a8a28')}}else plotBare(112,102,152,146);
  // Brunnen
  const br=S.b.brunnen;if(br.state==='ready'){ell(218,128,9,4,'#7a7a74');ell(218,127,7,3,'#3a6a84');rc(210,112,2,15,'#5a3a1c');rc(224,112,2,15,'#5a3a1c');poly([[207,113],[218,106],[229,113]],'#a8482e')}else plotBare(208,118,230,136);
  // Brauerei
  const bw=S.b.brauerei;if(bw.state==='ready'){stoneHouse(196,92,36,34);rc(228,50,5,26,'#6a6a62');rc(227,48,7,3,'#3a3a34');rc(205,98,6,6,'#1a1008')}else if(bw.state==='building'){rc(196,70,36,22,'#7a5a3a');for(let x=196;x<232;x+=9)rc(x,60,2,32,'#4a2a14');rc(196,60,38,2,'#4a2a14')}else plotBare(198,80,232,100);
  // Häuschen/Scheune
  rc(14,56,26,18,'#8a5a3a');poly([[10,56],[27,44],[44,56]],'#a8482e');rc(22,64,8,10,'#2a1608');
  vig()},
 anim(S,t){const o=(t/10)%420-40;cloud(o,18,16);cloud((o+190)%420-20,32,12);
  const bw=sim.status(S,'brauerei').code==='laeuft';if(bw)for(let i=0;i<3;i++)smoke(230+((t/5+i*7)%6),46-((t/2.5+i*9)%22),2,'#d8dce0');
  for(let i=0;i<20;i++)if((t+i*5)%30<6)pix(10+(i*37)%320,80+(i*17)%60,'#a8c860');
  for(let i=0;i<10;i++)if((t+i*9)%18<4)pix((i*47+t*2)%W,152+(i*5)%14,'#a8d8e8');
  // Arbeiter auf Feldern
  if(S.b.gerste.state==='ready'&&S.b.gerste.workers>0)walkers(t,[{x0:14,x1:80,y:132,v:.2,o:0,c:'#e8b030'}]);
  if(S.b.hopfen.state==='ready'&&S.b.hopfen.workers>0)walkers(t,[{x0:118,x1:150,y:132,v:.2,o:9,c:'#3f7a2a'}]);
  if(S.b.brunnen.state==='ready'&&S.b.brunnen.workers>0)walkers(t,[{x0:198,x1:214,y:140,v:.12,o:3,c:'#2a5a8a'}]);
  if(S.b.brauerei.state==='ready'&&S.b.brauerei.workers>0)walkers(t,[{x0:196,x1:232,y:104,v:.15,o:0,c:'#b02a20'}]);
  if(bst(S,'brauerei')==='building'||bst(S,'gerste')==='building'||bst(S,'hopfen')==='building'||bst(S,'brunnen')==='building'){const h=sw(t,3);if(bst(S,'brauerei')==='building'){person(214,98,'#c9a227',1);rc(218,88+h*3,2,5,'#c8c8d0')}}}
};
gut.hot=[{id:'gerste',label:'Gerstenfeld',x:6,y:98,w:96,h:52,page:'gerste'},{id:'hopfen',label:'Hopfenfeld',x:108,y:94,w:50,h:56,page:'hopfen'},{id:'brunnen',label:'Brunnen',x:204,y:104,w:30,h:36,page:'brunnen'},{id:'brauerei',label:'Brauerei',x:194,y:44,w:44,h:56,page:'brauerei'}];

/* ---------- Baustelle (für jeden Betrieb, solange nicht fertig) ---------- */
function hammerer(x,y,col,t,ph){const h=sw(t+ph,3);person(x,y,col,h);rc(x+3,y-8+(h?0:3),1,6,'#7a4a24');rc(x+2,y-9+(h?0:3),3,2,'#c8c8d0');if(h)pix(x+6,y-3,'#f8e070')}
function ox(x,y,t){const s=sw(t,6);rc(x,y-8,16,8,'#6a4426');rc(x+14,y-12,6,6,'#6a4426');rc(x+19,y-13,2,2,'#e8dcc0');rc(x+15,y-14,2,3,'#e8dcc0');rc(x+2,y,2,5+s,'#4a2a14');rc(x+6,y,2,5+(1-s),'#4a2a14');rc(x+12,y,2,5+s,'#4a2a14');rc(x+15,y,2,5+(1-s),'#4a2a14');rc(x-3,y-7,3,2,'#4a2a14')}
function plotScene(id){const kind=D.buildings[id].kind;return{
 key:S=>bst(S,id),
 bg(S){farmSky();grass(76,6);
  poly([[40,92],[210,92],[240,176],[10,176]],(x,y)=>((x+y)&1)?'#8a6a3a':'#7a5a2e');
  [[40,92],[210,92],[240,176],[10,176]].forEach(p=>{rc(p[0]-1,p[1]-8,3,10,'#4a2a14');rc(p[0]-1,p[1]-8,3,2,'#b9803f')});
  for(let i=0;i<5;i++)crate(246-(i%3)*11,150-(i>>1)*8);for(let i=0;i<6;i++)rc(230+(i%3)*3,170-(i>>1)*3,10,2,'#9a7444');
  for(let i=0;i<5;i++)ell(24+i*5,168-(i%2)*2,3,2,'#8a8a82');
  for(let i=0;i<4;i++)rc(200+i*3,98+(i%2),14,2,'#9a7444');
  if(bst(S,id)==='none'){sign(125,100);line(40,92,210,92,'#c8b890');line(210,92,240,176,'#c8b890');line(240,176,10,176,'#c8b890');line(10,176,40,92,'#c8b890')}
  vig()},
 anim(S,t){const b=S.b[id],p=b.state==='building'?1-b.buildLeft/D.buildings[id].buildDays:0;if(b.state==='none')return;const h=sw(t,3);
  if(id==='gerste'){const px=40+p*180;for(let r=0;r<9;r++){const y=100+r*8;for(let x=40;x<px-r*2;x+=2)rc(x+r*3,y,2,1,'#4a2a14'),rc(x+r*3,y+1,2,1,'#6a4a2a')}
   ox(px-6,112,t);rc(px+14,108,10,1,'#4a2a14');rc(px+22,108,2,6,'#8a8a82');person(px-24,114,'#6a3a7a',h);hammerer(60,150,'#e8b030',t,0);person(110,140,'#2a5a8a',1-h);sack(120,142);}
  else if(id==='hopfen'){const n=Math.floor(p*9);for(let i=0;i<9;i++){const x=48+i*20,hgt=i<n?40:(i===n?Math.round((p*9-n)*40):0);if(hgt>0){rc(x,150-hgt,3,hgt,'#6a4a2a');rc(x,150-hgt,3,1,'#9a7444')}}
   if(n>2)line(48,150-40,48+Math.min(n,8)*20,150-40,'#2a1a10');const cx=48+Math.min(n,8)*20+10;hammerer(cx,156,'#c9a227',t,1);person(cx+18,158,'#2a5a8a',h);rc(cx+22,146+h*2,2,12,'#6a4a2a');hammerer(100,166,'#6a3a7a',t,2)}
  else if(id==='brunnen'){const rows=Math.floor(p*7);for(let r=0;r<rows;r++){ell(125,150-r*4,22-r,6-(r>3?1:0),(x,y)=>(((x+y)>>1)%3==0?'#a8a8a0':'#7a7a74'));ell(125,150-r*4-1,16-r,3,'#3b2412')}
   rc(86,90,3,64,'#5a3a1c');rc(160,90,3,64,'#5a3a1c');rc(84,88,82,3,'#5a3a1c');line(125,91,125,120+Math.round(Math.sin(t/8)*8),'#c8b890');rc(121,120+Math.round(Math.sin(t/8)*8),8,6,'#8a8a82');
   hammerer(80,152,'#6a3a7a',t,0);sack(84,146);person(172,154,'#e8b030',1-h);crate(190,150)}
  else{const hgt=Math.floor(Math.min(1,p/.55)*52),roof=p>.55?Math.min(1,(p-.55)/.3):0,px=[60,100,140,180];
   if(p>0.03)rc(50,150,140,5,'#8a8a82');if(p>0.03)rc(50,150,140,1,'#b8b8b0');
   for(const x of px){rc(x,150-hgt,4,hgt,'#6a4a2a');rc(x,150-hgt,4,1,'#9a7444')}
   if(hgt>20){rc(60,150-hgt+4,124,3,'#4a2a14');rc(60,150-Math.floor(hgt*.5),124,3,'#4a2a14');for(let i=0;i<3;i++)line(64+i*40,150-Math.floor(hgt*.5),104+i*40,150-hgt+6,'#4a2a14')}
   if(roof>0){const ry=150-hgt-Math.round(roof*18);poly([[54,150-hgt+4],[122,ry],[190,150-hgt+4]],(x,y)=>(y%3==0)?'#7a2a1c':(roof>.8?'#a8482e':'#6a4a2a'));if(roof<=.8){for(let i=0;i<9;i++)line(54+i*15,150-hgt+4,122,ry,'#4a2a14')}}
   if(p>0.85){rc(62,150-30,120,30,'#8a5a3a');for(let y=150-30;y<150;y+=3)rc(62,y,120,1,'#6a4228')}
   rc(196,70,3,86,'#5a3a1c');rc(196,70,50,3,'#5a3a1c');line(246,73,246,100+Math.round(Math.sin(t/10)*10),'#c8b890');rc(240,100+Math.round(Math.sin(t/10)*10),12,3,'#6a4a2a');
   hammerer(80,160,'#c9a227',t,0);hammerer(130,160,'#2a5a8a',t,1);person(172,160,'#b02a20',h);rc(166,148,2,12,'#9a7444');rc(166,148,6,1,'#9a7444')}
  if(sw(t,12))for(let i=0;i<3;i++)pix(120+i*30+((t*3)%12),170-(i%2)*3,'#d8c8a0');
  for(let i=0;i<4;i++)if((t+i*6)%18<3)pix(60+i*40+(t%7),140-(i%3)*10,'#e8dcc0')}}}

/* ---------- Gerstenfeld ---------- */
const FR=12,FY0=84,FY1=186;
function rowY(r){return FY0+(FY1-FY0)*Math.pow(r/(FR-1),1.35)}
function wagon(x,y,loaded,col,t){rc(x-12,y-6,24,5,'#7a4a24');rc(x-12,y-6,24,1,'#b9803f');if(loaded)for(let i=0;i<5;i++)ell(x-8+i*4,y-8,3,3,col);rc(x-9,y-1,6,6,'#1a1008');rc(x+4,y-1,6,6,'#1a1008');rc(x-8,y,4,4,'#7a4a24');rc(x+5,y,4,4,'#7a4a24');rc(x+12,y-5,8,3,'#4a2a14');rc(x+18,y-9,8,6,'#6a4426');rc(x+25,y-12,4,4,'#6a4426');rc(x+19,y-3+(sw(t,6)),1,6,'#4a2a14');rc(x+24,y-3,1,6,'#4a2a14')}
const gerste={
 key:S=>'g',
 bg(S){farmSky();grass(76,2);
  stoneHouse(150,92,24,24);timber(176,90,34,28);rc(190,84,12,10,'#d8c8a0');rc(195,86,4,8,'#2a1608');
  vig()},
 anim(S,t){const b=S.b.gerste,f=sim.fieldPhase(S,'gerste'),st=f.stage,p=f.p,winter=sim.calendar(S.day).season==='winter';
  for(let r=0;r<FR;r++){const tt=r/(FR-1),y=Math.round(rowY(r)),rh=Math.max(3,Math.round(4+tt*7)),s=.5+tt*1.1;
   rc(0,y,W,rh,r%2?'#6a4a2a':'#5a3a1e');if(winter&&f.stage===0){rc(0,y,W,Math.max(1,rh-2),'#e8f0f6');rc(0,y+rh-2,W,1,'#b8c8d4')}
   const cutX=st===5?p*W:0,sowX=st===1?p*W:0;
   for(let x=0;x<W;x+=3){let h=0,col=null;
    if(st===0){if(f.failed&&((x*7+r*13)%9==0)){h=2;col='#4a6a28'}}
    else if(st===1){if(x<sowX&&((x+r)%6==0)){h=1;col='#8a6a3a'}}
    else if(st===2){h=1+Math.floor(p*2);col='#8ab040'}
    else if(st===3){h=Math.round((2+p*9)*s);col=(p>.7?'#6aa838':'#5a9a30')}
    else if(st===4){h=Math.round(12*s);col=(x+r)%6<3?'#e8c040':'#d8b030'}
    else if(st===5){if(x<cutX){h=2;col='#b89850'}else{h=Math.round(12*s);col=(x+r)%6<3?'#e8c040':'#d8b030'}}
    if(h>0){const sx=h>5?Math.round(Math.sin(t*.18+x*.07+r*.9)*.8):0;rc(x+sx,y+rh-h,1,h,col);if(st>=4&&h>8)pix(x+sx,y+rh-h-1,'#f8e070')}}
   if(st===5&&b.state==='ready'){const cx=cutX;for(let x=10;x<cx-8;x+=26)if((r+(x/26|0))%3==0){poly([[x,y+rh],[x+3,y+rh-6],[x+6,y+rh]],'#d8b030');pix(x+3,y+rh-6,'#f8e070')}}
  }
  const wk=b.workers>0;
  if(st===1&&wk){const sx=p*W,y=Math.round(rowY(5))-2;person(sx,y,'#6a3a7a',sw(t,3));const k=sw(t,4);rc(sx+3,y-5+k,3,1,'#6a3a7a');for(let i=0;i<4;i++)pix(sx+5+i*2+((t+i)%3),y-3+(i%2),'#e8c860')}
  if(st===5&&wk){const cx=p*W;for(const r of[3,6,9]){const y=Math.round(rowY(r))+2;person(cx,y,'#b02a20',sw(t,4));const k=sw(t,3);line(cx+2,y-4,cx+8,y-(k?6:2),'#c8c8d0');rc(cx+2,y-4,1,5,'#7a4a24')}}
  if(st>=2&&st<=4&&wk){walkers(t,[{x0:20,x1:200,y:Math.round(rowY(4)),v:.12,o:0,c:'#e8b030'},{x0:60,x1:240,y:Math.round(rowY(8)),v:.1,o:50,c:'#3f7a2a'}])}
  // Wagen & Scheune
  const barn=b.barn;if(barn>0||st===5){const x=((t*.6)%(W+20))-20;wagon(x,60+4,true,'#e8c040',t)}
  const sk=Math.min(8,Math.ceil(barn/30));for(let i=0;i<sk;i++)sack(214+(i%4)*7,100-(i>>2)*6,'#d8b030');
 }};

/* ---------- Hopfenfeld ---------- */
const HR=5;
function hopRowY(r){return 96+Math.pow(r/(HR-1),1.2)*88}
const hopfen={
 key:S=>'h',
 bg(S){farmSky();grass(76,5);for(let r=0;r<HR;r++){const y=Math.round(hopRowY(r));rc(0,y-1,W,5+r*2,'#5e4228');for(let x=0;x<W;x+=3)if((x*5+r)%7==0)pix(x,y+1,'#3a5a24')}
  timber(168,88,34,30,'#a8452c');vig()},
 anim(S,t){const b=S.b.hopfen,f=sim.fieldPhase(S,'hopfen'),st=f.stage,p=f.p;
  const cutX=st===5?p*W:0;
  for(let r=0;r<HR;r++){const tt=r/(HR-1),s=.55+tt*.75,y=Math.round(hopRowY(r))+2,Hp=Math.round(40*s);
   for(let x=10+(r%2)*14;x<W;x+=30){
    const cut=st===5&&x<cutX;
    rc(x,y-Hp,2,Hp,'#6a4a2a');rc(x-1,y-Hp,4,1,'#9a7444');
    let hv=0;if(st===2)hv=Math.round((4+p*6)*s);else if(st===3)hv=Math.round((10+p*(Hp-12))*s*0.9+0);else if(st>=4)hv=Hp-2;if(cut)hv=0;if(hv>Hp-1)hv=Hp-1;
    for(let k=0;k<hv;k++){const yy=y-k,ox=(Math.floor(k/3)%2)?1:-1;pix(x+1+ox,yy,'#3a7a22');pix(x+1+ox*0,yy,'#4a8a2a');if(k%7==3){const sx=Math.round(Math.sin(t*.12+x*.1)*(k>10?1:0));rc(x+(ox>0?2:-2)+sx,yy-1,3,2,'#5aa030');if(st>=4&&!cut&&k>8)rc(x+(ox>0?3:-3)+sx,yy+1,2,3,'#c8d860')}}
    if(cut)rc(x-1,y-3,4,3,'#6a8a30');
    if(st===5&&b.workers>0&&Math.abs(x-cutX)<16){person(x+5,y+2,'#b02a20',sw(t,4));rc(x+8,y-3,5,4,'#a8782a')}
   }
   if(st===1&&b.workers>0){const sx=p*W;person(sx,y-1,'#6a3a7a',sw(t,3))}
   // Draht
   for(let x=10+(r%2)*14;x<W-30;x+=30){line(x,y-Hp,x+30,y-Hp,'#2a1a10')}
  }
  if(b.barn>0||st===5){const x=((t*.6)%(W+20))-20;wagon(x,64,true,'#a8c850',t)}
  const sk=Math.min(8,Math.ceil(b.barn/12));for(let i=0;i<sk;i++)sack(214+(i%4)*7,100-(i>>2)*6,'#7ab050');
 }};

/* ---------- Brunnen ---------- */
const brunnen={
 key:S=>S.b.brunnen.level,
 bg(S){farmSky();grass(72,7);
  poly([[60,192],[240,192],[200,100],[110,100]],cobbleFn('#9a8a62','#6e5e3e','#b8a880'));
  timber(40,100,30,26,'#a8452c');timber(210,96,30,26,'#9a4a2c');for(let x=252;x<W;x+=38)timber(x,100,30,24+(x%3)*3,x%2?'#a8452c':'#9a4a2c');
  // Brunnen-Gemäuer
  rc(124,108,52,6,'#2a2a26');for(let y=104;y<126;y++)for(let x=122;x<178;x++){const e=Math.abs((x-150)/28)**2+((y-114)/10)**2;if(e<1){pix(x,y,((x+y)>>1)%3==0?'#a8a8a0':'#7a7a74')}}
  ell(150,112,24,6,'#2a2a26');ell(150,112,21,5,'#1a3a54');ell(150,111,16,3,'#3a6a8a');
  rc(124,70,4,42,'#5a3a1c');rc(172,70,4,42,'#5a3a1c');rc(122,66,56,5,'#4a2a14');poly([[116,68],[150,50],[184,68]],(x,y)=>(y%3==0)?'#7a2a1c':'#a8482e');outline([[116,68],[150,50],[184,68]],'#2a0e08');
  if(S.b.brunnen.level>=2){rc(204,150,18,10,'#7a4a24');ell(213,150,10,3,'#3a6a8a');rc(206,140,2,10,'#5a3a1c');rc(218,140,2,10,'#5a3a1c')}
  if(S.b.brunnen.level>=3){for(let i=0;i<4;i++)barrel(70+i*10,170,'#5aa0d8')}
  vig()},
 anim(S,t){const b=S.b.brunnen,run=b.workers>0&&!b.full;
  const k=run?(Math.sin(t/9)+1)/2:0.5;const by=Math.round(72+k*36);
  line(150,70,150,by,'#c8b890');rc(146,by,8,6,'#7a4a24');rc(147,by+5,6,1,'#1a1008');if(run&&k<.3)for(let i=0;i<3;i++)pix(147+i*3,by+6+((t+i*3)%4),'#8cc8e8');
  rc(140,64,20,3,'#3a2210');rc(138,62+((t/3|0)%2),2,6,'#c8c8d0');
  if(run){walkers(t,[{x0:64,x1:140,y:130,v:.3,o:0,c:'#2a5a8a'},{x0:80,x1:180,y:150,v:.25,o:40,c:'#6a3a7a'}]);
   const wx=64+((t*.3)%152);for(let i=0;i<2;i++)rc(wx+3,124+i,2,3,'#5aa0d8')}
  else walkers(t*0,[{x0:100,x1:101,y:134,v:0,o:0,c:'#2a5a8a'}]);
  const bar=Math.min(4,Math.floor(S.kontor.goods.wasser/20));for(let i=0;i<bar;i++)barrel(46+i*9,128,'#5aa0d8');
  if(run&&sw(t,10)){for(let i=0;i<4;i++)pix(146+((t*3+i*7)%12),110+(i%2),'#cfe8f0')}
 }};

/* ---------- Brauerei ---------- */
const brauerei={
 key:S=>S.b.brauerei.level,
 bg(S){const lv=S.b.brauerei.level;sky(125);cloud(250,22,18);
  gable(212,126,30,64,4,{});timber(196,126,24,40);gable(244,126,34,58,5,{});for(let x=284;x<W;x+=38)gable(x,126,32,54+(x%3)*7,4,{});
  poly([[0,125],[W,125],[W,H],[0,H]],cobbleFn());
  poly([[14,130],[14,30],[48,18],[205,38],[207,130]],'#2a1a10');
  rc(50,34,152,94,'#5a4030');for(let x=56;x<202;x+=20)rc(x,34,3,94,'#2a170a');[56,80,104].forEach(y=>rc(50,y,152,2,'#2a170a'));
  const r=seed(5);for(let i=0;i<9;i++)barrel(60+i*15,80+(i%2)*3);for(let i=0;i<6;i++){barrel(70+i*22,104);if(lv>=3)barrel(70+i*22,128)}
  const kx=lv>=2?[78,112]:[96];kx.forEach(k=>{rc(k-3,40,3,28,'#8a4a22');rc(k+3,40,3,28,'#8a4a22');line(k+6,46,k+22,62,'#c07a3c');line(k+6,47,k+22,63,'#8a4a22');
   ell(k+3,102,20,10,(px)=>(px<k-4?'#8a4a22':(px<k+6?'#e09450':'#7a3c1a')));ell(k+3,98,16,5,'#3a1d0a');ell(k+3,97,13,3,'#d8b070');rc(k-12,116,30,4,'#1a1008')});
  rc(13,17,40,114,'#2a0e08');brickBlock(14,18,52,131);rc(22,52,10,22,'#1a0e08');rc(22,50,10,2,'#d8c8a0');
  const RF=[[6,34],[52,10],[212,25],[224,42],[212,48],[50,24],[6,48]];poly(RF,(px,py)=>(py%3==0?'#8a3220':(((px+(py/3|0)*2)%4)==0?'#9a3a24':'#b4482c')));outline(RF,'#2a0e08');
  poly([[200,48],[216,44],[216,130],[200,130]],'#6a5040');
  [[16,176],[28,182],[40,186],[52,188],[22,170],[8,166],[62,190]].forEach(p=>barrel(p[0],p[1]));[[38,160],[46,164],[10,160],[30,166]].forEach(p=>sack(p[0],p[1]));
  rc(140,160,44,12,'#7a4a24');rc(140,160,44,1,'#b9803f');ell(152,152,12,7,'#8a5a30');ell(172,154,10,6,'#8a5a30');rc(146,172,10,10,'#1a1008');rc(148,174,6,6,'#7a4a24');rc(170,172,10,10,'#1a1008');rc(172,174,6,6,'#7a4a24');rc(126,162,14,2,'#1a1008');
  rc(190,146,14,10,'#6a4426');rc(202,140,6,8,'#6a4426');rc(206,140,3,3,'#6a4426');rc(192,156,2,10,'#4a2a14');rc(198,156,2,10,'#4a2a14');
  vig()},
 anim(S,t){const b=S.b.brauerei,lv=b.level,st=sim.status(S,'brauerei'),run=st.code==='laeuft';const kx=lv>=2?[78,112]:[96];
  kx.forEach((k,i)=>{if(run){const fl=(t+i*2)%3;ell(k+3,119,9,4,'#ff6a20');ell(k+3,119,5,2,'#f0c840');rc(k+(fl-1)*2,115,2,3,'#fff0a0');
    for(let j=0;j<5;j++){const bt=(t*1.3+j*9)%24;pix(k-6+((j*5+bt)%14),99-Math.floor(bt/8),'#f0dca0')}
    for(let j=0;j<4;j++){const pt=(t*.7+j*8)%32,r=2+Math.floor(pt/9);smoke(k+2+Math.sin((t+j*5)/6)*3,88-pt,r,'#eef2f4')}}
   else{ell(k+3,119,9,4,'#3a2a20')}});
  const wk=b.workers;
  if(run&&wk>0){const k=kx[0],a=Math.sin(t/4);person(k+30,112,'#e8b030',sw(t,4));line(k+28,104,k+8+Math.round(a*6),98,'#c9a468');
   if(wk>1)walkers(t,[{x0:60,x1:190,y:128,v:.3,o:0,c:'#2a5a8a'}]);
   if(wk>2)walkers(t,[{x0:70,x1:180,y:122,v:.25,o:30,c:'#6a3a7a'}]);
   const bx=100+((t*.9)%160);if(bx>150){barrel(bx,178,'#e8c040');if(sw(t,4))pix(bx,175,'#f0e0b0')}}
  else if(wk>0){person(100,128,'#e8b030',0);person(120,128,'#2a5a8a',0)}
  if(st.code==='stockt'||st.code==='leerlauf'){const bl=sw(t,12);if(bl){rc(104,56,22,18,'#1a1008');rc(105,57,20,16,'#e8b030');rc(114,60,2,7,'#1a1008');rc(114,69,2,2,'#1a1008')}}
  // Schornstein-Rauch
  if(run)for(let j=0;j<3;j++)smoke(226+((t/5+j*7)%6),30-((t/2+j*10)%24),2+(j%2),'#d8dce0');
  const c=((t/10)%420)-40;cloud(c,16,16);
 }};

/* ---------- Registry ---------- */
const reg={stadt,markt,kontor,gut,gerste,hopfen,brunnen,brauerei};
const cache={};
function sceneFor(S,id){if(['gerste','hopfen','brunnen','brauerei'].includes(id)){const st=S.b[id].state;if(st!=='ready')return{sc:plotScene(id),cid:'plot_'+id}}return{sc:reg[id]||stadt,cid:id}}
function frame(ctx,id,S,t){const{sc,cid}=sceneFor(S,id);const season=sim.calendar(S.day).season;W=X.W;const k=cid+'|'+season+'|'+W+'|'+(sc.key?sc.key(S):'');
 let c=cache[cid];if(!c||c.k!==k){const cv=c?c.cv:document.createElement('canvas');cv.width=W;cv.height=H;X.use(cv.getContext('2d'));sc.bg(S);X.tint(cv,season);c=cache[cid]={k,cv}}
 X.use(ctx);ctx.drawImage(c.cv,0,0);if(sc.anim)sc.anim(S,t);X.snow(t,season)}
function hotspots(S,id){const sc=reg[id];return(sc&&sc.hot)||[]}
HH.scenes={frame,hotspots,reg};
})();
