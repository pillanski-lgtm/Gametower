/* Spieldaten (datengetrieben): Güter, Städte, Betriebe, Rezepte */
(function(){
const HH=globalThis.HH=globalThis.HH||{};
HH.data={
 version:1,
 months:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
 seasonNames:{fruehling:'Frühling',sommer:'Sommer',herbst:'Herbst',winter:'Winter'},
 goods:{
  gerste:{n:'Gerste',ic:'grain',base:9},
  hopfen:{n:'Hopfen',ic:'hop',base:22},
  wasser:{n:'Wasser',ic:'drop',base:2},
  duenn:{n:'Dünnbier',ic:'beer',base:20},
  stark:{n:'Starkbier',ic:'beer2',base:34}
 },
 goodOrder:['gerste','hopfen','wasser','duenn','stark'],
 cities:{
  luebeck:{n:'Lübeck',style:'ostsee',pop:24300,desc:'Haupt der Hanse. Ausgewogener Markt, stabile Preise.',
   mult:{gerste:1,hopfen:1,wasser:1,duenn:1,stark:1},tgt:{gerste:400,hopfen:120,wasser:600,duenn:180,stark:80}},
  hamburg:{n:'Hamburg',style:'nordsee',pop:15000,desc:'Bierstadt mit vielen Brauern: Bier billig, Hopfen gefragt.',
   mult:{gerste:1.1,hopfen:1.25,wasser:1,duenn:.85,stark:.9},tgt:{gerste:300,hopfen:60,wasser:600,duenn:300,stark:140}},
  danzig:{n:'Danzig',style:'ostsee2',pop:18000,desc:'Kornkammer des Ostens: Gerste billig, Bier teuer.',
   mult:{gerste:.78,hopfen:1.2,wasser:1,duenn:1.2,stark:1.15},tgt:{gerste:700,hopfen:70,wasser:600,duenn:120,stark:60}}
 },
 difficulty:{leicht:{n:'Leicht',gold:8000,wage:2},normal:{n:'Normal',gold:5000,wage:2},schwer:{n:'Schwer',gold:3000,wage:3}},
 kontor:{cap:[300,600,1200],upg:[0,600,1500]},
 recipes:{
  duenn:{n:'Dünnbier',in:{gerste:3,wasser:4},out:6,days:3,good:'duenn'},
  stark:{n:'Starkbier',in:{gerste:4,hopfen:1,wasser:4},out:5,days:4,good:'stark'}
 },
 buildings:{
  gerste:{n:'Gerstenfeld',kind:'field',ic:'grain',good:'gerste',cost:800,buildDays:10,upg:[0,700,1500],maxW:[2,4,6],yield:[400,750,1200],
   sow:[0,30],grow:[30,120],ripe:[120,150],harvest:[150,180],
   desc:'Gerste ist die Grundlage jedes Bieres. Aussaat im Frühjahr, Ernte im Hochsommer.'},
  hopfen:{n:'Hopfenfeld',kind:'field',ic:'hop',good:'hopfen',cost:700,buildDays:12,upg:[0,800,1700],maxW:[2,3,5],yield:[100,200,320],
   sow:[10,60],grow:[60,150],ripe:[150,170],harvest:[170,200],
   desc:'Hopfen rankt an Stangen empor und macht das Bier haltbar und herb.'},
  brunnen:{n:'Brunnen',kind:'well',ic:'drop',good:'wasser',cost:300,buildDays:5,upg:[0,400,900],maxW:[1,2,3],rate:[6,12,20],reserve:[60,100,160],
   desc:'Frisches Wasser für die Brauerei. Ohne Wasser kein Bier.'},
  brauerei:{n:'Brauerei',kind:'brew',ic:'beer',cost:1500,buildDays:15,upg:[0,1200,2800],maxW:[2,4,6],speed:[1,1.6,2.4],
   desc:'Braut aus Gerste, Wasser und Hopfen Dünn- und Starkbier.'}
 },
 buildOrder:['brunnen','gerste','hopfen','brauerei']
};
})();
