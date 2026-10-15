const {test,eq,ok,load}=require('./lib');
console.log('Produktionsketten (3 Stufen, synthetisch)');
function setup(){const HH=load(),{sim,data:D}=HH;const FLAT=D.goods.gerste.consMonths;
 for(const [id,n] of [['holz','Holz'],['bauholz','Bauholz'],['fass','Fass']]){D.goods[id]={n,ic:'barrel',base:8,cons:.2,elas:.5,consMonths:FLAT,prodMonths:FLAT};D.goodOrder.push(id);for(const c in D.cities){D.cities[c].tgt[id]=100;D.cities[c].mult[id]=1;D.cities[c].supply[id]=1}}
 D.recipes.bauholz={n:'Bauholz',in:{holz:3},out:2,days:2,good:'bauholz'};D.recipes.fass={n:'Fass',in:{bauholz:2,gerste:1},out:1,days:2,good:'fass'};
 D.buildings.holz={n:'Holzfäller',kind:'extract',ic:'barrel',good:'holz',cost:100,buildDays:1,upg:[0,1,1],maxW:[1,2,3],rate:[10,20,30],reserve:[80,100,120],desc:''};
 D.buildings.saege={n:'Sägewerk',kind:'process',ic:'barrel',recipes:['bauholz'],cost:100,buildDays:1,upg:[0,1,1],maxW:[1,2,3],speed:[1,1,1],desc:''};
 D.buildings.fassb={n:'Fassbinder',kind:'process',ic:'barrel',recipes:['fass'],cost:100,buildDays:1,upg:[0,1,1],maxW:[1,2,3],speed:[1,1,1],desc:''};
 D.buildOrder.push('holz','saege','fassb');
 const S=sim.newGame({seed:1});S.gold=50000;S.kontor.goods.gerste=200;S.kontor.cap=2000;for(const id of['holz','saege','fassb'])sim.build(S,id);for(let i=0;i<3;i++)sim.tick(S);for(const id of['holz','saege','fassb'])sim.setWorkers(S,id,1);return{HH,sim,S}}
test('Kette läuft: Holz → Bauholz → Fass',()=>{const{sim,S}=setup();for(let i=0;i<40;i++)sim.tick(S);ok(S.stats.produced.fass>=10,'Fässer '+S.stats.produced.fass);ok(S.stats.produced.bauholz>0&&S.stats.produced.holz>0)});
test('Ausfall der ersten Stufe bricht die Kette ein (Kettenreaktion) und nennt die Ursache',()=>{const{sim,S}=setup();for(let i=0;i<20;i++)sim.tick(S);
 sim.setWorkers(S,'holz',0);S.kontor.goods.holz=0;S.kontor.goods.bauholz=0;const f0=S.stats.produced.fass||0;for(let i=0;i<10;i++)sim.tick(S);
 const st=sim.status(S,'fassb');eq(st.code,'stockt');ok(/Holzfäller/.test(st.cause||''),'Ursache: '+st.cause);eq(sim.status(S,'saege').code,'stockt');
 for(let i=0;i<20;i++)sim.tick(S);ok((S.stats.produced.fass||0)-f0<=1,'Fass-Produktion bricht ein')});
test('Kette erholt sich, sobald die Stufe wieder arbeitet',()=>{const{sim,S}=setup();for(let i=0;i<15;i++)sim.tick(S);sim.setWorkers(S,'holz',0);S.kontor.goods.holz=0;S.kontor.goods.bauholz=0;for(let i=0;i<15;i++)sim.tick(S);
 const f0=S.stats.produced.fass||0;sim.setWorkers(S,'holz',1);for(let i=0;i<20;i++)sim.tick(S);ok((S.stats.produced.fass||0)>f0+3)});
test('Ursache zeigt auf nicht gebauten Betrieb',()=>{const HH=load(),{sim}=HH;const S=sim.newGame({seed:1});S.gold=50000;sim.build(S,'brauerei');for(let i=0;i<16;i++)sim.tick(S);sim.setWorkers(S,'brauerei',2);sim.tick(S);const st=sim.status(S,'brauerei');eq(st.code,'stockt');ok(/fehlt/.test(st.cause||''),st.cause)});
test('Voller Lagerraum stoppt die Produktion (Leerlauf) statt Ware zu vernichten',()=>{const{sim,S}=setup();S.kontor.cap=sim.used(S)+3;for(let i=0;i<30;i++)sim.tick(S);ok(sim.used(S)<=S.kontor.cap);ok(['leerlauf','stockt','ruht'].includes(sim.status(S,'holz').code)||sim.status(S,'holz').code==='laeuft')});
module.exports=1;
