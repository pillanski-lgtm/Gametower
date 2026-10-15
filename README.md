# Hanse-Händler & Seefahrer

Pixel-Handelsspiel für HTML5 und Android (APK). Dies ist **Version 0.1**: Phase 0 + 1 des [Plans](PLAN.md) und die erste Produktionskette (Bier).

## Starten
- Einfach `index.html` im Browser öffnen (kein Build, keine Abhängigkeiten) – oder `npm start` und `http://localhost:8080`.
- Test der Simulation (Bot spielt 10 Jahre in 3 Städten): `npm test`

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
| `mockup/` | früherer UI-Entwurf (Referenz) |

## Neue Betriebe hinzufügen
1. Eintrag in `data.js` (`buildings`, `buildOrder`), 2. Logik in `sim.js` (Art `field`/`well`/`brew` oder neue Art), 3. Szene in `scenes.js` (`bg` + `anim`), 4. Panel in `game.js`.

## Bekannte Lücken v0.1
Schrift kommt per Google-Fonts-Link (für APK lokal einbinden); keine Reisen/Schiffe/Seeschlacht/Ereignisse (Phasen 5–8); Balancing grob (Phase 9).
