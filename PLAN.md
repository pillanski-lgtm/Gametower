# Hanse-Händler & Seefahrer – Entwicklungsplan

Ziel: komplettes Spiel als HTML5 (Canvas, Pixel-Art) und als Android-APK. Grundlage ist der UI-Entwurf `index.html` (344×192-Pixelbühne, 4× skaliert, HUD mit Holz/Pergament).

## Grundregeln (gelten für alle Phasen)
- **Datengetrieben:** Güter, Betriebe, Städte, Schiffe, Ereignisse liegen als JSON. Neue Inhalte = neue Datei, kein neuer Code.
- **Eine Pixel-Pipeline:** feste Palette (max. 32 Farben), Szenen 344×192, Sprites als Spritesheets, ganzzahlige Skalierung (4×/3×/2×).
- **Touch zuerst:** alle Tasten ≥ 48 px, keine Hover-Funktionen, Wischen/Zoomen auf der Karte.
- **Jede Phase endet spielbar** (Demo-Build auf dem Handy) und mit einer Liste „Fertig, wenn …".

## Betriebe – vollständige Liste (18) mit je eigener Seite
Jeder Betrieb bekommt: eigene Szene (344×192), Produktions-Panel, 4 Zustände mit Animation, Stufe 1–3 (sichtbarer Ausbau).

| Stufe | Betrieb | Produziert | Benötigt | Signatur-Animation |
|---|---|---|---|---|
| Roh | Weizenfeld | Weizen | – | Wachstumsstufen Saat → Halm → Reife, Mähen, Garbenwagen, Wind im Feld |
| Roh | Gerstenfeld | Gerste | – | wie Weizenfeld, andere Ähre/Farbe, Dreschflegel |
| Roh | Hopfenfeld | Hopfen | – | Hopfenstangen, Ranken wachsen sichtbar nach oben, Pflücker, Dolden-Körbe |
| Roh | Brunnen/Wasserwerk | Wasser | – | Eimer hoch/runter, Kurbel, Wasserträger, Fass füllen |
| Roh | Holzfäller | Holz | – | Axthieb, fallender Baum, Stämme rollen |
| Roh | Hanffeld | Hanf | – | Ernte, Bündel trocknen |
| Roh | Schäferei | Wolle | – | Scherer, Schafe laufen, Wollballen |
| Roh | Eisenmine | Eisenerz | Holz | Hacke, Lorenwagen, Funken |
| Roh | Saline | Salz | Holz | Siedepfanne dampft, Salzkruste, Rechen |
| Roh | Viehhof | Vieh | Weizen | Fütterung, Weidewechsel |
| Roh | Fischerei | Fisch | – | Boot rudert, Netz einholen, Möwen |
| Zwischen | Teerofen/Sägewerk | Pech, Bauholz | Holz | Säge, Meiler-Rauch, Teertropfen |
| Zwischen | Seilerei | Seile/Takelage | Hanf | Seilerbahn, rückwärts laufender Arbeiter |
| Zwischen | Schmiede | Eisenwerkzeug | Eisenerz, Holz | Hammerschlag, Funken, Glut, Blasebalg |
| End | Brauerei | Dünnbier (Gerste + Wasser), Starkbier (Gerste + Hopfen + Wasser), Weißbier (Weizen + Hopfen + Wasser) | s. links | Kupferkessel blubbert, Maischen, Hopfen-Zugabe, Fässer rollen (**im Entwurf vorhanden**) |
| End | Tuchmacherei | Tuch/Kleidung | Wolle, Werkzeug | Webstuhl, Spinnrad, Stoffbahn |
| End | Pökelei Fisch | Pökelfisch | Fisch, Salz | Salzen, Fässer stapeln |
| End | Räucherei/Pökelei Fleisch | Pökelfleisch | Vieh, Salz | Rauch, Schlachter, Haken mit Schinken |

**Zustände je Betrieb:** `Läuft` (volle Animation, Tempo = Effizienz) · `Stockt` (fehlendes Vorprodukt: Arbeiter stehen, rotes Symbol, Anzeige *was* fehlt) · `Leerlauf` (kein Lager für Output) · `Ausbau` (Gerüst, Hämmern).
**Felder (Weizen, Gerste, Hopfen, Hanf) haben zusätzlich einen Wachstumszyklus** mit eigener Seite und sichtbaren Stufen:
`Brache (Winter) → Aussaat (Frühling) → Wachstum (Sommer, 3 Bilder) → Reife → Ernte (Herbst) → Brache`.
- Die Stufe hängt vom Spieldatum ab, die Erntemenge von Pflege (Arbeiter), Wetter (Dürre ⇒ Ernte bricht ein, Rekordernte ⇒ Bonus) und Ausbau (Bewässerung, Düngung, Lager/Scheune).
- Hopfen wächst an Stangen: Ranken wachsen in 6 Bildern bis zur Stangenspitze, danach Pflückzeit.
- Panel zeigt Fortschrittsbalken des Zyklus, erwartete Erntemenge und Tage bis zur Ernte.
- Ernte lagert in der Scheune des Betriebs, Fuhrwerke bringen sie zu Kontor/Markt/Brauerei (sichtbar als Transport-Animation).

