const {test,eq,ok,load,bot}=require('./lib');
console.log('Bot-Balancing (10 Jahre je Stadt)');
const HH0=load();
for(const city of HH0.data.cityOrder.filter(c=>!HH0.data.cities[c].hard)){
 test(`${city}: Bot wächst, aber nicht explosiv`,()=>{const HH=load(),{sim,data:D}=HH;const S=sim.newGame({city,seed:42});let y1=0;
  for(let d=0;d<3600;d++){bot(HH,S,1);if(d===719)y1=S.gold;ok(Number.isFinite(S.gold)&&sim.used(S)<=sim.cap(S))}
  console.log(`      Jahr 2: ${Math.round(y1)} T · Jahr 10: ${Math.round(S.gold)} T · gebraut ${S.stats.brewed} · geerntet ${S.stats.harvested}`);
  ok(S.stats.brewed>0&&S.stats.harvested>0,'nichts produziert');ok(S.gold>5000,'Bot verliert Geld');ok(S.gold<D.difficulty.normal.gold+90000,'zu großzügig: '+Math.round(S.gold))})}
module.exports=1;
