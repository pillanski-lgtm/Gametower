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
  duenn:{n:'Dünnbier',ic:'beer',base:15,cons:.9,elas:.6,consMonths:WINTER2,prodMonths:WINTER_P},
  stark:{n:'Starkbier',ic:'beer2',base:26,cons:.25,elas:.7,consMonths:WINTER2,prodMonths:WINTER_P}
 },
 goodOrder:['gerste','hopfen','wasser','duenn','stark'],
 market:{k:.04,minF:.5,maxF:3,minPrice:.45,maxPrice:3.2,spread:.04,histLen:120},
 /* supply = Produktion der Stadt im Verhältnis zu ihrem Verbrauch (1 = ausgeglichen) */
 cities:{
  luebeck:{n:'Lübeck',style:'ostsee',pop:24300,desc:'Haupt der Hanse. Ausgewogener Markt, stabile Preise.',
   mult:{gerste:1,hopfen:1,wasser:1,duenn:1,stark:1},supply:{gerste:1,hopfen:1,wasser:1,duenn:1,stark:1},
   tgt:{gerste:400,hopfen:120,wasser:600,duenn:180,stark:80}},
  hamburg:{n:'Hamburg',style:'nordsee',pop:15000,desc:'Bierstadt mit vielen Brauern: Bier billig, Hopfen gefragt.',
   mult:{gerste:1.05,hopfen:1.2,wasser:1,duenn:.95,stark:.95},supply:{gerste:.96,hopfen:.85,wasser:1,duenn:1.06,stark:1.05},
   tgt:{gerste:300,hopfen:60,wasser:600,duenn:300,stark:140}},
  danzig:{n:'Danzig',style:'ostsee2',pop:18000,desc:'Kornkammer des Ostens: Gerste billig, Bier teuer.',
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
})();
