// Die Zugregeln: welche Felder darf eine Figur erreichen?
// Turm, Läufer, Dame, König, Springer, Bauer – dazu Schach, Schachmatt und Sonderzüge

// Eine Richtung = wie viele Reihen und Spalten pro Schritt
const rookDirections = [
  { rowStep: -1, columnStep: 0 }, //nach oben
  { rowStep: 1, columnStep: 0 }, //nach unten
  { rowStep: 0, columnStep: -1 }, //nach links
  { rowStep: 0, columnStep: 1 }, // nach rechts
];

const bishopDirections = [
  { rowStep: -1, columnStep: -1 }, // schräg links oben
  { rowStep: -1, columnStep: 1 }, // schräg rechts oben
  { rowStep: 1, columnStep: -1 }, // schräg links unten
  { rowStep: 1, columnStep: 1 }, // schräg rechts unten
];

// Die Dame kann beides: wie Turm und Läufer zusammen
const queenDirections = [...rookDirections, ...bishopDirections];

function isOnBoard(row, column) {
  return row >= 0 && row <= 7 && column >= 0 && column <= 7;
}

// Langschrittige Figuren (Turm, Läufer, Dame): pro Richtung Feld für Feld weitergehen
// bis der Rand oder eine Figur kommt. Gegner darf geschlagen werden, eigene Figur blockiert.
function getSlidingMoves(board, row, column, directions) {
  const piece = board[row][column];
  const targetSquares = [];

  directions.forEach((direction) => {
    let targetRow = row + direction.rowStep;
    let targetColumn = column + direction.columnStep;

    while (isOnBoard(targetRow, targetColumn)) {
      const targetPiece = board[targetRow][targetColumn];

      if (targetPiece) {
        if (targetPiece.color !== piece.color) {
          targetSquares.push({ row: targetRow, column: targetColumn });
        }
        break;
      }

      targetSquares.push({ row: targetRow, column: targetColumn });
      targetRow += direction.rowStep;
      targetColumn += direction.columnStep;
    }
  });

  return targetSquares;
}

// Übergang, bis jede Figur ihre Regeln hat: überall hin, nur nicht auf eigene Figuren
function getUnrestrictedMoves(board, row, column) {
  const piece = board[row][column];
  const targetSquares = [];

  board.forEach((boardRow, targetRow) => {
    boardRow.forEach((targetPiece, targetColumn) => {
      const isOwnPiece = targetPiece && targetPiece.color === piece.color;
      if (!isOwnPiece)
        targetSquares.push({ row: targetRow, column: targetColumn });
    });
  });

  return targetSquares;
}

// Alle Felder, auf die die Figur auf row/column ziehen darf
function getLegalMoves(board, row, column) {
  const piece = board[row][column];

  if (piece.type === "rook")
    return getSlidingMoves(board, row, column, rookDirections);
  if (piece.type === "bishop")
    return getSlidingMoves(board, row, column, bishopDirections);
  if (piece.type === "queen")
    return getSlidingMoves(board, row, column, queenDirections);

  // Springer, König, Bauer folgen als Nächstes
  return getUnrestrictedMoves(board, row, column);
}