**Jahreszeiten:** Palettentausch pro Betrieb (Frühling grün, Sommer hell, Herbst orange, Winter Schnee) statt 4× Grafiken.
**Technik:** Animation = Ebenen: statischer Hintergrund + animierte Overlays (Rauch, Arbeiter, Räder, Feuer) mit 4–8 Frames, 8–12 FPS. Eine `FactoryScene`-Klasse liest Betriebs-JSON, so wird jeder weitere Betrieb nur noch Daten + Spritesheet.

---

## Phase 0 – Fundament (≈ 1–2 Wochen) — **✔ Version 0.1 umgesetzt**
- Technik festlegen: Vanilla-JS/TypeScript + Canvas, Bundler (Vite), Capacitor für APK, IndexedDB/Local Storage für Speicherstände.
- Projektstruktur: `data/` (JSON), `art/` (Spritesheets), `src/` (core, ui, scenes), `tools/` (Sprite-Packer).
- Pixel-Schrift lokal einbinden (kein Google-Link), Integer-Skalierung, Safe-Area, Landscape fest.
- Vorhandenes `index.html` in Komponenten zerlegen (HUD, Panel, Szenen-Manager).
- **Fertig, wenn:** leere Szene läuft als APK auf einem Android-Gerät mit 60 FPS und HUD.

## Phase 1 – Art-Pipeline & UI-Kit (≈ 2 Wochen) — **✔ Grundlage in v0.1** (Pixel-Primitive, Icons, Palettentausch, UI-Kit; offen: Sprite-Packer, lokale Schrift, Capacitor-APK)
- Palette einfrieren, Sprite-Konventionen (Raster, Outline, Lichtrichtung oben links), Animations-Format (Spritesheet + JSON).
- UI-Kit: Panel, Slot, Regler, Tasten (normal/gedrückt/gesperrt), Tooltips, Dialoge, Zahlenstepper, Listen mit Wischen.
- Tools: Sprite-Vorschau, Paletten-Check, Schneepalette-Generator.
- **Fertig, wenn:** UI-Galerie-Seite zeigt alle Elemente; ein Beispiel-Sprite animiert korrekt.

## Phase 2 – Simulationskern (≈ 3 Wochen) — **✔ umgesetzt** (siehe README „Simulation“, `npm test`)
- Spielzeit (Tage, Jahreszeiten, Geschwindigkeit ❚❚/▶/▶▶), Speichern/Laden.
- Anbau-Modell für Felder (Aussaat-/Erntefenster je Frucht, Ertrag aus Pflege × Wetter × Ausbau).
- Güter & Lager je Stadt/Kontor/Schiff, Preismodell (Angebot, Nachfrage, Saison, Ereignisse; Preisgrenzen ±), Bevölkerungsverbrauch (Winter ×2 Holz/Bier).
- Produktionsmodell mit 3 Stufen: Vorprodukt fehlt ⇒ Output bricht ein, Kettenreaktion sichtbar.
- Tests: Simulation ohne Grafik 10 Spieljahre durchlaufen lassen, Preise bleiben stabil (kein Absturz auf 0/∞).
- **Fertig, wenn:** Konsolen-Simulation ist reproduzierbar (Seed) und balanciert genug, dass kein Gut dauerhaft ausstirbt.

## Phase 3 – Städte & Handel (≈ 4 Wochen)
- 12 Städte mit je eigener Stadtansicht (Pixel) und Regionalstil: Ostsee-Gotik (Lübeck, Danzig, Stettin), Nordsee-Fachwerk (Hamburg, Brügge, London), Nordisch/Holz (Bergen, Visby), Slawisch/Ost (Novgorod, Riga, Reval).
- 6 Hotspots je Stadt als Seiten: Marktplatz, Kontor, Werft, Schenke, Rathaus, Betriebe-Bauplatz.
- Handelsfenster (Kaufen/Verkaufen mit Mengenregler, Preisübersicht, Gewinnanzeige), Kontor (Lager, Verwalter), Schenke (Kapitäne/Matrosen anheuern, Gerüchte), Rathaus (Vorräte, Erlasse).
- **Fertig, wenn:** Spieler kann in 2 Städten handeln, Ware kaufen, einlagern, mit Gewinn verkaufen.

