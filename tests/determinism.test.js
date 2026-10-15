const {test,eq,ok,load,hash,bot}=require('./lib');
console.log('Determinismus & Speichern');
test('gleicher Seed ⇒ identischer Spielverlauf (3 Jahre)',()=>{const run=()=>{const HH=load();const S=HH.sim.newGame({seed:123});bot(HH,S,1080);return hash(S)};eq(run(),run())});
test('anderer Seed ⇒ anderer Verlauf',()=>{const run=s=>{const HH=load();const S=HH.sim.newGame({seed:s});bot(HH,S,400);return hash(S)};ok(run(1)!==run(2))});
test('Speichern/Laden mitten im Spiel ändert nichts',()=>{const HH=load();const A=HH.sim.newGame({seed:5});bot(HH,A,500);const B=JSON.parse(JSON.stringify(A));bot(HH,A,500);bot(HH,B,500);eq(hash(A),hash(B))});
test('Migration alter Spielstände (v1) ergänzt Felder',()=>{const HH=load();const S=HH.sim.newGame({seed:1});delete S.hist;delete S.mods;S.v=1;delete S.kontor.cap;const M=HH.sim.migrate(S);ok(M.hist&&M.mods&&M.kontor.cap>0);HH.sim.tick(M)});
module.exports=1;
