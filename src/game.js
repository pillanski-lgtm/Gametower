/* Spielsteuerung: Seiten, Panels, Eingaben, Schleife, Speichern */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
const D=HH.data,sim=HH.sim,X=HH.gfx,SC=HH.scenes;
const $=s=>document.querySelector(s);
const SAVE='hanse_save_v1';
const G={S:null,page:'stadt',speed:1,t:0,acc:0,ui:{sel:'duenn',qty:10,city:'luebeck',diff:'normal'},started:false};
const fmt=n=>Math.round(n).toLocaleString('de-DE');
const icon=(n,s)=>`<i class="ic" data-i="${n}" data-s="${s||3}"></i>`;
const parent={markt:'stadt',kontor:'stadt',gut:'stadt',bilanz:'stadt',gerste:'gut',hopfen:'gut',brunnen:'gut',brauerei:'gut'};
const navOf=p=>parent[p]==='gut'?'gut':p==='stadt'?'stadt':p;

/* ---------- kleine UI-Bausteine ---------- */
const bar=(p,cls)=>`<span class="bar ${cls||''}"><s style="width:${Math.round(Math.max(0,Math.min(1,p))*100)}%"></s></span>`;
const btn=(txt,act,o)=>{o=o||{};return`<button class="b ${o.cls||''}" ${o.dis?'disabled':''} data-act="${act}" ${Object.entries(o.d||{}).map(([k,v])=>`data-${k}="${v}"`).join(' ')}>${txt}</button>`};
const chip=(code,text)=>`<span class="chip ${code}">${text}</span>`;
function stepper(id,b,c){const max=c.maxW[b.level-1];return`<div class="row"><span>Arbeiter</span><span class="stp">${btn('−','wk',{d:{id,v:-1},cls:'sq'})}<b>${b.workers}/${max}</b>${btn('+','wk',{d:{id,v:1},cls:'sq'})}</span></div>`}
function upgBtn(S,id){const cost=sim.upgradeCost(S,id);return cost==null?`<div class="note">Höchste Stufe erreicht.</div>`:btn(`Ausbau auf Stufe ${S.b[id].level+1}: ${fmt(cost)} T`,'upg',{d:{id},dis:S.gold<cost})}

/* ---------- Panels ---------- */
function pStadt(S){const c=D.cities[S.city];const tips=[];const B=S.b;
 if(B.brunnen.state==='none')tips.push('Baue einen <b>Brunnen</b> – ohne Wasser kein Bier.');
 if(B.brauerei.state==='none')tips.push('Baue die <b>Brauerei</b> (1.500 T) unter „Betriebe“.');
 if(B.gerste.state==='none')tips.push('Ein <b>Gerstenfeld</b> spart Einkauf. Aussaat bis ca. 30. Mär.');
 for(const id of D.buildOrder)if(B[id].state==='ready'&&B[id].workers===0&&D.buildings[id].kind!=='field')tips.push(`<b>${D.buildings[id].n}</b>: Arbeiter einstellen!`);
 if(S.kontor.goods.duenn+S.kontor.goods.stark>0)tips.push('Du hast Bier im Kontor – <b>verkaufe</b> es im Markt.');
 if(B.brauerei.state==='ready'&&B.brauerei.workers>0&&B.brauerei.missing&&B.brauerei.missing.length)tips.push('Brauerei braucht: '+B.brauerei.missing.map(g=>D.goods[g].n).join(', ')+' – im <b>Markt</b> kaufen.');
 if(!tips.length)tips.push('Alles läuft. Baue aus oder verkaufe Bier zum besten Preis.');
 return{title:c.n,html:`<div class="meta small"><b>${c.n}</b> · ${fmt(c.pop)} Einwohner<br><span class="muted">${c.desc}</span></div>
 <h5>Preise (Kauf)</h5><div class="prices">${D.goodOrder.map(g=>`<span>${icon(D.goods[g].ic,2)} ${D.goods[g].n}</span><span>${sim.buyUnit(S,S.city,g,S.markets[S.city][g].stock)} T</span>`).join('')}</div>
 <h5>Nächste Schritte</h5><ul class="tips">${tips.slice(0,4).map(t=>`<li>${t}</li>`).join('')}</ul>`}}
