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

// Steht auf dem Feld eine Figur der eigenen Farbe?
function isOwnPiece(targetPiece, color) {
  return Boolean(targetPiece) && targetPiece.color === color;
}

// Steht auf dem Feld eine Figur der Gegnerfarbe?
function isEnemyPiece(targetPiece, color) {
  return Boolean(targetPiece) && targetPiece.color !== color;
}

// Eine Richtung Feld für Feld ablaufen, bis Rand oder Figur kommt.
// Gegner darf geschlagen werden (Feld zählt noch), eigene Figur blockiert (Feld zählt nicht).
function getMovesInDirection(board, row, column, direction) {
  const piece = board[row][column];
  const targetSquares = [];
  let targetRow = row + direction.rowStep;
  let targetColumn = column + direction.columnStep;

  while (isOnBoard(targetRow, targetColumn)) {
    const targetPiece = board[targetRow][targetColumn];
    if (isOwnPiece(targetPiece, piece.color)) break; // eigene Figur blockiert
    targetSquares.push({ row: targetRow, column: targetColumn });
    if (targetPiece) break;
    targetRow += direction.rowStep;
    targetColumn += direction.columnStep;
  }
  return targetSquares;
}

// Langschrittige Figuren (Turm, Läufer, Dame): alle ihre Richtungen zusammen
function getSlidingMoves(board, row, column, directions) {
  const targetSquares = [];
  directions.forEach((direction) => {
    targetSquares.push(...getMovesInDirection(board, row, column, direction));
  });
  return targetSquares;
}

// Springer: acht Sprünge in L-Form (zwei Felder gerade, eins zur Seite)
const knightJumps = [
  { rowStep: -2, columnStep: -1 },
  { rowStep: -2, columnStep: 1 },
  { rowStep: -1, columnStep: -2 },
  { rowStep: -1, columnStep: 2 },
  { rowStep: 1, columnStep: -2 },
  { rowStep: 1, columnStep: 2 },
  { rowStep: 2, columnStep: -1 },
  { rowStep: 2, columnStep: 1 },
];

// Kurzschrittige Figuren (Springer, König): jeder Schritt genau einmal, ohne weiterzugehen.
// Ziel muss auf dem Brett liegen und darf keine eigene Figur sein.
function getStepMoves(board, row, column, steps) {
  const piece = board[row][column];
  const targetSquares = [];
  steps.forEach((step) => {
    const targetRow = row + step.rowStep;
    const targetColumn = column + step.columnStep;
    if (!isOnBoard(targetRow, targetColumn)) return;
    if (isOwnPiece(board[targetRow][targetColumn], piece.color)) return;
    targetSquares.push({ row: targetRow, column: targetColumn });
  });
  return targetSquares;
}

// Bauer geradeaus: ein Feld vor, nur wenn es leer ist.
// Von der Startreihe auch zwei Felder, wenn beide leer sind.
function getPawnForwardMoves(board, row, column, forwardStep) {
  const piece = board[row][column];
  const startRow = piece.color === "white" ? 6 : 1;
  const oneForward = { row: row + forwardStep, column: column };
  const twoForward = { row: row + forwardStep * 2, column: column };

  if (!isOnBoard(oneForward.row, column) || board[oneForward.row][column]) {
    return [];
  }
  if (row === startRow && !board[twoForward.row][column]) {
    return [oneForward, twoForward];
  }
  return [oneForward];
}

// Bauer schlägt: schräg vorn links und rechts, nur wenn dort ein Gegner steht
function getPawnCaptureMoves(board, row, column, forwardStep) {
  const piece = board[row][column];
  const targetRow = row + forwardStep;
  const targetSquares = [];

  [-1, 1].forEach((columnStep) => {
    const targetColumn = column + columnStep;
    if (!isOnBoard(targetRow, targetColumn)) return;
    if (isEnemyPiece(board[targetRow][targetColumn], piece.color)) {
      targetSquares.push({ row: targetRow, column: targetColumn });
    }
  });

  return targetSquares;
}

