// Minimaler Test-Rahmen (keine Abhängigkeiten) + frisches Laden der Spielmodule
let pass=0,fail=0;const failures=[];
function test(name,fn){try{fn();pass++;console.log('  ✔',name)}catch(e){fail++;failures.push(name);console.log('  ✘',name,'\n     ',e.message)}}
function eq(a,b,m){if(a!==b)throw new Error((m||'')+' erwartet '+b+' erhalten '+a)}
function ok(c,m){if(!c)throw new Error(m||'Bedingung verletzt')}
function load(){for(const k of Object.keys(require.cache))if(k.includes('/src/'))delete require.cache[k];globalThis.HH={};require('../src/data.js');require('../src/sim.js');return globalThis.HH}
function hash(S){const j=JSON.stringify(S,(k,v)=>k==='toasts'?undefined:v);let h=2166136261;for(let i=0;i<j.length;i++){h^=j.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
/* einfacher Bot: baut alles, hält Arbeiter nur wenn nötig, kauft Zutaten, verkauft Bier */
function bot(HH,S,days,o){o=o||{};const {sim,data:D}=HH;const city=S.city;
 for(let d=0;d<days;d++){const doy=sim.calendar(S.day).doy;
  for(const id of D.buildOrder){const b=S.b[id],c=D.buildings[id];if(b.state==='none'&&S.gold>c.cost+(o.reserve===undefined?1500:o.reserve))sim.build(S,id);if(b.state!=='ready')continue;
   let want=c.maxW[b.level-1];if(c.kind==='field'){const act=(doy>=c.sow[0]&&doy<c.sow[1])||(doy>=c.harvest[0]&&doy<c.harvest[1]);want=act?want:0}if(c.kind==='extract')want=1;sim.setWorkers(S,id,want)}
  const B=S.b.brauerei;if(B.state==='ready'){const r=D.recipes[B.recipe];for(const g in r.in){const need=r.in[g]*2-S.kontor.goods[g];if(need>0)sim.buy(S,g,need)}}
  for(const g of['duenn','stark'])if(S.kontor.goods[g]>10)sim.sell(S,g,S.kontor.goods[g]);
  if(d%90===0&&B.state==='ready'&&!B.running)sim.setRecipe(S,'brauerei',B.recipe==='duenn'?'stark':'duenn');
  if(o.upgrade&&d%30===0&&sim.upgradeCost(S,'brauerei')!=null&&S.gold>6000)sim.upgrade(S,'brauerei');
  sim.tick(S);S.toasts.length=0}}
function done(){console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);return fail}
module.exports={test,eq,ok,load,hash,bot,done};
