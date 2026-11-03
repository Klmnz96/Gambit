# Gambit: 3D-Ansicht (Design)

Stand: 2026-11-03. Freigegeben von Fabian in drei Abschnitten (Aufbau, Aussehen, Bedienung/Tests).

## Ziel

Gambit bekommt eine echte 3D-Ansicht mit Three.js, umschaltbar mit der bestehenden 2D-Ansicht. Beide Ansichten zeigen denselben Spielstand und nutzen dieselben Regeln (`board.js`, `moves.js`). Alles, was in Stufe 4 und später an Regeln dazukommt, gilt automatisch für beide.

## Entscheidungen

| Thema | Entscheidung |
|---|---|
| Look | Bakelit & Messing (passend zu "Die Schachuhr") |
| Kamera | drehen und zoomen, begrenzt, kein Verschieben |
| Seitenwechsel | Kamera dreht nach jedem Zug sanft (ca. 1 s) zum Spieler am Zug |
| Startansicht | 3D beim ersten Besuch, Wahl in `localStorage` gemerkt, ohne WebGL immer 2D |
| Einbindung | lokale Kopie von Three.js (feste Version) unter `assets/vendor/three/`, Import-Map im HTML, kein Bundler |

## Aufbau

```
script/                  normale Scripts (bleiben)
  helper.js, template.js, board.js, moves.js, ai.js
  script.js              Spielstand, render(), Schalter, registerView3d()

script/three/            ES-Module (neu)
  scene.js               Renderer, Kamera, Licht, OrbitControls, Seitenwechsel-Drehung
  pieces.js              Figuren-Geometrien: LatheGeometry-Profile, Springer per ExtrudeGeometry
  board3d.js             Brett, Messingrahmen mit Koordinaten, Markierungen, Figuren-Abgleich mit board
  picking.js             Klick/Hover -> row/column per Raycasting
  view.js                Startpunkt: baut alles auf, meldet sich mit registerView3d() an

assets/vendor/three/     three.module.min.js, addons (OrbitControls, RoomEnvironment)
```

### Zusammenspiel

- Module laden nach den normalen Scripts. `script.js` startet wie bisher, die 3D-Ansicht meldet sich danach über `registerView3d(view)` an.
- `view` bietet: `render()` (Stand aus `board`, `selectedSquare`, `legalSquares`, `lastMove`, `currentColor` übernehmen), `show()` und `hide()`.
- `render()` in `script.js`: 2D-Buttons immer bauen, Uhren immer aktualisieren, und wenn 3D aktiv und angemeldet ist, zusätzlich `view.render()`.
- Klicks in 3D rufen `handleSquareClick(row, column)` auf. Regeln existieren nur an einer Stelle.
- Module lesen die globalen `let`-Variablen aus `script.js` direkt (gemeinsamer globaler Gültigkeitsbereich), schreiben sie aber nie. Geändert wird der Spielstand nur über `handleSquareClick`.

### Barrierefreiheit

- Die 2D-Buttons werden immer gebaut. In 3D sind sie visuell versteckt, bleiben aber per Tastatur und Screenreader bedienbar.
- Fokus auf einem versteckten Button wird in 3D als dunkler Rahmen um das Feld gezeigt.
- Trainer-Zeilen (`aria-live`) funktionieren in beiden Ansichten gleich.

## Aussehen

- **Hintergrund:** Seitenfarbe `#141312`, das Brett steht wie auf einem dunklen Tisch.
- **Brett:** Bakelit-Platte `#1f1d1a`, Messingrahmen `#b08d57` (metallisch), Felder Elfenbein `#ece6d6` und Graphit `#7a766c`, matt.
- **Koordinaten:** a bis h und 1 bis 8 als Gravur im Messingrahmen, nicht in den Feldern.
- **Figuren:** selbst gebaut. Bauer, Turm, Läufer, Dame, König als Drehkörper plus Details (Zinnen, Kreuz, Kronenkugeln, Kerbe). Springer als extrudierter Pferdekopf auf rundem Sockel. Weiß glänzendes Elfenbein, Schwarz glänzendes Bakelit (nicht reines Schwarz, damit Lichtkanten die Form zeigen). Dünner Messingring am Sockel jeder Figur.
- **Licht:** warmes Hauptlicht schräg von oben mit weichen Schatten, Umgebungsspiegelung über `RoomEnvironment`.

### Zustände

| Zustand | Darstellung |
|---|---|
| gewählte Figur | hebt sich leicht an, Messingring darunter |
| erlaubtes Feld | flache Messingscheibe |
| erlaubtes Schlagen | Messingring um die gegnerische Figur |
| letzter Zug | Start- und Zielfeld leicht messingfarben getönt |
| Tastatur-Fokus | dunkler Rahmen um das Feld |
| Schach (ab Stufe 4) | rotes Leuchten `#b3261e` unter dem König |

### Bewegung

- Zug: Figur gleitet in ca. 0,3 s ins Ziel, Springer in einem kleinen Bogen. Geschlagene Figur sinkt kurz ein und verschwindet.
- Seitenwechsel: Kamera dreht in ca. 1 s auf die Seite des Spielers am Zug.
- `prefers-reduced-motion: reduce`: alles springt sofort an seinen Platz.

### Kamera

- Startansicht schräg von oben, von der Seite des Spielers am Zug.
- OrbitControls: Dämpfung an, Verschieben aus, Neigung begrenzt (nicht unter das Brett, nicht flach auf Tischhöhe), Zoom begrenzt.

## Bedienung

- **Schalter** `2D | 3D` unter dem Schriftzug: `<button>` mit `aria-pressed`, mindestens 44px hoch, Schrift mindestens 16px, aktive Seite in Messing.
- Speicherung in `localStorage` unter `gambit-view`, Lesen und Schreiben in `try/catch`.
- Ohne WebGL: Schalter ausgeblendet, 2D.
- **Klick vs. Drehen:** Klick zählt nur, wenn sich der Zeiger zwischen Drücken und Loslassen weniger als 5px bewegt hat.
- **Hover:** Zeiger-Cursor über eigener Figur und über erlaubten Feldern.

## Technik

- Neu zeichnen nur bei Änderung (Zug, Animation, Kamera, Größenänderung), keine Dauerschleife im Ruhezustand.
- `pixelRatio` höchstens 2.
- Canvas nimmt den Platz des 2D-Bretts ein und passt sich bei Größenänderung an (`ResizeObserver`).

## Regeln für den Code

- Normale Funktionen höchstens 14 Zeilen.
- Feste Werte (Farben, Maße, Zeiten) als benannte Konstanten oben in der Datei.
- Kommentare Deutsch, Namen Englisch, camelCase.

## Nicht Teil dieses Schritts

Sounds, mehrere Figurensets, Kamera-Verschieben, KI, Stufe 4 und später.

## Tests

- Regel-Vergleichstest (zufällige Stellungen, alt gegen neu) bleibt grün, die Regeln werden nicht angefasst.
- Screenshots in Chrome bei 1440px und 375px, jeweils 3D und 2D.
- Checkliste:
  - Figur wählen, ziehen, schlagen in 3D
  - mitten in der Partie umschalten, Stand in beiden Ansichten gleich
  - mit Tab und Enter spielen, auch in 3D
  - neu laden: Ansicht gemerkt
  - Konsole ohne Fehler
