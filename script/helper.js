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

// So zieht jede Figur - für die Trainer-Zeile
const pieceRules = {
  rook: "Der Turm zieht gerade: waagerecht oder senkrecht, so weit er will - aber nicht über andere Figuren.",
  bishop:
    "Der Läufer zieht schräg, so weit er will. Er bleibt deshalb immer auf Feldern einer Farbe.",
  queen:
    "Die Dame ist die stärkste Figur: Sie zieht wie Turm und Läufer zusammen.",
  knight:
    "Der Springer zieht in L-Form: zwei Felder gerade und eins zur Seite. Als einzige Figur darf er über andere springen.",
  king: "Der König zieht genau ein Feld in jede Richtung. Er ist die wichtigste Figur: Wird er schachmatt gesetzt, ist das Spiel verloren.",
  pawn: "Der Bauer zieht ein Feld geradeaus, von seiner Startreihe aus auch zwei. Schlagen darf er nur schräg nach vorn und zurück zieht er nie.",
};

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
