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