## Phase 4 – Betriebe — **Vertical Slice „Bier“ in v0.1 spielbar** (Brunnen, Gersten-, Hopfenfeld, Brauerei, Kontor, Markt) (≈ 8–10 Wochen, 3 Teilphasen)
Pro Betrieb: Szene + 4 Zustände + Stufen 1–3 + Panel (Arbeiter, Effizienz, Lager, Aufwerten) + Sounds. Reihenfolge nach Produktionskette:
- **4a Rohstoffe (11 Betriebe):** Weizenfeld, Gerstenfeld, Hopfenfeld, Brunnen, Holzfäller, Hanffeld, Schäferei, Eisenmine, Saline, Viehhof, Fischerei. Zuerst die Brauerei-Zutaten (Gerste, Hopfen, Brunnen, Weizen), damit die Brauerei als erste komplette Kette spielbar ist.
- **4b Zwischengüter (3 Betriebe):** Teerofen/Sägewerk, Seilerei, Schmiede.
- **4c Endgüter (4 Betriebe):** Brauerei (Basis steht, Rezepte Dünn-/Stark-/Weißbier), Tuchmacherei, Pökelei Fisch, Pökelei Fleisch.
- Bau-Mechanik: Bauplatz wählen, Kosten, Bauzeit mit Baustellen-Animation, Arbeiter anstellen. Felder brauchen Flächen (Hof außerhalb der Stadt) mit Größenwahl.
- **Vertical Slice „Bier“:** Gerstenfeld + Hopfenfeld + Brunnen + Brauerei + Kontor + Markt, komplett mit Animation. Danach erst die übrigen Ketten.
- Betriebs-Übersicht (Liste aller Betriebe mit Ampel: läuft / stockt / Leerlauf).
- **Fertig, wenn je Teilphase:** jeder Betrieb hat Seite + alle 4 Zustände + Winter-Variante, Felder zusätzlich alle Wachstumsstufen; Kette läuft in der Simulation; Stocken zeigt die fehlende Ware.

## Phase 5 – Schiffe, Werft & Weltkarte (≈ 4 Wochen)
- Schiffsklassen (Kogge, Holk, Schnigge, Kraweel) mit Werten: Fracht, Tempo, Rumpf, Kanonenplätze, Mannschaft, Kosten.
- Werft-Seite: kaufen, reparieren (Animation), aufrüsten (Kanonen, Segel).
- Weltkarte: Zoom/Pan per Touch, Schiffsbewegung, Wind, Reisedauer, Eis im Winter, Herbststürme (Schaden).
- Flotten/Konvois: mehrere Schiffe, Kapitäne mit Erfahrung.
- **Fertig, wenn:** Schiff kann zwischen allen Häfen reisen; Winterhäfen sind gesperrt; Sturmschaden tritt auf.

## Phase 6 – Seeschlacht (≈ 4 Wochen)
- Rasterkampf (15×7 offene See / 8×8 Küste) wie im Entwurf: Aktionspunkte, Windkosten, 3 Munitionsarten, Entern.
- Auto-Kampf (Schnellberechnung) und Fliehen (Formel Tempo + Wind).
- KI für Piraten/Gegner, Beute, Schiffsübernahme, Animationen (Schuss, Treffer, Brand, Untergang, Entern).
- **Fertig, wenn:** ein kompletter Kampf manuell, automatisch und per Flucht abschließbar ist; Ergebnisse stimmen mit der Vorschau überein.

## Phase 7 – Autorouten, Karriere & Politik (≈ 3 Wochen)
- Routen-Assistent in 3 Schritten (Städte → Preisgrenzen → Schiff), Schutz bei < 1.000 Taler, Meldungen bei Pause/Fehler.
- Karriere: Krämer → Händler → Kaufmann → Ratsherr → Bürgermeister → Eldermann, jeweils mit freigeschalteten Funktionen (Betriebe, Autorouten, Politik, Steuern, Hanse-Leitung).
- Politik: Rathaus-Ämter, Einfluss, Wahlen, Erlasse. Zielsystem/Spielende (Eldermann + Wohlstand), da kein Tod durch Alter.
- **Fertig, wenn:** Aufstieg bis Ratsherr spielbar; 3 Routen laufen autonom ohne Absturz.