function pMarkt(S){const g=G.ui.sel,q=G.ui.qty,m=S.markets[S.city][g],own=S.kontor.goods[g];
 const qb=sim.quote(S,g,q,'buy'),qs=sim.quote(S,g,Math.min(q,own),'sell');const mid=sim.midPrice(S,S.city,g),base=D.goods[g].base*D.cities[S.city].mult[g];
 const trend=mid>base*1.12?'<span class="up">teuer ▲</span>':mid<base*.88?'<span class="dn">günstig ▼</span>':'normal';
 return{title:'Marktplatz',html:`<div class="slots five">${D.goodOrder.map(k=>`<div class="slot ${k===g?'sel':''}" data-act="sel" data-g="${k}">${icon(D.goods[k].ic,3)}<i>${sim.buyUnit(S,S.city,k,S.markets[S.city][k].stock)} T</i></div>`).join('')}</div>
 <h5>${D.goods[g].n}</h5>
 <div class="kv"><span>Kaufpreis</span><b>${sim.buyUnit(S,S.city,g,m.stock)} T</b></div><div class="kv"><span>Verkaufspreis</span><b>${sim.sellUnit(S,S.city,g,m.stock)} T</b></div>
 <div class="kv"><span>Stadt-Lager</span><b>${fmt(m.stock)}</b></div><div class="kv"><span>Dein Kontor</span><b>${fmt(own)}</b></div><div class="kv"><span>Lage</span><b>${trend}</b></div>
 <div class="row" style="margin-top:6px"><span>Menge</span><span class="stp">${btn('−','qty',{d:{v:-1},cls:'sq'})}<b>${q}</b>${btn('+','qty',{d:{v:1},cls:'sq'})}</span></div>
 <div class="presets">${[1,10,50,100].map(n=>btn(n,'setq',{d:{v:n},cls:'sm '+(q===n?'on':'')})).join('')}</div>
 <div class="two">${btn(`Kaufen<small>${fmt(qb.total)} T</small>`,'buy',{cls:'go',dis:qb.qty<q||qb.total>S.gold||q>sim.free(S)})}${btn(`Verkaufen<small>${fmt(qs.total)} T</small>`,'sell',{cls:'sell',dis:own<=0})}</div>`}}
function pKontor(S){const cap=sim.cap(S),u=sim.used(S);return{title:'Eigenes Kontor',html:`<div class="meta small">Lager <b>Stufe ${S.kontor.level}</b><br>${fmt(u)} / ${fmt(cap)} Fass belegt</div>${bar(u/cap,u/cap>.9?'bad':u/cap>.7?'warn':'')}
 <div class="inv">${D.goodOrder.map(g=>`<div class="kv">${icon(D.goods[g].ic,3)}<span>${D.goods[g].n}</span><b>${fmt(S.kontor.goods[g])}</b></div>`).join('')}</div>
 <p class="note">Alle Betriebe liefern hier an und holen sich ihre Zutaten von hier.</p>
 ${S.kontor.level<3?btn(`Lager erweitern auf ${D.kontor.cap[S.kontor.level]} (${fmt(D.kontor.upg[S.kontor.level])} T)`,'kupg',{dis:S.gold<D.kontor.upg[S.kontor.level]}):'<div class="note">Höchste Stufe.</div>'}`}}
function pGut(S){const wages=sim.totalWorkers(S)*S.wage;return{title:'Betriebe',html:`<div class="kv"><span>Lohnkosten/Tag</span><b>${wages} T</b></div>`+D.buildOrder.map(id=>{const c=D.buildings[id],b=S.b[id],st=sim.status(S,id);
  return`<div class="card2">${icon(c.ic,4)}<div class="cm"><b>${c.n}</b>${b.state==='ready'?` <small>Stufe ${b.level}</small>`:''}<br>${chip(st.code,st.text)}</div>${b.state==='none'?btn(`Bauen<small>${fmt(c.cost)} T</small>`,'build',{d:{id},dis:S.gold<c.cost,cls:'go'}):btn('Öffnen','go',{d:{p:id}})}</div>`}).join('')}}
