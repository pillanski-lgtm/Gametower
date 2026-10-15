const {test,eq,ok,load,bot}=require('./lib');
console.log('Wirtschaft');
const HH0=load();
for(const city of Object.keys(HH0.data.cities)){
 test(`${city}: Leerlauf-Welt 20 Jahre – kein Gut stirbt aus, keine Preisexplosion`,()=>{const HH=load(),{sim,data:D}=HH;const S=sim.newGame({city,seed:9});const lo={},hi={};
  for(let d=0;d<7200;d++){sim.tick(S);for(const g of D.goodOrder){const m=S.markets[city][g],t=D.cities[city].tgt[g];const r=m.stock/t;lo[g]=Math.min(lo[g]===undefined?9:lo[g],r);hi[g]=Math.max(hi[g]||0,r);
    ok(Number.isFinite(m.stock),'NaN');const p=sim.midPrice(S,city,g),b=D.goods[g].base*D.cities[city].mult[g];ok(p>=b*D.market.minPrice-1e-6&&p<=b*D.market.maxPrice+1e-6,`Preis ${g} ${p}`)}}
  for(const g of D.goodOrder){ok(lo[g]>0.03,`${g} fast leer (min ${(lo[g]*100).toFixed(0)}% vom Soll)`);ok(hi[g]<4,`${g} Überangebot (max ${(hi[g]*100).toFixed(0)}%)`)}
  console.log('      Bestand min/max (% vom Soll):',D.goodOrder.map(g=>`${g} ${(lo[g]*100)|0}/${(hi[g]*100)|0}`).join(' · '))});
}
test('Winter: Bier teurer als im Sommer (Verbrauch ×2)',()=>{const HH=load(),{sim}=HH;const S=sim.newGame({seed:3});let w=0,wn=0,s=0,sn=0;
 for(let d=0;d<3600;d++){sim.tick(S);const mi=sim.calendar(S.day).mi,p=sim.midPrice(S,'luebeck','duenn');if(mi===0||mi===1||mi===11){w+=p;wn++}if(mi>=5&&mi<=7){s+=p;sn++}}
 ok(w/wn>s/sn*1.1,`Winter ${(w/wn).toFixed(1)} vs Sommer ${(s/sn).toFixed(1)}`)});
test('Erntezeit drückt den Gerstenpreis (Angebot ↑)',()=>{const HH=load(),{sim}=HH;const S=sim.newGame({seed:3});let a=0,an=0,b=0,bn=0;
 for(let d=0;d<3600;d++){sim.tick(S);const mi=sim.calendar(S.day).mi,p=sim.midPrice(S,'luebeck','gerste');if(mi===7||mi===8){a+=p;an++}if(mi>=1&&mi<=4){b+=p;bn++}}
 ok(a/an<b/bn,`Ernte ${(a/an).toFixed(1)} vs Frühjahr ${(b/bn).toFixed(1)}`)});
test('Kein Arbitrage-Gewinn: sofort kaufen und verkaufen kostet Geld',()=>{const HH=load(),{sim,data:D}=HH;const S=sim.newGame({seed:2});S.gold=100000;
 for(const g of D.goodOrder){const g0=S.gold;const r=sim.buy(S,g,50);ok(r.ok,g);sim.sell(S,g,50);ok(S.gold<g0,`${g}: ${S.gold-g0}`)}});
test('Marktbreite: 100 Bier verkaufen drückt den Preis, er erholt sich in 60 Tagen',()=>{const HH=load(),{sim}=HH;const S=sim.newGame({seed:2});for(let i=0;i<30;i++)sim.tick(S);
 const p0=sim.midPrice(S,'luebeck','duenn');S.kontor.goods.duenn=100;S.kontor.cap=1200;sim.sell(S,'duenn',100);const p1=sim.midPrice(S,'luebeck','duenn');ok(p1<p0*.9,`Preis ${p0.toFixed(1)}→${p1.toFixed(1)}`);
 for(let i=0;i<60;i++)sim.tick(S);const p2=sim.midPrice(S,'luebeck','duenn');ok(p2>p1&&p2>p0*.8,`erholt ${p2.toFixed(1)}`)});
test('Ereignis-Modifikator: Preis ×2 für 20 Tage, danach normal',()=>{const HH=load(),{sim}=HH;const S=sim.newGame({seed:2});const p0=sim.midPrice(S,'luebeck','gerste');
 sim.addMod(S,{kind:'price',good:'gerste',mult:2,until:S.day+20,label:'Dürre'});const p1=sim.midPrice(S,'luebeck','gerste');ok(Math.abs(p1/p0-2)<.01);for(let i=0;i<21;i++)sim.tick(S);ok(S.mods.length===0)});
test('Ernte-Modifikator (Dürre) senkt den Ertrag',()=>{const HH=load(),{sim,data:D}=HH;const mk=m=>{const S=sim.newGame({seed:4});S.gold=50000;sim.build(S,'gerste');for(let i=0;i<12;i++)sim.tick(S);sim.setWorkers(S,'gerste',9);if(m)sim.addMod(S,{kind:'yield',good:'gerste',mult:.5,until:999});
  for(let i=0;i<200;i++){S.kontor.goods.gerste=0;sim.tick(S)}return S.stats.harvested};ok(mk(true)<mk(false)*.7)});
module.exports=1;