// Bauer: zieht geradeaus nach vorn, schlägt aber nur schräg nach vorn.
// Weiß läuft nach oben (Reihe wird kleiner), Schwarz nach unten (Reihe wird größer).
function getPawnMoves(board, row, column) {
  const piece = board[row][column];
  const forwardStep = piece.color === "white" ? -1 : 1;
  const forwardMoves = getPawnForwardMoves(board, row, column, forwardStep);
  const captureMoves = getPawnCaptureMoves(board, row, column, forwardStep);
  return [...forwardMoves, ...captureMoves];
}

// Alle Felder, die die Figur nach ihren Zugregeln erreicht.
// Ob der eigene König danach im Schach steht, prüft erst getLegalMoves.
function getPieceMoves(board, row, column) {
  const piece = board[row][column];

  if (piece.type === "rook")
    return getSlidingMoves(board, row, column, rookDirections);
  if (piece.type === "bishop")
    return getSlidingMoves(board, row, column, bishopDirections);
  if (piece.type === "queen")
    return getSlidingMoves(board, row, column, queenDirections);
  if (piece.type === "knight")
    return getStepMoves(board, row, column, knightJumps);
  // Der König zieht in dieselben acht Richtungen wie die Dame, aber nur ein Feld weit
  if (piece.type === "king")
    return getStepMoves(board, row, column, queenDirections);
  return getPawnMoves(board, row, column);
}

function getOpponentColor(color) {
  return color === "white" ? "black" : "white";
}

// Alle Felder, auf denen eine Figur dieser Farbe steht
function getSquaresOfColor(board, color) {
  const squares = [];
  board.forEach((boardRow, row) => {
    boardRow.forEach((piece, column) => {
      if (isOwnPiece(piece, color)) squares.push({ row: row, column: column });
    });
  });
  return squares;
}

// Wo steht der König dieser Farbe?
function findKing(board, color) {
  return getSquaresOfColor(board, color).find(
    (square) => board[square.row][square.column].type === "king",
  );
}

//Kann irgendeine Figur von attackerColor im nächsten Zug auf row/column ziehen ?
function isSquareAttacked(board, row, column, attackerColor) {
  return getSquaresOfColor(board, attackerColor).some((square) => {
    const targets = getPieceMoves(board, square.row, square.column);
    return targets.some(
      (target) => target.row === row && target.column === column,
    );
  });
}

// Steht der König dieser Farbe gerade im Schach?
function isInCheck(board, color) {
  const king = findKing(board, color);
  return isSquareAttacked(
    board,
    king.row,
    king.column,
    getOpponentColor(color),
  );
}

// Zug auf einer Kopie ausprobieren: steht der eigene König danach sicher?
function keepsKingSafe(board, row, column, target) {
  const color = board[row][column].color;
  const testBoard = copyBoard(board);
  movePiece(testBoard, row, column, target.row, target.column);
  return !isInCheck(testBoard, color);
}

// Erlaubt sind nur Züge, nach denen der eigene König nicht im Schach steht
function getLegalMoves(board, row, column) {
  return getPieceMoves(board, row, column).filter((target) =>
    keepsKingSafe(board, row, column, target),
  );
}

// Hat diese Farbe irgendeine Figur, die noch ziehen darf?
function hasAnyLegalMoves(board, color) {
  return getSquaresOfColor(board, color).some(
    (square) => getLegalMoves(board, square.row, square.column).length > 0,
  );
}

// Spielstand für die Farbe am Zug: "checkmate", "stalemate", "check" oder "playing"
function getGameStatus(board, color) {
  const inCheck = isInCheck(board, color);
  if (!hasAnyLegalMoves(board, color)) {
    return inCheck ? "checkmate" : "stalemate";
  }
  return inCheck ? "check" : "playing";
}