function pBuilding(S,id){const c=D.buildings[id],b=S.b[id],st=sim.status(S,id);let html='';
 if(b.state==='none')return{title:c.n,html:`<p class="note">${c.desc}</p><div class="kv"><span>Baukosten</span><b>${fmt(c.cost)} T</b></div><div class="kv"><span>Bauzeit</span><b>${c.buildDays} Tage</b></div>${c.kind==='field'?'<p class="note">Aussaat: '+sowText(c)+'. Zur Aussaat muss mindestens 1 Arbeiter angestellt sein.</p>':''}<div class="two">${btn('Bauen','build',{d:{id},cls:'go',dis:S.gold<c.cost})}</div>`};
 if(b.state==='building'){const p=1-b.buildLeft/c.buildDays;return{title:c.n,html:`<h5>Baustelle</h5>${bar(p)}<div class="kv"><span>Noch</span><b>${b.buildLeft} Tage</b></div><p class="note">Die Arbeiter errichten ${c.n}. Danach kannst du Arbeiter einstellen.</p>`}}
 html+=`<div class="row"><span>Stufe ${b.level}</span>${chip(st.code,st.text)}</div>`;
 if(c.kind==='field'){const f=sim.fieldPhase(S,id);const pp=f.stage===5?f.p:f.p;
  html+=`<h5>${f.label}</h5>${bar(pp,'')}<div class="kv"><span>Ernte</span><b>${sim.daysToHarvest(S,id)?'in '+sim.daysToHarvest(S,id)+' Tagen':'jetzt'}</b></div><div class="kv"><span>Erwartet</span><b>${b.planted||f.stage===1?expText(S,id):'–'}</b></div><div class="kv"><span>Scheune</span><b>${fmt(b.barn)}</b></div>`;
  if(f.stage===1&&b.workers===0)html+='<p class="warn">⚠ Jetzt Arbeiter einstellen, sonst fällt die Aussaat aus!</p>';
  else if(f.stage===5&&b.workers===0)html+='<p class="warn">⚠ Erntehelfer fehlen – die Ernte verdirbt!</p>';
  else if(f.failed)html+='<p class="warn">Dieses Jahr nicht bestellt. Nächstes Jahr zur Aussaat Arbeiter einstellen.</p>';
  else html+='<p class="note">Außerhalb von Aussaat und Ernte kannst du Arbeiter entlassen und Lohn sparen.</p>'}
 else if(c.kind==='well'){html+=`<div class="kv"><span>Leistung</span><b>${Math.round(c.rate[b.level-1]*Math.min(1,b.workers/c.maxW[b.level-1]))} Wasser/Tag</b></div><div class="kv"><span>Vorrat</span><b>${S.kontor.goods.wasser}/${c.reserve[b.level-1]}</b></div>`}
 else if(c.kind==='brew'){const r=D.recipes[b.recipe];
  html+=`<div class="tabs">${Object.keys(D.recipes).map(k=>btn(D.recipes[k].n,'recipe',{d:{r:k},cls:'sm '+(b.recipe===k?'on':'')})).join('')}</div>
  <div class="recipe">${Object.keys(r.in).map(g=>{const have=S.kontor.goods[g],need=r.in[g];return`<div class="ing ${have>=need?'okk':'bad'}">${icon(D.goods[g].ic,3)}<b>${have}/${need}</b></div>`}).join('<span>+</span>')}<span>→</span><div class="ing">${icon(D.goods[r.good].ic,3)}<b>${r.out}</b></div></div>
  <div class="kv"><span>Fortschritt</span><b>${Math.round(b.prog*100)}%</b></div>${bar(b.prog)}<div class="kv"><span>Dauer</span><b>${(r.days/D.buildings.brauerei.speed[b.level-1]).toFixed(1)} Tage</b></div>`}
 html+=stepper(id,b,c)+upgBtn(S,id);return{title:c.n,html}}
