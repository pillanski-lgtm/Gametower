/* Simulationskern (ohne Grafik, in Node testbar): Zeit, Märkte, Anbau, Produktion */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
const D=HH.data;
const DPY=360;
const seasonOf=mi=>(mi>=2&&mi<=4)?'fruehling':(mi>=5&&mi<=7)?'sommer':(mi>=8&&mi<=10)?'herbst':'winter';

function calendar(day){const m=2+Math.floor(day/30),mi=m%12;return{y:1402+Math.floor(m/12),mi,dom:day%30+1,season:seasonOf(mi),doy:day%DPY,month:D.months[mi]}}
function rnd(S){S.rs=(S.rs+0x6D2B79F5)|0;let t=Math.imul(S.rs^S.rs>>>15,1|S.rs);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
function log(S,msg,kind){S.log.unshift({d:S.day,msg,kind:kind||'info'});if(S.log.length>40)S.log.pop();(S.toasts=S.toasts||[]).push({msg,kind:kind||'info'})}

function newGame(o){o=o||{};const cityId=o.city||'luebeck',diff=D.difficulty[o.diff||'normal'];
 const S={v:1,rs:(o.seed||Date.now())|0,day:0,gold:diff.gold,start:diff.gold,city:cityId,diffId:o.diff||'normal',wage:diff.wage,
  kontor:{level:1,goods:{}},markets:{},b:{},log:[],toasts:[],stats:{income:0,expense:0,wages:0,sold:0,brewed:0,harvested:0}};
 for(const g of D.goodOrder)S.kontor.goods[g]=0;
 for(const c in D.cities){S.markets[c]={};for(const g of D.goodOrder){const t=D.cities[c].tgt[g];S.markets[c][g]={stock:Math.round(t*(0.8+rnd(S)*0.2))}}}
 for(const id of D.buildOrder)S.b[id]={state:'none',level:1,workers:0,buildLeft:0,planted:false,pool:0,poolInit:0,barn:0,recipe:'duenn',prog:0,running:false,hold:0,reason:'',missing:[]};
 log(S,'Willkommen! Baue Brunnen, Felder und Brauerei.','info');return S}

/* ---------- Kontor ---------- */
const cap=S=>D.kontor.cap[S.kontor.level-1];
const used=S=>D.goodOrder.reduce((a,g)=>a+S.kontor.goods[g],0);
const free=S=>cap(S)-used(S);
function addGoods(S,g,n){const a=Math.max(0,Math.min(n,free(S)));S.kontor.goods[g]+=a;return a}

/* ---------- Markt ---------- */
function seasonMod(g,mi){let m=1;if(g==='duenn'||g==='stark'){if(mi===11||mi===0||mi===1)m=1.15;else if(mi>=5&&mi<=7)m=1.05}
 if(g==='gerste'){if(mi>=7&&mi<=9)m=.85;else if(mi>=1&&mi<=3)m=1.12}
 if(g==='hopfen'){if(mi>=8&&mi<=10)m=.8;else if(mi>=1&&mi<=5)m=1.1}return m}
function rawPrice(S,city,g,stock){const c=D.cities[city];const f=Math.min(3,Math.max(.5,Math.pow(c.tgt[g]/(stock+1),.6)));return D.goods[g].base*c.mult[g]*f*seasonMod(g,calendar(S.day).mi)}
const midPrice=(S,city,g)=>rawPrice(S,city,g,S.markets[city][g].stock);
const buyUnit=(S,city,g,st)=>Math.max(1,Math.ceil(rawPrice(S,city,g,st)*1.04));
const sellUnit=(S,city,g,st)=>Math.max(1,Math.floor(rawPrice(S,city,g,st)*.96));
function quote(S,g,qty,side){const city=S.city;let st=S.markets[city][g].stock,tot=0;for(let i=0;i<qty;i++){if(side==='buy'){if(st<=0)return{total:tot,qty:i,limited:true};tot+=buyUnit(S,city,g,st);st--}else{tot+=sellUnit(S,city,g,st);st++}}return{total:tot,qty,limited:false}}
function buy(S,g,qty){const q=quote(S,g,qty,'buy');if(q.qty<=0)return{ok:false,msg:'Nicht lieferbar'};
 if(q.qty>free(S)){return{ok:false,msg:'Kontor voll'}}
 if(q.total>S.gold)return{ok:false,msg:'Zu wenig Taler'};
 S.gold-=q.total;S.stats.expense+=q.total;S.markets[S.city][g].stock-=q.qty;S.kontor.goods[g]+=q.qty;return{ok:true,qty:q.qty,total:q.total}}
function sell(S,g,qty){qty=Math.min(qty,S.kontor.goods[g]);if(qty<=0)return{ok:false,msg:'Nichts zu verkaufen'};
 const q=quote(S,g,qty,'sell');S.gold+=q.total;S.stats.income+=q.total;S.stats.sold+=qty;S.markets[S.city][g].stock+=qty;S.kontor.goods[g]-=qty;return{ok:true,qty,total:q.total}}

/* ---------- Betriebe ---------- */
function fieldPhase(S,id){const c=D.buildings[id],b=S.b[id],doy=calendar(S.day).doy;
 const inR=r=>doy>=r[0]&&doy<r[1];
 if(inR(c.sow))return{stage:1,p:(doy-c.sow[0])/(c.sow[1]-c.sow[0]),label:'Aussaat'};
 if(!b.planted&&doy>=c.sow[1]&&doy<c.harvest[1])return{stage:0,p:0,label:'Nicht bestellt',failed:true};
 if(inR(c.grow)){const p=(doy-c.grow[0])/(c.grow[1]-c.grow[0]);return p<.25?{stage:2,p:p/.25,label:'Austrieb'}:{stage:3,p:(p-.25)/.75,label:'Wachstum'}}
 if(inR(c.ripe))return{stage:4,p:(doy-c.ripe[0])/(c.ripe[1]-c.ripe[0]),label:'Reife'};
 if(inR(c.harvest))return{stage:5,p:(doy-c.harvest[0])/(c.harvest[1]-c.harvest[0]),label:'Ernte'};
 return{stage:0,p:0,label:'Brache'}}
function expectedYield(S,id){const c=D.buildings[id],b=S.b[id];const wf=Math.min(1,b.workers/c.maxW[b.level-1]);return Math.round(c.yield[b.level-1]*(.4+.6*wf))}
function daysToHarvest(S,id){const c=D.buildings[id],doy=calendar(S.day).doy;if(doy>=c.harvest[0]&&doy<c.harvest[1])return 0;return doy<c.harvest[0]?c.harvest[0]-doy:DPY-doy+c.harvest[0]}
function status(S,id){const c=D.buildings[id],b=S.b[id];
 if(b.state==='none')return{code:'none',text:'Nicht gebaut'};
 if(b.state==='building')return{code:'bau',text:'Im Bau ('+Math.round((1-b.buildLeft/c.buildDays)*100)+'%)'};
 if(c.kind==='field'){const f=fieldPhase(S,id);if(b.workers<=0&&(f.stage===1||f.stage===5))return{code:'stockt',text:'Keine Arbeiter!'};if(f.failed)return{code:'ruht',text:'Aussaat verpasst'};if(b.barn>0&&free(S)<=0)return{code:'leerlauf',text:'Kontor voll'};return{code:f.stage===0?'ruht':'laeuft',text:f.label}}
 if(c.kind==='well'){if(b.workers<=0)return{code:'stockt',text:'Keine Arbeiter'};if(b.full)return{code:'ruht',text:'Wasservorrat voll'};return{code:'laeuft',text:'Läuft'}}
 if(c.kind==='brew'){if(b.workers<=0)return{code:'stockt',text:'Keine Arbeiter'};if(b.hold>0)return{code:'leerlauf',text:'Kontor voll'};if(!b.running)return{code:'stockt',text:b.missing&&b.missing.length?'Fehlt: '+b.missing.map(g=>D.goods[g].n).join(', '):'Wartet'};return{code:'laeuft',text:'Braut '+D.recipes[b.recipe].n}}
 return{code:'ruht',text:''}}

function build(S,id){const c=D.buildings[id],b=S.b[id];if(b.state!=='none')return{ok:false,msg:'Schon vorhanden'};if(S.gold<c.cost)return{ok:false,msg:'Zu wenig Taler'};
 S.gold-=c.cost;S.stats.expense+=c.cost;b.state='building';b.buildLeft=c.buildDays;log(S,c.n+': Bau begonnen ('+c.buildDays+' Tage)','info');return{ok:true}}
function upgradeCost(S,id){const c=D.buildings[id],b=S.b[id];return b.level>=3?null:c.upg[b.level]}
function upgrade(S,id){const b=S.b[id],cost=upgradeCost(S,id);if(b.state!=='ready'||cost==null)return{ok:false,msg:'Nicht möglich'};if(S.gold<cost)return{ok:false,msg:'Zu wenig Taler'};
 S.gold-=cost;S.stats.expense+=cost;b.level++;log(S,D.buildings[id].n+' auf Stufe '+b.level+' ausgebaut','good');return{ok:true}}
function setWorkers(S,id,n){const c=D.buildings[id],b=S.b[id];b.workers=Math.max(0,Math.min(c.maxW[b.level-1],n))}
function upgradeKontor(S){const l=S.kontor.level;if(l>=3)return{ok:false,msg:'Maximal'};const cost=D.kontor.upg[l];if(S.gold<cost)return{ok:false,msg:'Zu wenig Taler'};S.gold-=cost;S.stats.expense+=cost;S.kontor.level++;return{ok:true}}
const totalWorkers=S=>D.buildOrder.reduce((a,id)=>a+(S.b[id].state==='ready'?S.b[id].workers:0),0);

/* ---------- Tagesablauf ---------- */
function tick(S){S.day++;const cal=calendar(S.day),doy=cal.doy;
 // Märkte
 for(const city in S.markets){const c=D.cities[city];for(const g of D.goodOrder){const m=S.markets[city][g],t=c.tgt[g];
  const cons=(g==='duenn'||g==='stark')?t*.012*((cal.mi===11||cal.mi===0||cal.mi===1)?2:1):0;
  m.stock=Math.max(0,m.stock+(t-m.stock)*.05+(rnd(S)-.5)*.04*t-cons)}}
 // Löhne
 const w=totalWorkers(S)*S.wage;if(w>0){if(S.gold>=w){S.gold-=w;S.stats.wages+=w;S.stats.expense+=w}else{for(const id of D.buildOrder)S.b[id].workers=0;log(S,'Kein Geld für Löhne – Arbeiter entlassen!','bad')}}
 for(const id of D.buildOrder){const c=D.buildings[id],b=S.b[id];
  if(b.state==='building'){b.buildLeft--;if(b.buildLeft<=0){b.state='ready';b.buildLeft=0;log(S,c.n+' fertiggestellt! Stelle Arbeiter ein.','good')}continue}
  if(b.state!=='ready')continue;
  const lv=b.level-1,wf=Math.min(1,b.workers/c.maxW[lv]);
  if(c.kind==='field'){
   if(doy===0){b.planted=false;b.pool=0;b.poolInit=0}
   if(doy>=c.sow[0]&&doy<c.sow[1]&&b.workers>0&&!b.planted){b.planted=true;log(S,c.n+': Aussaat erledigt','info')}
   if(doy===c.harvest[0]&&b.planted){b.poolInit=Math.round(c.yield[lv]*(.4+.6*wf)*(.85+rnd(S)*.3));b.pool=b.poolInit;log(S,c.n+': Ernte beginnt (erwartet '+b.poolInit+')','info')}
   if(doy>=c.harvest[0]&&doy<c.harvest[1]&&b.pool>0&&b.workers>0){const left=c.harvest[1]-doy,take=Math.min(b.pool,Math.ceil(b.pool/left));b.pool-=take;b.barn+=take}
   if(doy===c.harvest[1]-1&&b.pool>0){log(S,c.n+': '+b.pool+' Ernte verdorben – es fehlten Arbeiter!','bad');b.pool=0}
   if(b.barn>0){const mv=addGoods(S,c.good,Math.min(b.barn,40));if(mv>0){b.barn-=mv;S.stats.harvested+=mv}}
  }else if(c.kind==='well'){
   b.full=false;if(b.workers>0){const room=c.reserve[lv]-S.kontor.goods.wasser;if(room<=0)b.full=true;else addGoods(S,'wasser',Math.min(room,Math.round(c.rate[lv]*wf)))}
  }else if(c.kind==='brew'){
   const r=D.recipes[b.recipe];
   if(!b.running&&b.hold<=0){b.missing=[];if(b.workers>0){for(const g in r.in)if(S.kontor.goods[g]<r.in[g])b.missing.push(g);
     if(!b.missing.length){for(const g in r.in)S.kontor.goods[g]-=r.in[g];b.running=true;b.prog=0}}}
   if(b.running&&b.hold<=0){b.prog+=wf*c.speed[lv]/r.days;if(b.prog>=1){b.hold=r.out;b.prog=1}}
   if(b.hold>0){const a=addGoods(S,r.good,b.hold);b.hold-=a;if(b.hold<=0){b.running=false;b.prog=0;S.stats.brewed+=r.out}}
  }}
 return cal}

HH.sim={DPY,tick,calendar,rnd,log,newGame,cap,used,free,addGoods,midPrice,buyUnit,sellUnit,quote,buy,sell,fieldPhase,expectedYield,daysToHarvest,status,build,upgrade,upgradeCost,setWorkers,upgradeKontor,totalWorkers};
if(typeof module!=='undefined')module.exports=HH;
})();