## Phase 8 – Ereignisse, Jahreszeiten & Welt (≈ 2–3 Wochen)
- Ereignissystem (Dürre, Überschwemmung, Pest, Blockade; Rekordernte, Hanse-Messe, Rückenwind, Boom) mit Ereignis-Karten, Auswirkung auf Preise/Betriebe.
- Jahreszeiten visuell: Palettentausch in allen Szenen, Wetter (Schnee, Regen), Ostsee-Eis.
- Gerüchte als Hinweise (Frühwarnung), Konkurrenz-Händler (KI) optional.
- **Fertig, wenn:** jedes Ereignis mindestens eine sichtbare und eine wirtschaftliche Wirkung hat.

## Phase 9 – Balancing, Tutorial, Audio, Release (≈ 4–5 Wochen)
- Balancing mit automatisierten Läufen (Bots spielen 20 Jahre), Schwierigkeitsgrade.
- Tutorial (erste 15 Minuten geführt), Hilfe-Seiten, Barrierefreiheit (Schriftgröße, Farbblind-Modus).
- Audio: Musik je Region/Jahreszeit, Umgebungs- und Betriebs-Sounds, Lautstärkeregler.
- Performance-Tests auf schwachen Geräten, Akkuverbrauch, Speicherstände, Fehlerprotokoll.
- APK: Signierung, Store-Grafiken, Datenschutz, Beta-Test (geschlossen), danach Release.
- **Fertig, wenn:** 5 Testspieler spielen > 2 Stunden ohne Absturz; Tutorial wird ohne Hilfe verstanden.

---

## Zeitplan (grob, 1 Entwickler + Pixel-Artist)
| Phase | Dauer | Meilenstein |
|---|---|---|
| 0–1 | 3–4 Wochen | **M1:** Technik + UI-Kit stehen |
| 2–3 | 7 Wochen | **M2:** Handel in 2 Städten spielbar |
| 4 | 10–12 Wochen | **M3:** alle 18 Betriebe mit Animation (Vertical Slice schon nach 4a/Brauerei) |
| 5–6 | 8 Wochen | **M4:** Reisen + Seeschlacht |
| 7–8 | 5–6 Wochen | **M5:** Karriere, Autorouten, Ereignisse |
| 9 | 4–5 Wochen | **M6:** Beta → Release |
| **Gesamt** | **ca. 9–11 Monate** | |

Phase 4 ist der größte Kunstblock. Um parallel zu arbeiten, können Pixel-Art (Betriebe, Städte) und Simulation (Phasen 2, 5–7) getrennt laufen.

## Risiken & Gegenmaßnahmen
- **Kunstumfang (18 Betriebe × Zustände × Jahreszeiten, Felder zusätzlich × Wachstumsstufen):** Palettentausch statt Mehrfach-Grafik; gemeinsame Arbeiter-/Fass-/Rauch-Sprites wiederverwenden.
- **Balancing der Wirtschaft:** früh (Phase 2) mit Bot-Läufen testen, nicht erst am Ende.
- **Touch-Bedienung auf kleinen Bildschirmen:** jede neue Seite ab Phase 3 auf einem echten Handy prüfen.
- **Umfang:** Politik, Konkurrenz-KI und Küstenkämpfe sind verschiebbar, wenn der Zeitplan eng wird. Kern ist Handel + Betriebe + Schiffe.

## Entscheidungen (geklärt)
1. **Spielmodus: wählbar** – Szenarien (feste Startlage, Ziel) und freies Spiel (Endziel Eldermann/Wohlstand). Start-Menü in Phase 0/1, Szenarien-Editor-Daten in Phase 7.
2. **Startstadt: wählbar** – Auswahl vor Spielbeginn zusammen mit Startkapital, Schwierigkeit und erstem Betrieb. Jede Stadt braucht dafür einen eigenen Startzustand (Preise, Bedarf, Nachbarn). Karte der Startstädte in Phase 3.
3. **Gratis, alles frei** – keine Werbung, keine Käufe, keine Freischaltungen. Das spart Bezahl-/Werbe-SDKs, Store-Abrechnung und Einwilligungs-Dialoge; nur Datenschutzhinweis (keine Datensammlung, Speicherstände lokal).
4. **Konkurrenz-Händler: später** – nach dem ersten Release (Update). Die Simulation wird aber schon jetzt so gebaut, dass Händler-KI dieselben Aktionen wie der Spieler nutzen kann (gleiche Befehlsschnittstelle).