const sowText=c=>{const a=sim.calendar(c.sow[0]),b=sim.calendar(c.sow[1]-1);return`${a.dom}. ${a.month.slice(0,3)}. – ${b.dom}. ${b.month.slice(0,3)}.`};
const expText=(S,id)=>fmt(sim.expectedYield(S,id));
function pBilanz(S){const w=sim.totalWorkers(S)*S.wage,s=S.stats;return{title:'Bilanz',html:`<div class="kv"><span>Taler</span><b>${fmt(S.gold)}</b></div><div class="kv"><span>Gewinn seit Start</span><b class="${S.gold-S.start>=0?'up':'dn'}">${fmt(S.gold-S.start)}</b></div>
 <div class="kv"><span>Einnahmen</span><b>${fmt(s.income)}</b></div><div class="kv"><span>Ausgaben</span><b>${fmt(s.expense)}</b></div><div class="kv"><span>Löhne</span><b>${fmt(s.wages)}</b></div><div class="kv"><span>Lohn/Tag</span><b>${w}</b></div>
 <div class="kv"><span>Gebraut</span><b>${fmt(s.brewed)}</b></div><div class="kv"><span>Geerntet</span><b>${fmt(s.harvested)}</b></div>
 <h5>Chronik</h5><ul class="tips log">${S.log.slice(0,5).map(l=>`<li class="${l.kind}">${l.msg}</li>`).join('')}</ul>
 <div class="two">${btn('Speichern','save')}${btn('Hauptmenü','menu')}</div>`}}
const PAGES={stadt:pStadt,markt:pMarkt,kontor:pKontor,gut:pGut,bilanz:pBilanz,gerste:S=>pBuilding(S,'gerste'),hopfen:S=>pBuilding(S,'hopfen'),brunnen:S=>pBuilding(S,'brunnen'),brauerei:S=>pBuilding(S,'brauerei')};
// Szene je Seite
const sceneOf=p=>p==='bilanz'?'stadt':p;

/* ---------- Rendering ---------- */
let lastHTML='',lastHot='';
function renderPanel(force){const S=G.S;const pg=PAGES[G.page](S);const html=`<div class="ptitle">${pg.title}<span class="close" data-act="go" data-p="${parent[G.page]||'stadt'}">✕</span></div><div class="pbody">${pg.html}</div>`;
 if(!force&&html===lastHTML)return;lastHTML=html;const el=$('#panel');el.innerHTML=html;X.hydrate(el)}
function renderHot(){const S=G.S;const sc=sceneOf(G.page);const hs=SC.hotspots(S,sc);const key=G.page+JSON.stringify(hs.map(h=>h.id==='gerste'||h.id==='hopfen'||h.id==='brunnen'||h.id==='brauerei'?sim.status(S,h.id).text:''));if(key===lastHot)return;lastHot=key;
 $('#hots').innerHTML=hs.map(h=>{let sub='';if(sc==='gut'){const st=sim.status(S,h.id);sub=`<small class="${st.code}">${st.text}</small>`}
  return`<button class="hs ${h.off?'off':''}" ${h.off?'disabled':''} style="left:${h.x*4}px;top:${h.y*4}px;width:${h.w*4}px;height:${h.h*4}px" data-act="go" data-p="${h.page||''}"><span>${h.label}${sub}</span></button>`}).join('')}
function renderHUD(){const S=G.S,c=sim.calendar(S.day);$('#dateTxt').textContent=`${c.dom}. ${c.month} ${c.y}`;$('#seasonTxt').textContent=D.seasonNames[c.season];$('#goldTxt').textContent=fmt(S.gold)+' Taler';$('#kontorTxt').textContent=`Kontor ${fmt(sim.used(S))}/${fmt(sim.cap(S))}`;$('#cityTxt').textContent=D.cities[S.city].n;
 document.querySelectorAll('.nav label').forEach(l=>l.classList.toggle('act',l.dataset.p===navOf(G.page)));
 document.querySelectorAll('.sp').forEach(b=>b.classList.toggle('act',+b.dataset.v===G.speed));
 const run=D.buildOrder.filter(id=>S.b[id].state==='ready'),act=run.filter(id=>sim.status(S,id).code==='laeuft').length;
 $('#st1').style.width=Math.round(sim.used(S)/sim.cap(S)*100)+'%';$('#st2').style.width=(run.length?Math.round(act/run.length*100):0)+'%';$('#st3').style.width=Math.min(100,Math.round(sim.totalWorkers(S)*S.wage/40*100))+'%'}
