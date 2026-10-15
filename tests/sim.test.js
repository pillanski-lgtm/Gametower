// node tests/sim.test.js  – lässt einen Bot 10 Spieljahre spielen
globalThis.HH={};require('../src/data.js');require('../src/sim.js');
const {sim,data:D}=HH;let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL:',m)}};
function bot(city,diff){const S=sim.newGame({city,diff,seed:42});
 for(const id of ['brunnen','gerste','brauerei'])sim.build(S,id);
 for(let d=0;d<3600;d++){
  const doy=sim.calendar(S.day).doy;
  for(const id of D.buildOrder){const b=S.b[id],c=D.buildings[id];if(b.state==='none'&&S.gold>c.cost+1500)sim.build(S,id);if(b.state!=='ready')continue;
   let want=c.maxW[b.level-1];if(c.kind==='field'){const act=(doy>=c.sow[0]&&doy<c.sow[1])||(doy>=c.harvest[0]&&doy<c.harvest[1]);want=act?want:0}if(c.kind==='well')want=1;
   sim.setWorkers(S,id,want)}
  const B=S.b.brauerei;if(B.state==='ready'){const r=D.recipes[B.recipe];for(const g in r.in){const need=r.in[g]*2-S.kontor.goods[g];if(need>0)sim.buy(S,g,need)}}
  for(const g of ['duenn','stark'])if(S.kontor.goods[g]>10)sim.sell(S,g,S.kontor.goods[g]);
  if(d%90===0&&S.b.brauerei.state==='ready')S.b.brauerei.recipe=S.b.brauerei.recipe==='duenn'?'stark':'duenn';
  if(d%30===0&&sim.upgradeCost(S,'brauerei')!=null&&S.gold>6000)sim.upgrade(S,'brauerei');
  sim.tick(S);S.toasts.length=0;
  for(const g of D.goodOrder){const m=S.markets[city][g];ok(Number.isFinite(m.stock)&&m.stock>=0,'Lager NaN '+g);const p=sim.midPrice(S,city,g);ok(p>=D.goods[g].base*D.cities[city].mult[g]*.4&&p<=D.goods[g].base*D.cities[city].mult[g]*3.6,'Preis außer Bereich '+g+' '+p)}
  ok(Number.isFinite(S.gold),'Gold NaN');ok(sim.used(S)<=sim.cap(S),'Kontor überfüllt');
 }
 return S}
for(const c of Object.keys(D.cities)){const S=bot(c,'normal');console.log(c,'Gold nach 10 Jahren:',Math.round(S.gold),'gebraut:',S.stats.brewed,'geerntet:',S.stats.harvested);ok(S.stats.brewed>0,c+': nichts gebraut');ok(S.stats.harvested>0,c+': nichts geerntet')}
// Kalender
const c0=sim.calendar(0);ok(c0.mi===2&&c0.y===1402&&c0.season==='fruehling','Kalender Start');const c1=sim.calendar(300);ok(c1.y===1403&&c1.season==='winter','Kalender 300');
// Ernte ohne Arbeiter verdirbt, Bau ohne Geld scheitert
const S=sim.newGame({seed:1});S.gold=10;ok(!sim.build(S,'brauerei').ok,'Bau ohne Geld');
console.log(fails?fails+' Fehler':'Alle Tests bestanden');process.exit(fails?1:0);
