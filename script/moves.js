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

    const targetPiece = board[targetRow][targetColumn];
    const isOwnPiece = targetPiece && targetPiece.color === piece.color;
    if (!isOwnPiece)
      targetSquares.push({ row: targetRow, column: targetColumn });
  });

  return targetSquares;
}

// Bauer: zieht geradeaus nach vorn, schlägt aber nur schräg nach vorn.
// Weiß läuft nach oben (Reihe wird kleiner), Schwarz nach unten (Reihe wird größer).
function getPawnMoves(board, row, column) {
  const piece = board[row][column];
  const forwardStep = piece.color === "white" ? -1 : 1;
  const startRow = piece.color === "white" ? 6 : 1;
  const targetSquares = [];

  // Ein Feld vor, nur wenn es leer ist
  const oneForwardRow = row + forwardStep;
  if (isOnBoard(oneForwardRow, column) && !board[oneForwardRow][column]) {
    targetSquares.push({ row: oneForwardRow, column: column });

    // Zwei Felder vor, nur von der Startreihe und wenn beide Felder leer sind
    const twoForwardRow = row + forwardStep * 2;
    if (row === startRow && !board[twoForwardRow][column]) {
      targetSquares.push({ row: twoForwardRow, column: column });
    }
  }

  // Schräg vorn links und rechts, nur wenn dort eine gegnerische Figur steht
  [-1, 1].forEach((columnStep) => {
    const targetColumn = column + columnStep;
    if (!isOnBoard(oneForwardRow, targetColumn)) return;

    const targetPiece = board[oneForwardRow][targetColumn];
    if (targetPiece && targetPiece.color !== piece.color) {
      targetSquares.push({ row: oneForwardRow, column: targetColumn });
    }
  });

  return targetSquares;
}

// Alle Felder, auf die die Figur auf row/column ziehen darf
// (ob der eigene König danach im Schach steht, kommt in Stufe 4)
function getLegalMoves(board, row, column) {
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
