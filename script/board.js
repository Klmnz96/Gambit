// Das Brett als Daten: 8 Reihen mit je 8 Feldern
// Startaufstellung, Figur auf ein Feld setzen, Figur entfernen

// Reihenfolge der Figuren in der hintersten Reihe, von links (a) nach rechts (h)
const backRowTypes = [
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
  "bishop",
  "knight",
  "rook",
];

function createPiece(type, color) {
  return { type: type, color: color };
}

function createBackRow(color) {
  return backRowTypes.map((type) => createPiece(type, color));
}

function createPawnRow(color) {
  return backRowTypes.map(() => createPiece("pawn", color));
}

function createEmptyRow() {
  return backRowTypes.map(() => null);
}

// Reihe 0 ist oben (Schwarz, Reihe 8 auf dem Brett), Reihe 7 unten (Weiß, Reihe 1)
function createStartBoard() {
  return [
    createBackRow("black"),
    createPawnRow("black"),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createPawnRow("white"),
    createBackRow("white"),
  ];
}

// Figur von einem Feld auf ein anderes setzen; eine Figur auf dem Zielfeld wird dabei geschlagen
function movePiece(board, fromRow, fromColumn, toRow, toColumn) {
  board[toRow][toColumn] = board[fromRow][fromColumn];
  board[fromRow][fromColumn] = null;
}
