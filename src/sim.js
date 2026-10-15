/* Simulationskern (Phase 2) – ohne Grafik, in Node testbar, deterministisch (Seed).
   Bausteine: Kalender · Lager (Store) · Märkte (Verbrauch, Produktion, Preise, Modifikatoren)
   · Anbau-Zyklus · Produktionsketten mit Ursachen-Analyse · Tagesablauf */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
const D=HH.data;
const DPY=360;
const seasonOf=mi=>(mi>=2&&mi<=4)?'fruehling':(mi>=5&&mi<=7)?'sommer':(mi>=8&&mi<=10)?'herbst':'winter';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;

function calendar(day){const m=2+Math.floor(day/30),mi=m%12;return{y:1402+Math.floor(m/12),mi,dom:day%30+1,season:seasonOf(mi),doy:day%DPY,month:D.months[mi]}}
function rnd(S){S.rs=(S.rs+0x6D2B79F5)|0;let t=Math.imul(S.rs^S.rs>>>15,1|S.rs);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function log(S,msg,kind){S.log.unshift({d:S.day,msg,kind:kind||'info'});if(S.log.length>40)S.log.pop();(S.toasts=S.toasts||[]).push({msg,kind:kind||'info'})}

/* ---------- Lager (Kontor, später Schiffe) ---------- */
function mkStore(cap){const goods={};for(const g of D.goodOrder)goods[g]=0;return{cap,goods}}
const storeUsed=st=>D.goodOrder.reduce((a,g)=>a+(st.goods[g]||0),0);
const storeFree=st=>st.cap-storeUsed(st);
function storeAdd(st,g,n){const a=Math.max(0,Math.min(Math.floor(n),storeFree(st)));st.goods[g]=(st.goods[g]||0)+a;return a}
function storeTake(st,g,n){const a=Math.max(0,Math.min(Math.floor(n),st.goods[g]||0));st.goods[g]-=a;return a}
function storeMove(from,to,g,n){const a=Math.max(0,Math.min(Math.floor(n),from.goods[g]||0,storeFree(to)));from.goods[g]-=a;to.goods[g]=(to.goods[g]||0)+a;return a}
const cap=S=>S.kontor.cap,used=S=>storeUsed(S.kontor),free=S=>storeFree(S.kontor);
const addGoods=(S,g,n)=>storeAdd(S.kontor,g,n);

/* ---------- Modifikatoren (Ereignisse, Phase 8): Preis, Verbrauch, Angebot, Ernte ---------- */
function modOf(S,kind,city,good){let m=1;for(const x of S.mods)if(x.kind===kind&&(x.city==='*'||x.city===city)&&(x.good==='*'||x.good===good))m*=x.mult;return m}
function addMod(S,o){const m=Object.assign({kind:'price',city:'*',good:'*',mult:1,until:S.day+30,label:''},o);S.mods.push(m);return m}

/* ---------- Märkte ---------- */
const CONS_MEAN={},PROD_MEAN={};for(const g in D.goods){CONS_MEAN[g]=mean(D.goods[g].consMonths);PROD_MEAN[g]=mean(D.goods[g].prodMonths)}
function dailyCons(S,city,g,mi){const c=D.cities[city],gd=D.goods[g];return gd.cons*(c.pop/1000)*gd.consMonths[mi]*modOf(S,'cons',city,g)}
function dailyProd(S,city,g,mi){const c=D.cities[city],gd=D.goods[g];return gd.cons*(c.pop/1000)*CONS_MEAN[g]*(c.supply[g]||1)*gd.prodMonths[mi]/PROD_MEAN[g]*modOf(S,'supply',city,g)}
function rawPrice(S,city,g,stock){const c=D.cities[city],M=D.market,base=D.goods[g].base*c.mult[g];
 const f=clamp(Math.pow(c.tgt[g]/(stock+1),D.goods[g].elas),M.minF,M.maxF);
 return clamp(base*f*modOf(S,'price',city,g),base*M.minPrice,base*M.maxPrice)}
const midPrice=(S,city,g)=>rawPrice(S,city,g,S.markets[city][g].stock);
const buyUnit=(S,city,g,st)=>Math.max(1,Math.ceil(rawPrice(S,city,g,st)*(1+D.market.spread)));
const sellUnit=(S,city,g,st)=>Math.max(1,Math.floor(rawPrice(S,city,g,st)*(1-D.market.spread)));
function quote(S,g,qty,side){const city=S.city;let st=S.markets[city][g].stock,tot=0;for(let i=0;i<qty;i++){if(side==='buy'){if(st<1)return{total:tot,qty:i,limited:true};tot+=buyUnit(S,city,g,st);st--}else{tot+=sellUnit(S,city,g,st);st++}}return{total:tot,qty,limited:false}}
function buy(S,g,qty){const q=quote(S,g,qty,'buy');if(q.qty<=0)return{ok:false,msg:'Nicht lieferbar'};if(q.qty>free(S))return{ok:false,msg:'Kontor voll'};if(q.total>S.gold)return{ok:false,msg:'Zu wenig Taler'};
 S.gold-=q.total;S.stats.expense+=q.total;S.markets[S.city][g].stock-=q.qty;S.kontor.goods[g]+=q.qty;return{ok:true,qty:q.qty,total:q.total}}
function sell(S,g,qty){qty=Math.min(qty,S.kontor.goods[g]);if(qty<=0)return{ok:false,msg:'Nichts zu verkaufen'};
 const q=quote(S,g,qty,'sell');S.gold+=q.total;S.stats.income+=q.total;S.stats.sold+=qty;S.markets[S.city][g].stock+=qty;S.kontor.goods[g]-=qty;return{ok:true,qty,total:q.total}}
function marketTick(S,mi){for(const city in S.markets)for(const g of D.goodOrder){const m=S.markets[city][g],t=D.cities[city].tgt[g];
  m.stock=Math.max(0,m.stock+dailyProd(S,city,g,mi)-dailyCons(S,city,g,mi)+D.market.k*(t-m.stock)+(rnd(S)-.5)*.03*t);
  const h=S.hist[city][g];h.push(Math.round(midPrice(S,city,g)*10)/10);if(h.length>D.market.histLen)h.shift()}}

/* ---------- Ketten: Quellen & Ursachen ---------- */
function sourcesOf(g){return D.buildOrder.filter(id=>{const c=D.buildings[id];return c.good===g||(c.recipes||[]).some(r=>D.recipes[r].good===g)})}
/* Ursache für „stockt“: verfolgt fehlende Vorprodukte bis zum Betrieb, der sie liefern müsste */
function rootCause(S,id,depth,seen){depth=depth||0;seen=seen||{};if(depth>5||seen[id])return null;seen[id]=1;const c=D.buildings[id],b=S.b[id];
 if(b.state==='none')return{id,text:c.n+' fehlt (nicht gebaut)'};
 if(b.state==='building')return{id,text:c.n+' ist noch im Bau'};
 if(c.kind==='process'&&b.workers<=0)return{id,text:c.n+': keine Arbeiter'};
 if(c.kind==='process'&&b.missing&&b.missing.length){for(const g of b.missing)for(const sid of sourcesOf(g)){const r=rootCause(S,sid,depth+1,seen);if(r&&statusCode(S,sid)!=='laeuft')return r}
  return{id,text:c.n+': '+b.missing.map(g=>D.goods[g].n).join(', ')+' fehlt – im Markt kaufen'}}
 if(c.kind==='field'){const f=fieldPhase(S,id);if(f.failed)return{id,text:c.n+': Aussaat verpasst'};if(b.workers<=0&&(f.stage===1||f.stage===5))return{id,text:c.n+': keine Arbeiter'}}
 if(c.kind==='extract'&&b.workers<=0)return{id,text:c.n+': keine Arbeiter'};
 return null}
const statusCode=(S,id)=>status(S,id).code;

/* ---------- Anbau ---------- */
function fieldPhase(S,id){const c=D.buildings[id],b=S.b[id],doy=calendar(S.day).doy;const inR=r=>doy>=r[0]&&doy<r[1];
 if(inR(c.sow))return{stage:1,p:(doy-c.sow[0])/(c.sow[1]-c.sow[0]),label:'Aussaat'};
 if(!b.planted&&doy>=c.sow[1]&&doy<c.harvest[1])return{stage:0,p:0,label:'Nicht bestellt',failed:true};
 if(inR(c.grow)){const p=(doy-c.grow[0])/(c.grow[1]-c.grow[0]);return p<.25?{stage:2,p:p/.25,label:'Austrieb'}:{stage:3,p:(p-.25)/.75,label:'Wachstum'}}
 if(inR(c.ripe))return{stage:4,p:(doy-c.ripe[0])/(c.ripe[1]-c.ripe[0]),label:'Reife'};
 if(inR(c.harvest))return{stage:5,p:(doy-c.harvest[0])/(c.harvest[1]-c.harvest[0]),label:'Ernte'};
 return{stage:0,p:0,label:'Brache'}}
function expectedYield(S,id){const c=D.buildings[id],b=S.b[id];const wf=Math.min(1,b.workers/c.maxW[b.level-1]);return Math.round(c.yield[b.level-1]*(.4+.6*wf)*modOf(S,'yield','*',c.good))}
function daysToHarvest(S,id){const c=D.buildings[id],doy=calendar(S.day).doy;if(doy>=c.harvest[0]&&doy<c.harvest[1])return 0;return doy<c.harvest[0]?c.harvest[0]-doy:DPY-doy+c.harvest[0]}

/* ---------- Status ---------- */
function status(S,id){const c=D.buildings[id],b=S.b[id];
 if(b.state==='none')return{code:'none',text:'Nicht gebaut'};
 if(b.state==='building')return{code:'bau',text:'Im Bau ('+Math.round((1-b.buildLeft/c.buildDays)*100)+'%)'};
 if(c.kind==='field'){const f=fieldPhase(S,id);if(b.workers<=0&&(f.stage===1||f.stage===5))return{code:'stockt',text:'Keine Arbeiter!'};if(f.failed)return{code:'ruht',text:'Aussaat verpasst'};if(b.barn>0&&free(S)<=0)return{code:'leerlauf',text:'Kontor voll'};return{code:f.stage===0?'ruht':'laeuft',text:f.label}}
 if(c.kind==='extract'){if(b.workers<=0)return{code:'stockt',text:'Keine Arbeiter'};if(b.full)return{code:'ruht',text:D.goods[c.good].n+'vorrat voll'};return{code:'laeuft',text:'Läuft'}}
 if(c.kind==='process'){if(b.workers<=0)return{code:'stockt',text:'Keine Arbeiter'};if(b.hold>0)return{code:'leerlauf',text:'Kontor voll'};
  if(!b.running){const r=rootCause(S,id);return{code:'stockt',text:b.missing&&b.missing.length?'Fehlt: '+b.missing.map(g=>D.goods[g].n).join(', '):'Wartet',cause:r?r.text:null}}
  return{code:'laeuft',text:'Braut '+D.recipes[b.recipe].n}}
 return{code:'ruht',text:''}}

/* ---------- Aktionen ---------- */
function build(S,id){const c=D.buildings[id],b=S.b[id];if(b.state!=='none')return{ok:false,msg:'Schon vorhanden'};if(S.gold<c.cost)return{ok:false,msg:'Zu wenig Taler'};
 S.gold-=c.cost;S.stats.expense+=c.cost;b.state='building';b.buildLeft=c.buildDays;log(S,c.n+': Bau begonnen ('+c.buildDays+' Tage)','info');return{ok:true}}
const upgradeCost=(S,id)=>S.b[id].level>=3?null:D.buildings[id].upg[S.b[id].level];
function upgrade(S,id){const b=S.b[id],cost=upgradeCost(S,id);if(b.state!=='ready'||cost==null)return{ok:false,msg:'Nicht möglich'};if(S.gold<cost)return{ok:false,msg:'Zu wenig Taler'};
 S.gold-=cost;S.stats.expense+=cost;b.level++;log(S,D.buildings[id].n+' auf Stufe '+b.level+' ausgebaut','good');return{ok:true}}
function setWorkers(S,id,n){const c=D.buildings[id],b=S.b[id];b.workers=Math.max(0,Math.min(c.maxW[b.level-1],n))}
function setRecipe(S,id,r){const c=D.buildings[id];if(c.kind==='process'&&c.recipes.includes(r)&&S.b[id].recipe!==r){const b=S.b[id];if(b.running)return{ok:false,msg:'Erst den laufenden Sud beenden'};b.recipe=r;b.missing=[];return{ok:true}}return{ok:false,msg:'Nicht möglich'}}
function upgradeKontor(S){const l=S.kontor.level;if(l>=3)return{ok:false,msg:'Maximal'};const cost=D.kontor.upg[l];if(S.gold<cost)return{ok:false,msg:'Zu wenig Taler'};S.gold-=cost;S.stats.expense+=cost;S.kontor.level++;S.kontor.cap=D.kontor.cap[S.kontor.level-1];return{ok:true}}
const totalWorkers=S=>D.buildOrder.reduce((a,id)=>a+(S.b[id].state==='ready'?S.b[id].workers:0),0);

/* ---------- Neues Spiel / Migration ---------- */
function newBuilding(){return{state:'none',level:1,workers:0,buildLeft:0,planted:false,pool:0,poolInit:0,barn:0,recipe:null,prog:0,running:false,hold:0,reason:'',missing:[],full:false}}
function newGame(o){o=o||{};const cityId=o.city||'luebeck',diff=D.difficulty[o.diff||'normal'];
 const S={v:2,rs:(o.seed===undefined?Date.now():o.seed)|0,day:0,gold:diff.gold,start:diff.gold,city:cityId,diffId:o.diff||'normal',wage:diff.wage,
  kontor:Object.assign({level:1},mkStore(D.kontor.cap[0])),markets:{},hist:{},mods:[],b:{},log:[],toasts:[],stats:{income:0,expense:0,wages:0,sold:0,brewed:0,harvested:0,produced:{}}};
 for(const c in D.cities){S.markets[c]={};S.hist[c]={};for(const g of D.goodOrder){S.markets[c][g]={stock:Math.round(D.cities[c].tgt[g]*(.85+rnd(S)*.15))};S.hist[c][g]=[]}}
 for(const id of D.buildOrder){S.b[id]=newBuilding();const c=D.buildings[id];if(c.kind==='process')S.b[id].recipe=c.recipes[0]}
 for(let i=0;i<30;i++)for(const c in S.markets)for(const g of D.goodOrder){const h=S.hist[c][g];h.push(Math.round(midPrice(S,c,g)*10)/10)}
 log(S,'Willkommen! Baue Brunnen, Felder und Brauerei.','info');return S}
function migrate(S){if(S.v>=2)return S;S.v=2;S.mods=S.mods||[];S.hist=S.hist||{};for(const c in D.cities){S.hist[c]=S.hist[c]||{};for(const g of D.goodOrder)S.hist[c][g]=S.hist[c][g]||[]}
 S.kontor.cap=S.kontor.cap||D.kontor.cap[S.kontor.level-1];for(const id in S.b)if(D.buildings[id].kind==='process'&&!S.b[id].recipe)S.b[id].recipe=D.buildings[id].recipes[0];
 S.stats.produced=S.stats.produced||{};return S}

/* ---------- Tagesablauf ---------- */
function tick(S){S.day++;const cal=calendar(S.day),doy=cal.doy;
 S.mods=S.mods.filter(m=>m.until>S.day);
 marketTick(S,cal.mi);
 const w=totalWorkers(S)*S.wage;if(w>0){if(S.gold>=w){S.gold-=w;S.stats.wages+=w;S.stats.expense+=w}else{for(const id of D.buildOrder)S.b[id].workers=0;log(S,'Kein Geld für Löhne – Arbeiter entlassen!','bad')}}
 for(const id of D.buildOrder){const c=D.buildings[id],b=S.b[id];
  if(b.state==='building'){b.buildLeft--;if(b.buildLeft<=0){b.state='ready';b.buildLeft=0;log(S,c.n+' fertiggestellt! Stelle Arbeiter ein.','good')}continue}
  if(b.state!=='ready')continue;
  const lv=b.level-1,wf=Math.min(1,b.workers/c.maxW[lv]);
  if(c.kind==='field'){
   if(doy===0){b.planted=false;b.pool=0;b.poolInit=0}
   if(doy>=c.sow[0]&&doy<c.sow[1]&&b.workers>0&&!b.planted){b.planted=true;log(S,c.n+': Aussaat erledigt','info')}
   if(doy===c.harvest[0]&&b.planted){b.poolInit=Math.round(c.yield[lv]*(.4+.6*wf)*(.85+rnd(S)*.3)*modOf(S,'yield','*',c.good));b.pool=b.poolInit;log(S,c.n+': Ernte beginnt (erwartet '+b.poolInit+')','info')}
   if(doy>=c.harvest[0]&&doy<c.harvest[1]&&b.pool>0&&b.workers>0){const left=c.harvest[1]-doy,take=Math.min(b.pool,Math.ceil(b.pool/left));b.pool-=take;b.barn+=take}
   if(doy===c.harvest[1]-1&&b.pool>0){log(S,c.n+': '+b.pool+' Ernte verdorben – es fehlten Arbeiter!','bad');b.pool=0}
   if(b.barn>0){const mv=addGoods(S,c.good,Math.min(b.barn,40));if(mv>0){b.barn-=mv;S.stats.harvested+=mv;S.stats.produced[c.good]=(S.stats.produced[c.good]||0)+mv}}
  }else if(c.kind==='extract'){
   b.full=false;if(b.workers>0){const room=c.reserve[lv]-S.kontor.goods[c.good];if(room<=0)b.full=true;else{const a=addGoods(S,c.good,Math.min(room,Math.round(c.rate[lv]*wf)));S.stats.produced[c.good]=(S.stats.produced[c.good]||0)+a}}
  }else if(c.kind==='process'){
   const r=D.recipes[b.recipe];
   if(!b.running&&b.hold<=0){b.missing=[];if(b.workers>0){for(const g in r.in)if(S.kontor.goods[g]<r.in[g])b.missing.push(g);
     if(!b.missing.length){for(const g in r.in)S.kontor.goods[g]-=r.in[g];b.running=true;b.prog=0}}}
   if(b.running&&b.hold<=0){b.prog+=wf*c.speed[lv]/r.days;if(b.prog>=1){b.hold=r.out;b.prog=1}}
   if(b.hold>0){const a=addGoods(S,r.good,b.hold);b.hold-=a;S.stats.produced[r.good]=(S.stats.produced[r.good]||0)+a;if(b.hold<=0){b.running=false;b.prog=0;S.stats.brewed+=r.out}}
  }}
 return cal}

HH.sim={DPY,tick,calendar,rnd,log,newGame,migrate,
 mkStore,storeUsed,storeFree,storeAdd,storeTake,storeMove,cap,used,free,addGoods,
 modOf,addMod,dailyCons,dailyProd,rawPrice,midPrice,buyUnit,sellUnit,quote,buy,sell,
 sourcesOf,rootCause,fieldPhase,expectedYield,daysToHarvest,status,build,upgrade,upgradeCost,setWorkers,setRecipe,upgradeKontor,totalWorkers};
if(typeof module!=='undefined')module.exports=HH;
})();
