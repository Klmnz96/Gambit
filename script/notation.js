// Zugprotokoll: einen Zug in deutsche Schachnotation übersetzen ("Sf3", "exd5", "O-O", "e8=D+")

// Kurze Rochade (König nach g) O-O, lange Rochade (König nach c) O-O-O
function getCastlingNotation(move) {
  return move.toColumn === 6 ? "O-O" : "O-O-O";
}

// Geschlagen wird, wenn auf dem Zielfeld etwas steht, oder bei en passant (Zielfeld leer)
function isCaptureMove(board, move) {
  return board[move.toRow][move.toColumn] !== null || move.isEnPassant;
}

// Bauer: Schlägt er, steht seine Startspalte davor (exd5). Umwandlung kommt hinten dran (e8=D)
function getPawnNotation(move, targetName, captureSign) {
  const fromFile = captureSign ? fileLetters[move.fromColumn] : "";
  const promotion = move.isPromotion
    ? `=${pieceLetters[move.promotionType]}`
    : "";
  return `${fromFile}${captureSign}${targetName}${promotion}`;
}

function isFromSquare(square, move) {
  return square.row === move.fromRow && square.column === move.fromColumn;
}

// Darf die Figur auf diesem Feld ebenfalls auf das Zielfeld ziehen?
function canReachTarget(board, square, move, previousMove) {
  return getLegalMoves(board, square.row, square.column, previousMove).some(
    (target) => target.row === move.toRow && target.column === move.toColumn,
  );
}

// Andere Figuren gleicher Art und Farbe, die auch auf das Zielfeld dürften
function getRivalSquares(board, move, previousMove) {
  const piece = board[move.fromRow][move.fromColumn];
  return getSquaresOfColor(board, piece.color).filter(
    (square) =>
      !isFromSquare(square, move) &&
      board[square.row][square.column].type === piece.type &&
      canReachTarget(board, square, move, previousMove),
  );
}

// Zwei Springer könnten nach d2? Dann die Startspalte dazu (Sbd2).
// Stehen beide in derselben Spalte, die Reihe (T1e2), ganz selten beides (Dh4e1)
function getDisambiguation(board, move, previousMove) {
  const rivals = getRivalSquares(board, move, previousMove);
  if (rivals.length === 0) return "";
  const fromName = getSquareName(move.fromRow, move.fromColumn);
  const isSameColumn = rivals.some(
    (square) => square.column === move.fromColumn,
  );
  const isSameRow = rivals.some((square) => square.row === move.fromRow);
  if (!isSameColumn) return fromName[0];
  if (!isSameRow) return fromName[1];
  return fromName;
}

// Vor dem Ziehen aufrufen: Danach stehen Figur und geschlagene Figur nicht mehr da.
// Schach (+) und Matt (#) hängt script.js nach dem Zug an
function getMoveNotation(board, move, previousMove) {
  if (move.isCastling) return getCastlingNotation(move);
  const piece = board[move.fromRow][move.fromColumn];
  const targetName = getSquareName(move.toRow, move.toColumn);
  const captureSign = isCaptureMove(board, move) ? "x" : "";
  if (piece.type === "pawn") {
    return getPawnNotation(move, targetName, captureSign);
  }
  const pieceLetter = pieceLetters[piece.type];
  const disambiguation = getDisambiguation(board, move, previousMove);
  return `${pieceLetter}${disambiguation}${captureSign}${targetName}`;
}
