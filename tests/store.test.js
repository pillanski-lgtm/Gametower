const {test,eq,ok,load}=require('./lib');const HH=load();const sim=HH.sim;
console.log('Lager');
test('add begrenzt auf Kapazität',()=>{const s=sim.mkStore(10);eq(sim.storeAdd(s,'gerste',7),7);eq(sim.storeAdd(s,'wasser',7),3);eq(sim.storeFree(s),0)});
test('take begrenzt auf Bestand',()=>{const s=sim.mkStore(10);sim.storeAdd(s,'gerste',4);eq(sim.storeTake(s,'gerste',9),4);eq(s.goods.gerste,0)});
test('move zwischen Lagern (Kontor ↔ Schiff)',()=>{const a=sim.mkStore(100),b=sim.mkStore(5);sim.storeAdd(a,'duenn',50);eq(sim.storeMove(a,b,'duenn',30),5);eq(a.goods.duenn,45);eq(b.goods.duenn,5)});
test('keine negativen/gebrochenen Mengen',()=>{const s=sim.mkStore(10);eq(sim.storeAdd(s,'gerste',-3),0);eq(sim.storeAdd(s,'gerste',2.9),2)});
module.exports=1;
