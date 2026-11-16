// Kleine Hilfsfunktionen ohne Bezug zum DOM
// (z. B. Feldnamen wie "e4" in Reihe/Spalte umrechnen)

const fileLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];

const pieceNames = {
  king: "König",
  queen: "Dame",
  rook: "Turm",
  bishop: "Läufer",
  knight: "Springer",
  pawn: "Bauer",
};

const colorNames = {
  white: "weiß",
  black: "schwarz",
};

// Spielernamen wie auf dem Zifferblatt
const playerNames = {
  white: "Weiß",
  black: "Schwarz",
};

// So zieht jede Figur: Texte für die Trainer-Zeile
const pieceRules = {
  rook: "Der Turm zieht gerade: waagerecht oder senkrecht, so weit er will, aber nicht über andere Figuren.",
  bishop:
    "Der Läufer zieht schräg, so weit er will. Er bleibt deshalb immer auf Feldern einer Farbe.",
  queen:
    "Die Dame ist die stärkste Figur: Sie zieht wie Turm und Läufer zusammen.",
  knight:
    "Der Springer zieht in L-Form: zwei Felder gerade und eins zur Seite. Als einzige Figur darf er über andere springen.",
  king: "Der König zieht genau ein Feld in jede Richtung. Er ist die wichtigste Figur: Wird er schachmatt gesetzt, ist das Spiel verloren.",
  pawn: "Der Bauer zieht ein Feld geradeaus, von seiner Startreihe aus auch zwei. Schlagen darf er nur schräg nach vorn. Zurück zieht er nie.",
};

// Texte zum Spielstand für die Trainer-Zeile
const statusTexts = {
  check:
    "Schach! Dein König wird angegriffen. Rette ihn: wegziehen, den Angreifer schlagen oder eine Figur dazwischenstellen.",
  checkmate: "Schachmatt! Der König kann nicht mehr gerettet werden.",
  stalemate:
    "Patt! Es ist kein Zug mehr möglich, aber der König steht nicht im Schach. Die Partie endet unentschieden, im Schach sagt man Remis.",
};

// Gewählte Ansicht merken. try/catch: im privaten Fenster kann localStorage fehlen
const viewModeKey = "gambit-view";

function loadViewMode() {
  try {
    return localStorage.getItem(viewModeKey) === "2d" ? "2d" : "3d";
  } catch {
    return "3d";
  }
}

function saveViewMode(mode) {
  try {
    localStorage.setItem(viewModeKey, mode);
  } catch {
    // Speichern nicht möglich: die Ansicht gilt dann nur bis zum Neuladen
  }
}

// Tipps pro Spieler merken (an und aus). Ohne gespeicherten Wert: für beide an
const trainerKey = "gambit-trainer";

function loadTrainerSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(trainerKey));
    return { white: saved?.white !== false, black: saved?.black !== false };
  } catch {
    return { white: true, black: true };
  }
}

function saveTrainerSettings(settings) {
  try {
    localStorage.setItem(trainerKey, JSON.stringify(settings));
  } catch {
    // Speichern nicht möglich: die Einstellung gilt dann nur bis zum Neuladen
  }
}

//Reihe 0 / Spalte 4 -> "e8"
function getSquareName(row, column) {
  return `${fileLetters[column]}${8 - row}`;
}

function getSquareColorClass(row, column) {
  return (row + column) % 2 === 0 ? "square-light" : "square-dark";
}

// Figur als SVG aus der Sammlung assets/pieces/pieces.svg (#king, #queen, ...)
function getPieceHtml(piece) {
  if (!piece) return "";
  return `<svg class="piece piece-${piece.color}" aria-hidden="true"><use href="assets/pieces/pieces.svg#${piece.type}"></use></svg>`;
}

// Für Screenreader: "e2, weißer Bauer" bzw. "e4, leer"
function getSquareLabel(row, column, piece) {
  const squareName = getSquareName(row, column);
  if (!piece) return `${squareName}, leer`;
  return `${squareName}, ${colorNames[piece.color]}er ${pieceNames[piece.type]}`;
}

// Buchstaben a-h in der untersten Reihe, Zahlen 1-8 in der linken Spalte
function getCoordinatesHtml(row, column) {
  let coordinatesHtml = "";
  if (column === 0) {
    coordinatesHtml += `<span class="coordinate coordinate-rank" aria-hidden="true">${8 - row}</span>`;
  }
  if (row === 7) {
    coordinatesHtml += `<span class="coordinate coordinate-file" aria-hidden="true">${fileLetters[column]}</span>`;
  }
  return coordinatesHtml;
}
