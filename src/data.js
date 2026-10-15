/* Spieldaten (datengetrieben): Güter, Städte, Betriebe, Rezepte.
   Monatsfelder (cons/prod) sind 12 Faktoren, Index 0 = Januar. */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
const WINTER2=[2,2,1,1,1,1.05,1.05,1.05,1,1,1.2,2];   // Bier/Holz: Winter-Verbrauch verdoppelt
const WINTER_P=[1.6,1.6,1.1,.9,.9,.9,.9,.9,1,1.1,1.4,1.6];  // Brauer stocken im Winter auf, Engpass bleibt
const FLAT=[1,1,1,1,1,1,1,1,1,1,1,1];
HH.data={
 version:2,
 months:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
 seasonNames:{fruehling:'Frühling',sommer:'Sommer',herbst:'Herbst',winter:'Winter'},
 /* cons = Verbrauch der Bevölkerung je 1000 Einwohner und Tag; elas = Preisreaktion auf Knappheit */
 goods:{
  gerste:{n:'Gerste',ic:'grain',base:9,cons:.9,elas:.55,consMonths:FLAT,prodMonths:[.6,.6,.6,.6,.6,.7,1.6,2.4,2.0,.8,.6,.6]},
  hopfen:{n:'Hopfen',ic:'hop',base:22,cons:.12,elas:.7,consMonths:FLAT,prodMonths:[.5,.5,.5,.5,.5,.5,.6,1.3,3.0,2.2,.7,.5]},
  wasser:{n:'Wasser',ic:'drop',base:2,cons:4,elas:.35,consMonths:FLAT,prodMonths:FLAT},
  duenn:{n:'Dünnbier',ic:'beer',base:15,cons:.9,elas:.5,consMonths:WINTER2,prodMonths:WINTER_P},
  stark:{n:'Starkbier',ic:'beer2',base:26,cons:.25,elas:.55,consMonths:WINTER2,prodMonths:WINTER_P}
 },
 goodOrder:['gerste','hopfen','wasser','duenn','stark'],
 market:{k:.04,minF:.5,maxF:3,minPrice:.45,maxPrice:3.2,spread:.03,histLen:120},
 /* supply = Produktion der Stadt im Verhältnis zu ihrem Verbrauch (1 = ausgeglichen) */
 cities:{
  luebeck:{n:'Lübeck',style:'ostsee',look:'step',region:'Ostsee-Gotik',map:[114,124],landmark:'holstentor',ice:false,pop:24300,desc:'Haupt der Hanse. Ausgewogener Markt, stabile Preise.',
   mult:{gerste:1,hopfen:1,wasser:1,duenn:1,stark:1},supply:{gerste:1,hopfen:1,wasser:1,duenn:1,stark:1},
   tgt:{gerste:400,hopfen:120,wasser:600,duenn:180,stark:80}},
  hamburg:{n:'Hamburg',style:'nordsee',look:'timber',region:'Nordsee-Fachwerk',map:[96,131],landmark:'speicher',ice:false,pop:15000,desc:'Bierstadt mit vielen Brauern: Bier billig, Hopfen gefragt.',
   mult:{gerste:1.05,hopfen:.9,wasser:1,duenn:.8,stark:.82},supply:{gerste:.96,hopfen:1.1,wasser:1,duenn:1.08,stark:1.06},
   tgt:{gerste:300,hopfen:60,wasser:600,duenn:300,stark:140}},
  danzig:{n:'Danzig',style:'ostsee2',look:'step',region:'Ostsee-Gotik',map:[162,119],landmark:'krantor',ice:false,pop:18000,desc:'Kornkammer des Ostens: Gerste billig, Bier teuer.',
   mult:{gerste:.8,hopfen:1.2,wasser:1,duenn:1.1,stark:1.05},supply:{gerste:1.12,hopfen:.85,wasser:1,duenn:1,stark:1},
   tgt:{gerste:700,hopfen:70,wasser:600,duenn:160,stark:70}}
 },
 difficulty:{leicht:{n:'Leicht',gold:8000,wage:2},normal:{n:'Normal',gold:5000,wage:2},schwer:{n:'Schwer',gold:3000,wage:3}},
 kontor:{cap:[300,600,1200],upg:[0,600,1500]},
 /* Rezepte: Eingänge (Stufe 1/2) -> Ausgang. Zeit in Tagen bei Stufe 1 */
 recipes:{
  duenn:{n:'Dünnbier',in:{gerste:3,wasser:4},out:5,days:3,good:'duenn'},
  stark:{n:'Starkbier',in:{gerste:4,hopfen:1,wasser:4},out:4,days:4,good:'stark'}
 },
 /* kind: field (Anbau mit Wachstumszyklus) | extract (laufende Förderung) | process (Rezepte, Vorprodukte aus dem Kontor) */
 buildings:{
  gerste:{n:'Gerstenfeld',kind:'field',ic:'grain',good:'gerste',cost:800,buildDays:10,upg:[0,700,1500],maxW:[2,4,6],yield:[400,750,1200],
   sow:[0,30],grow:[30,120],ripe:[120,150],harvest:[150,180],
   desc:'Gerste ist die Grundlage jedes Bieres. Aussaat im Frühjahr, Ernte im Hochsommer.'},
  hopfen:{n:'Hopfenfeld',kind:'field',ic:'hop',good:'hopfen',cost:700,buildDays:12,upg:[0,800,1700],maxW:[2,3,5],yield:[100,200,320],
   sow:[10,60],grow:[60,150],ripe:[150,170],harvest:[170,200],
   desc:'Hopfen rankt an Stangen empor und macht das Bier haltbar und herb.'},
  brunnen:{n:'Brunnen',kind:'extract',ic:'drop',good:'wasser',cost:300,buildDays:5,upg:[0,400,900],maxW:[1,2,3],rate:[6,12,20],reserve:[60,100,160],
   desc:'Frisches Wasser für die Brauerei. Ohne Wasser kein Bier.'},
  brauerei:{n:'Brauerei',kind:'process',ic:'beer',recipes:['duenn','stark'],cost:1500,buildDays:15,upg:[0,1200,2800],maxW:[2,4,6],speed:[1,1.6,2.4],
   desc:'Braut aus Gerste, Wasser und Hopfen Dünn- und Starkbier.'}
 },
 buildOrder:['brunnen','gerste','hopfen','brauerei']
};

