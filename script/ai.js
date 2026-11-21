// Der Computergegner
// Anfänger: zufälliger erlaubter Zug. Später: schlägt, wenn möglich, und denkt ein paar Züge voraus

// Alle erlaubten Züge einer Farbe als Liste: [{ fromRow, fromColumn, toRow, toColumn }, ...]
function getAllLegalMoves(board, color, previousMove) {
  return getSquaresOfColor(board, color).flatMap((square) =>
    getLegalMoves(board, square.row, square.column, previousMove).map(
      (target) => ({
        fromRow: square.row,
        fromColumn: square.column,
        toRow: target.row,
        toColumn: target.column,
      }),
    ),
  );
}

function pickRandomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

// Welchen Zug macht der Computer? Ein Bauer auf der letzten Reihe wird automatisch zur Dame
function chooseComputerMove(board, color, previousMove) {
  return pickRandomMove(getAllLegalMoves(board, color, previousMove));
}
