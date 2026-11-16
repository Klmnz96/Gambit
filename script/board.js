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

// Bauer erreicht die letzte Reihe: Weiß oben (Reihe 0), Schwarz unten (Reihe 7)
function isPromotionSquare(piece, row) {
  return piece.type === "pawn" && (row === 0 || row === 7);
}

// Rochade erkennen: nur der König zieht je zwei Felder zur Seite
function isCastlingMove(piece, fromColumn, toColumn) {
  return piece.type === "king" && Math.abs(toColumn - fromColumn) === 2;
}

// Kurze Rochade (König nach g): Turm von h nach f.
// Lange Rochade (König nach c): Turm von a nach d.
function moveCastlingRook(board, row, kingColumn) {
  const isKingSide = kingColumn === 6;
  const rookFrom = isKingSide ? 7 : 0;
  const rookTo = isKingSide ? 5 : 3;
  movePiece(board, row, rookFrom, row, rookTo);
}

// Die Figur nach dem Zug: ein Bauer auf der letzten Reihe wird zur Dame, sonst eine Kopie mit hasMoved (neu statt ändern, damit Test-Bretter nichts verstellen)
function getMovedPiece(piece, toRow) {
  if (isPromotionSquare(piece, toRow)) return createPiece("queen", piece.color);
  return { ...piece, hasMoved: true };
}

// Figur von einem Feld auf ein anderes setzen, eine Figur auf dem Zielfeld wird dabei geschlagen.
// Bei der Rochade zieht der Turm gleich mit
function movePiece(board, fromRow, fromColumn, toRow, toColumn) {
  const piece = board[fromRow][fromColumn];
  board[toRow][toColumn] = getMovedPiece(piece, toRow);
  board[fromRow][fromColumn] = null;
  if (isCastlingMove(piece, fromColumn, toColumn)) {
    moveCastlingRook(board, toRow, toColumn);
  }
}

// Kopie zum Ausprobieren: neue Reihen, damit das echte Brett unverändert bleibt
function copyBoard(board) {
  return board.map((boardRow) => [...boardRow]);
}
