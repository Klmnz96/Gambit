// Remis-Regeln: zu wenig Material, 50-Züge-Regel, dreifache Stellungswiederholung

// Alle Figuren außer den Königen, mit ihrem Feld: [{ type, color, row, column }]
function getPiecesWithoutKings(board) {
  const pieces = [];
  board.forEach((boardRow, row) => {
    boardRow.forEach((piece, column) => {
      if (piece && piece.type !== "king") {
        pieces.push({ ...piece, row: row, column: column });
      }
    });
  });
  return pieces;
}

function isMinorPiece(piece) {
  return piece.type === "bishop" || piece.type === "knight";
}

// Nur Läufer, und alle auf derselben Feldfarbe: Die können nie mattsetzen
function areAllBishopsOnOneColor(pieces) {
  const squareColors = pieces.map((piece) =>
    getSquareColorClass(piece.row, piece.column),
  );
  const isOnlyBishops = pieces.every((piece) => piece.type === "bishop");
  return (
    isOnlyBishops &&
    squareColors.every((squareColor) => squareColor === squareColors[0])
  );
}

// Kein Matt mehr möglich: nur noch die Könige, ein König mit einem Läufer oder Springer
// gegen den anderen König, oder nur noch Läufer auf Feldern einer Farbe
function hasInsufficientMaterial(board) {
  const pieces = getPiecesWithoutKings(board);
  if (pieces.length <= 1) return pieces.every(isMinorPiece);
  return areAllBishopsOnOneColor(pieces);
}

// König und Turm: hasMoved zählt mit, weil davon das Recht auf Rochade abhängt
function getPieceKey(piece) {
  if (!piece) return "-";
  const canStillCastle =
    !piece.hasMoved && (piece.type === "king" || piece.type === "rook");
  return `${piece.color[0]}${piece.type}${canStillCastle ? "*" : ""}`;
}

// Die Stellung als Text: alle 64 Felder und wer am Zug ist.
// Gleiche Stellung = gleicher Text (en passant wird vereinfacht nicht mitgezählt)
function getPositionKey(board, color) {
  return `${color}:${board.flat().map(getPieceKey).join(",")}`;
}
