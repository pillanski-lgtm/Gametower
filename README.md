# Hanse-Händler & Seefahrer

Pixel-Handelsspiel für HTML5 und Android (APK). Dies ist **Version 0.1**: Phase 0 + 1 des [Plans](PLAN.md) und die erste Produktionskette (Bier).

## Starten
- Einfach `index.html` im Browser öffnen (kein Build, keine Abhängigkeiten) – oder `npm start` und `http://localhost:8080`.
- Tests (Simulation, Wirtschaft, Ketten, Determinismus; ~25 Tests): `npm test`
- Android-APK: `npm install && npm run android`, danach `cd android && ./gradlew assembleDebug` (benötigt Android SDK + JDK 17). Oder in GitHub: Actions → „Android-APK“ → Run workflow (Artefakt = Debug-APK).

## Spielprinzip (v0.1)
Wähle Startstadt und Schwierigkeit. Baue unter **Betriebe**: Brunnen, Gersten- und Hopfenfeld, Brauerei. Stelle Arbeiter ein (Felder nur zu Aussaat und Ernte nötig – sonst Lohn sparen), kaufe fehlende Zutaten im **Markt**, braue Dünn- oder Starkbier und verkaufe es. Alles lagert im **Kontor**. Zeit: ❚❚ / ▶ / ▶▶ (Leertaste = Pause). Jahreszeiten verändern Szenen und Preise (Winter: Bierverbrauch ×2).

## Aufbau
| Pfad | Inhalt |
|---|---|
| `src/data.js` | Güter, Städte, Betriebe, Rezepte (datengetrieben) |
| `src/sim.js` | Simulation ohne Grafik (Zeit, Märkte, Anbau, Produktion), in Node testbar |
| `src/gfx.js` | Pixel-Pipeline: Primitive, Icons, Jahreszeiten-Palettentausch |
| `src/scenes.js` | je Seite eine Szene: gecachter Hintergrund + Animations-Ebene |
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

## Bekannte Lücken
APK-Build ist eingerichtet, aber hier nicht ausgeführt (kein Android SDK in der Entwicklungsumgebung) – bitte einmal über GitHub Actions oder lokal bauen. Keine Reisen/Schiffe/Seeschlacht/Ereignisse (Phasen 5–8); weiteres Balancing in Phase 9.