function go(p){if(!PAGES[p])return;G.page=p;lastHTML='';lastHot='';renderAll(true)}
function renderAll(force){renderHUD();renderPanel(force);renderHot()}
function toast(msg,kind){const d=document.createElement('div');d.className='toast '+kind;d.textContent=msg;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),4200);while($('#toasts').children.length>4)$('#toasts').firstChild.remove()}
function flushToasts(){const S=G.S;while(S.toasts&&S.toasts.length){const t=S.toasts.shift();toast(t.msg,t.kind)}}

/* ---------- Aktionen ---------- */
function act(a,d){const S=G.S;let r=null;
 switch(a){
  case'go':go(d.p);return;
  case'sel':G.ui.sel=d.g;break;
  case'qty':G.ui.qty=Math.max(1,G.ui.qty+(+d.v)*(G.ui.qty>=50?10:G.ui.qty>=10?5:1));break;
  case'setq':G.ui.qty=+d.v;break;
  case'buy':r=sim.buy(S,G.ui.sel,G.ui.qty);if(r.ok)toast(`${r.qty}× ${D.goods[G.ui.sel].n} gekauft (−${fmt(r.total)} T)`,'info');break;
  case'sell':r=sim.sell(S,G.ui.sel,G.ui.qty);if(r.ok)toast(`${r.qty}× ${D.goods[G.ui.sel].n} verkauft (+${fmt(r.total)} T)`,'good');break;
  case'build':r=sim.build(S,d.id);if(r.ok){toast(D.buildings[d.id].n+': Bau begonnen','info');if(G.page==='gut')go(d.id)}break;
  case'upg':r=sim.upgrade(S,d.id);break;
  case'kupg':r=sim.upgradeKontor(S);break;
  case'wk':sim.setWorkers(S,d.id,S.b[d.id].workers+(+d.v));break;
  case'recipe':S.b.brauerei.recipe=d.r;S.b.brauerei.running&&0;break;
  case'speed':G.speed=+d.v;break;
  case'save':save();toast('Spiel gespeichert','good');break;
  case'menu':save();showMenu();return;
 }
 if(r&&!r.ok)toast(r.msg,'bad');
 renderAll();}

/* ---------- Speichern ---------- */
function save(){try{const S=JSON.parse(JSON.stringify(G.S));S.toasts=[];localStorage.setItem(SAVE,JSON.stringify({S,page:G.page}))}catch(e){}}
function loadSave(){try{const j=localStorage.getItem(SAVE);return j?JSON.parse(j):null}catch(e){return null}}

/* ---------- Menü ---------- */
function showMenu(){G.started=false;const m=$('#menu');m.classList.add('show');const has=!!loadSave();const ui=G.ui;
 m.innerHTML=`<div class="mbox"><h1>Hanse-Händler<br>&amp; Seefahrer</h1><div class="sub">Erste spielbare Version · Brauerei-Kette</div>
 <div class="mgrid"><div><h5>Spielmodus</h5>${btn('Freies Spiel','mode',{cls:'sm on'})}${btn('Szenarien (bald)','mode',{cls:'sm',dis:1})}
 <h5>Schwierigkeit</h5>${Object.keys(D.difficulty).map(k=>btn(`${D.difficulty[k].n} · ${fmt(D.difficulty[k].gold)} T`,'mdiff',{d:{v:k},cls:'sm '+(ui.diff===k?'on':'')})).join('')}</div>
 <div><h5>Startstadt</h5>${Object.keys(D.cities).map(k=>`<button class="b city ${ui.city===k?'on':''}" data-act="mcity" data-v="${k}"><b>${D.cities[k].n}</b><small>${D.cities[k].desc}</small></button>`).join('')}</div></div>
 <div class="two">${btn('Neues Spiel','mstart',{cls:'go'})}${has?btn('Fortsetzen','mcont'):''}</div></div>`;X.hydrate(m)}
