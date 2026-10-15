# Hanse-Händler & Seefahrer

Pixel-Handelsspiel für HTML5 und Android (APK). Dies ist **Version 0.3**: Phasen 0–3 des [Plans](PLAN.md) – Pixel-Pipeline, Simulation, Bier-Produktionskette und 12 Hansestädte mit Reisen und Handel.

## Starten
- Einfach `index.html` im Browser öffnen (kein Build, keine Abhängigkeiten) – oder `npm start` und `http://localhost:8080`.
- Tests (Simulation, Wirtschaft, Ketten, Determinismus; ~25 Tests): `npm test`
- Android-APK: `npm install && npm run android`, danach `cd android && ./gradlew assembleDebug` (benötigt Android SDK + JDK 17). Oder in GitHub: Actions → „Android-APK“ → Run workflow (Artefakt = Debug-APK).

## Spielprinzip (v0.3)
Wähle eine von 12 Startstädten (Heimat). In jeder Stadt gibt es 6 Orte: **Kontor, Markt, Rathaus, Schenke, Betriebe, Werft**. Betriebe stehen in der Heimat und laufen weiter, während du auf der **Karte** zu anderen Städten reist (Leihschiff: Dauer und Kosten nach Entfernung, Riga/Reval/Narva/Novgorod sind Dez.–Feb. vereist). Unterwegs nimmst du Ware im **Reisegepäck** mit (am Kontor ein-/ausladen), baust ein Kontor in der Zielstadt (800 T) und verkaufst dort mit Gewinn. Fremde Händler zahlen 2 % Zoll. In der **Schenke** kaufst du Gerüchte (die wahren besten Routen) und heuerst Kapitäne an; die **Werft** erweitert den Laderaum; das **Rathaus** zeigt Vorräte und Erlasse. Das Panel rechts lässt sich mit dem Pfeil am Rand ausblenden.

### Der Betriebsalltag (seit v0.1)
Wähle Startstadt und Schwierigkeit. Baue unter **Betriebe**: Brunnen, Gersten- und Hopfenfeld, Brauerei. Stelle Arbeiter ein (Felder nur zu Aussaat und Ernte nötig – sonst Lohn sparen), kaufe fehlende Zutaten im **Markt**, braue Dünn- oder Starkbier und verkaufe es. Alles lagert im **Kontor**. Zeit: ❚❚ / ▶ / ▶▶ (Leertaste = Pause). Jahreszeiten verändern Szenen und Preise (Winter: Bierverbrauch ×2).

## Aufbau
| Pfad | Inhalt |
|---|---|
| `src/data.js` | Güter, Städte, Betriebe, Rezepte (datengetrieben) |
| `src/sim.js` | Simulation ohne Grafik (Zeit, Märkte, Anbau, Produktion), in Node testbar |
| `src/gfx.js` | Pixel-Pipeline: Primitive, Icons, Jahreszeiten-Palettentausch |
| `src/scenes.js` | Szenen der Betriebe, Kontor, Markt: gecachter Hintergrund + Animations-Ebene |
| `src/cities.js` | 12 Stadtansichten in 4 Regionalstilen (+ Wahrzeichen), Weltkarte, Rathaus/Schenke/Werft-Innenräume |
| `src/game.js` | Seiten/Panels, Eingabe, Spielschleife, Speichern |
| `css/style.css` | Pixel-UI-Kit (Panel, Slots, Buttons, Balken, Toasts, Menü) |
| `fonts/` | Pixelify Sans (OFL), lokal eingebunden |
| `tests/` | `npm test`: Lager, Determinismus, Märkte/Preise, Produktionsketten, Bot-Balancing |
| `scripts/`, `capacitor.config.json`, `.github/workflows/` | APK-Build (Capacitor) |
| `mockup/` | früherer UI-Entwurf (Referenz) |

## Neue Betriebe hinzufügen
1. Eintrag in `data.js` (`buildings`, `buildOrder`), 2. Logik in `sim.js` (Art `field`/`well`/`brew` oder neue Art), 3. Szene in `scenes.js` (`bg` + `anim`), 4. Panel in `game.js`.

## Simulation (Phase 2)
- **Märkte:** Verbrauch der Bevölkerung (je 1000 Einwohner, saisonal, Winter ×2 bei Bier), Produktion der Stadt (`supply`, Erntezeiten), Rückstellkraft zum Sollbestand, Preis aus Knappheit (`elas`), Spanne 4 %, Preisgrenzen 0,45×–3,2×.
- **Modifikatoren** (`sim.addMod`) für Preis, Verbrauch, Angebot und Ernte – Anschluss für Ereignisse (Phase 8).
- **Lager** (`mkStore`): gleiche Logik für Kontor und später Schiffe.
- **Produktionsarten:** `field` (Anbauzyklus), `extract` (Förderung), `process` (Rezepte, Vorprodukte aus dem Kontor). Fehlt ein Vorprodukt, bricht die Folgeproduktion ein; `status().cause` nennt die Ursache entlang der Kette.
- **Deterministisch:** gleicher Seed ⇒ gleicher Verlauf, Speichern/Laden ändert nichts, alte Spielstände werden migriert.

## Städte & Regionen (Phase 3)
Ostsee-Gotik: Lübeck, Danzig, Stettin · Nordsee-Fachwerk: Hamburg, Brügge, London · Nordisches Holz: Bergen, Visby · Slawisch-Ost: Novgorod, Riga, Reval, Narva. Preise, Verbrauch und Soll-Bestand folgen aus Einwohnerzahl und Eigenheiten (`data.js`); kleine Städte (Bergen, Visby, Narva) sind ein schwerer Start. Tests prüfen u. a., dass Handelsrouten mit Gewinn existieren, ein voller Laderaum ins falsche Ziel aber Verlust bringt.

## Bekannte Lücken
Reisen laufen noch mit einem Leihschiff; eigene Schiffe, Flotten und Seeschlacht folgen in Phasen 5–6, Politik in Phase 7, Ereignisse in Phase 8. Betriebe lassen sich nur in der Heimatstadt bauen. Weiteres Balancing in Phase 9. APK: GitHub Actions → „Android-APK“.