/* ---------- weitere Städte (Verbrauch/Soll aus Einwohnerzahl, Eigenheiten als [Preisfaktor, Angebot]) ---------- */
const D=HH.data;
D.travel={dayPerUnit:1/7,minDays:2,feePerDay:8,foreignFee:.02,iceMonths:[11,0,1],pack:{cap:[80,160,320],upg:[0,500,1400]},
 kontorOther:{cost:800,capFactor:.5,upg:[0,600,1500]},rumorCost:20,captainMax:3};
const BUF={gerste:18,hopfen:40,wasser:6,duenn:14,stark:18};
function mkCity(o){const tgt={},mult={},supply={};for(const g of D.goodOrder){const sp=(o.spec||{})[g]||[1,1];mult[g]=sp[0];supply[g]=sp[1];tgt[g]=Math.max(20,Math.round(D.goods[g].cons*o.pop/1000*BUF[g]))}
 const c=Object.assign({ice:false},o,{mult,supply,tgt});delete c.spec;return c}
Object.assign(D.cities,{
 stettin:mkCity({n:'Stettin',style:'ostsee',look:'step',region:'Ostsee-Gotik',pop:9000,map:[140,123],landmark:'burg',desc:'Oderhafen: Getreide-Umschlag, solide Preise.',spec:{gerste:[.8,1.12],hopfen:[1.05,.92]}}),
 bruegge:mkCity({n:'Brügge',style:'nordsee',look:'timber',region:'Nordsee-Fachwerk',pop:40000,map:[62,140],landmark:'belfried',desc:'Reiche Tuch- und Bierstadt. Großer Markt, hohe Preise für Rohstoffe.',spec:{gerste:[1.15,.9],hopfen:[.92,1.08],duenn:[.9,1.08],stark:[.92,1.06]}}),
 london:mkCity({n:'London',style:'nordsee',look:'timber',region:'Nordsee-Fachwerk',pop:45000,map:[48,136],landmark:'tower',desc:'Riesiger Importmarkt: Zutaten und Bier erzielen hohe Preise.',spec:{gerste:[1.2,.88],hopfen:[1.2,.88],duenn:[1.22,1],stark:[1.28,1]}}),
 bergen:mkCity({n:'Bergen',style:'nordsee',look:'wood',region:'Nordisches Holz',pop:7000,hard:true,map:[102,50],landmark:'bryggen',desc:'Stockfisch-Kontor am Fjord. Alles Getreide ist Importware – sehr teuer.',spec:{gerste:[1.35,.72],hopfen:[1.4,.75],duenn:[1.4,1],stark:[1.4,1]}}),
 visby:mkCity({n:'Visby',style:'ostsee',look:'wood',region:'Nordisches Holz',pop:4000,hard:true,map:[164,84],landmark:'ringmauer',desc:'Handelsdrehscheibe auf Gotland. Ausgeglichen, leicht überteuert.',spec:{gerste:[1.05,1],hopfen:[1.05,1],duenn:[1.05,1],stark:[1.05,1]}}),
 novgorod:mkCity({n:'Novgorod',style:'ostsee2',look:'onion',region:'Slawisch-Ost',pop:30000,map:[240,90],landmark:'kreml',ice:true,desc:'Pelz- und Wachsmarkt im Osten. Gerste billig, Hopfen kaum zu haben. Im Winter unerreichbar.',spec:{gerste:[.7,1.15],hopfen:[1.35,.8],duenn:[1.2,1],stark:[1.35,.95]}}),
 riga:mkCity({n:'Riga',style:'ostsee',look:'onion',region:'Slawisch-Ost',pop:12000,map:[188,98],landmark:'petri',ice:true,desc:'Düna-Hafen: Gerste günstig, Bier gefragt. Im Winter vereist.',spec:{gerste:[.75,1.12],hopfen:[1.15,.9],duenn:[1.1,1]}}),
 reval:mkCity({n:'Reval',style:'ostsee',look:'onion',region:'Slawisch-Ost',pop:8000,map:[204,86],landmark:'olaf',ice:true,desc:'Kalkstein-Stadt am Finnischen Meerbusen. Im Winter vereist.',spec:{gerste:[.9,1.05],hopfen:[1.25,.85],duenn:[1.2,1],stark:[1.25,1]}}),
 narva:mkCity({n:'Narva',style:'ostsee2',look:'onion',region:'Slawisch-Ost',pop:3000,hard:true,map:[222,82],landmark:'festung',ice:true,desc:'Kleiner Grenzhafen am Fluss. Teures Bier. Im Winter vereist.',spec:{gerste:[.85,1.05],hopfen:[1.3,.82],duenn:[1.25,1]}})
});
D.regions=['Ostsee-Gotik','Nordsee-Fachwerk','Nordisches Holz','Slawisch-Ost'];
D.cityOrder=['luebeck','danzig','stettin','hamburg','bruegge','london','bergen','visby','novgorod','riga','reval','narva'];
D.edicts=[{n:'Fremdenzoll',d:'Fremde Händler zahlen 3 % Aufschlag beim Kauf und Abschlag beim Verkauf. In deiner Heimatstadt entfällt er.'},
 {n:'Hafenfrieden',d:'Wer im Hafen Streit anfängt, zahlt dem Rat Buße. Der Handel bleibt geschützt.'},
 {n:'Eisgang',d:'Riga, Reval, Narva und Novgorod frieren von Dezember bis Februar zu – keine Reisen dorthin.'},
 {n:'Maß und Gewicht',d:'Alle Fässer und Säcke müssen das Ratssiegel tragen. Ein Fass fasst überall gleich viel.'}];
D.captainNames=['Hinrich','Marten','Claas','Jürgen','Tönnies','Detlev','Gerd','Volkmar','Ebbo','Henneke','Sivert','Arnd'];
D.captainSur=['Wulf','Brandt','Kruse','Holst','Sörensen','Lange','Meyer','Voss','Tramm','Rode','Stolle','Berg'];
D.ships=[{n:'Kogge',cap:150,speed:5,cost:2500},{n:'Holk',cap:300,speed:4,cost:6000},{n:'Schnigge',cap:100,speed:7,cost:3500}];
})();