function startGame(S,page){G.S=S;G.page=page||'stadt';G.started=true;G.acc=0;$('#menu').classList.remove('show');lastHTML='';lastHot='';renderAll(true)}

/* ---------- Eingabe ---------- */
let down=false;
document.addEventListener('pointerdown',()=>{down=true});document.addEventListener('pointerup',()=>{down=false});document.addEventListener('pointercancel',()=>{down=false});
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const a=el.dataset.act;const d=el.dataset;
 if(a==='mcity'){G.ui.city=d.v;showMenu();return}if(a==='mdiff'){G.ui.diff=d.v;showMenu();return}if(a==='mode')return;
 if(a==='mstart'){startGame(sim.newGame({city:G.ui.city,diff:G.ui.diff}));return}
 if(a==='mcont'){const s=loadSave();if(s)startGame(s.S,s.page);return}
 if(!G.started)return;act(a,d)});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&G.started){e.preventDefault();G.speed=G.speed?0:1;renderHUD()}});

/* ---------- Schleife ---------- */
const view=$('#view'),vctx=view.getContext('2d');let last=performance.now(),fAcc=0,lastSave=0;
function loop(now){const dt=Math.min(250,now-last);last=now;fAcc+=dt;
 if(G.started){const S=G.S;
  if(G.speed>0){G.acc+=dt*G.speed;const dayMs=1000;let ticked=false;while(G.acc>=dayMs){G.acc-=dayMs;sim.tick(S);ticked=true;if(S.day%30===0&&S.day!==lastSave){lastSave=S.day;save()}}
   if(ticked){flushToasts();renderHUD();if(!down)renderPanel();renderHot()}}
  if(fAcc>=100){fAcc=0;G.t++;SC.frame(vctx,sceneOf(G.page),S,G.t)}}
 else if(fAcc>=100){fAcc=0;G.t++;menuScene()}
 requestAnimationFrame(loop)}
let demo=null;function menuScene(){if(!demo)demo=sim.newGame({seed:7});demo.b.brauerei.state='ready';demo.b.brauerei.workers=2;SC.frame(vctx,'stadt',demo,G.t)}
function fit(){const st=$('#stage');let k=Math.min(innerWidth/1376,innerHeight/768);const dpr=window.devicePixelRatio||1,px=Math.floor(4*k*dpr);if(px>=1)k=px/(4*dpr);/* ganzzahlige Geräte-Pixel pro Spiel-Pixel */st.style.transform='translate(-50%,-50%) scale('+k+')'}
addEventListener('resize',fit);fit();

/* ---------- Start ---------- */
X.hydrate(document);
(function tex(){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');const r=X.seed(3);x.fillStyle='#e8d49a';x.fillRect(0,0,16,16);for(let i=0;i<30;i++){x.fillStyle='#d8c07c';x.fillRect(r()*16|0,r()*16|0,1,1)}$('#stage').style.setProperty('--tex','url('+c.toDataURL()+')')})();
(function shield(){const c=$('#shield'),x=c.getContext('2d');X.use(x);const o=[[0,0],[24,0],[24,18],[12,28],[0,18]];X.poly(o,X.C.k);X.poly([[1,1],[23,1],[23,17.5],[12,26.5],[1,17.5]],'#c9a24a');X.poly([[2,2],[22,2],[22,17],[12,25],[2,17]],'#8a6a3c');X.poly([[3,3],[21,3],[21,16.5],[12,23.5],[3,16.5]],(px,py)=>py>=13?'#c4281c':'#e8e4dc')})();
showMenu();requestAnimationFrame(loop);
HH.game=G;HH.act=act;HH.go=go;
})();
