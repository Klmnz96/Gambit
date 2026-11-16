// Startpunkt: Spiel aufbauen, Klicks verarbeiten, Spielmodus wählen

let board = [];
let currentColor = "white";
let selectedSquare = null; // { row, column } der gewählten Figur oder null
let lastMove = null; // { fromRow, fromColumn, toRow, toColumn } oder null
let legalSquares = []; // erlaubte Zielfelder der gewählten Figur
let viewMode = loadViewMode(); // "2d" oder "3d"
let view3d = null; // die 3D-Ansicht, sobald sie sich angemeldet hat
let gameStatus = "playing"; // "playing", "check", "checkmate" oder "stalemate"

function isSameSquare(square, row, column) {
  return square !== null && square.row === row && square.column === column;
}

function isLegalSquare(row, column) {
  return legalSquares.some((legalSquare) =>
    isSameSquare(legalSquare, row, column),
  );
}

function isGameOver() {
  return gameStatus === "checkmate" || gameStatus === "stalemate";
}

// Feld des Königs am Zug, wenn er im Schach steht, sonst null (rot markiert in 2D und 3D)
function getCheckedKingSquare() {
  if (gameStatus !== "check" && gameStatus !== "checkmate") return null;
  return findKing(board, currentColor);
}

function isLastMoveSquare(row, column) {
  if (!lastMove) return false;
  const isFrom = lastMove.fromRow === row && lastMove.fromColumn === column;
  const isTo = lastMove.toRow === row && lastMove.toColumn === column;
  return isFrom || isTo;
}

// Zustands-Klassen für ein Feld: anklickbar, ausgewählt, erlaubt, letzter Zug
function getSquareStateClasses(row, column, piece) {
  const stateClasses = [];
  if (isOwnPiece(piece, currentColor) && !isGameOver())
    stateClasses.push("is-movable");
  if (isSameSquare(selectedSquare, row, column))
    stateClasses.push("is-selected");
  if (isLegalSquare(row, column)) stateClasses.push("is-legal");
  if (isLegalSquare(row, column) && piece) stateClasses.push("is-capture");
  if (isLastMoveSquare(row, column)) stateClasses.push("is-last-move");
  if (isSameSquare(getCheckedKingSquare(), row, column))
    stateClasses.push("is-check");
  return stateClasses.join(" ");
}

function renderBoard() {
  const boardElement = document.querySelector("#board");
  let squaresHtml = "";

  board.forEach((boardRow, row) => {
    boardRow.forEach((piece, column) => {
      const stateClasses = getSquareStateClasses(row, column, piece);
      squaresHtml += buildSquare(row, column, piece, stateClasses);
    });
  });

  boardElement.innerHTML = squaresHtml;
}

// Was ist gewählt, und wohin darf die Figur?
function getSelectionText() {
  const piece = board[selectedSquare.row][selectedSquare.column];
  const squareName = getSquareName(selectedSquare.row, selectedSquare.column);
  const selectionText = `Gewählt: ${colorNames[piece.color]}er${pieceNames[piece.type]} auf ${squareName}.`;

  if (legalSquares.length === 0) {
    return `${selectionText} Gerade ist kein Zug möglich: Der Weg ist versperrt, oder der Zug würde deinen eigenen König ins Schach stellen. ${pieceRules[piece.type]}`;
  }
  return `${selectionText} ${pieceRules[piece.type]} Die Messingpunkte zeigen die erlaubten Felder.`;
}

// Ende der Partie: bei Schachmatt gewinnt der Spieler, der nicht am Zug ist
function getGameOverText() {
  if (gameStatus === "stalemate") return statusTexts.stalemate;
  const winner = playerNames[getOpponentColor(currentColor)];
  return `${statusTexts.checkmate} ${winner} gewinnt die Partie.`;
}

// Text in der Trainer-Zeile des Spielers am Zug
function getTrainerText() {
  if (isGameOver()) return getGameOverText();
  const checkText = gameStatus === "check" ? `${statusTexts.check} ` : "";
  if (!selectedSquare) return `${checkText} Klicke eine deiner Figuren an.`;
  return `${checkText}${getSelectionText()}`;
}

// Text in der Trainer-Zeile des wartenden Spielers
function getWaitingText() {
  if (isGameOver()) return getGameOverText();
  return `Wartet auf ${playerNames[currentColor]}.`;
}

// Das Gehäuse des Spielers am Zug ist angeschaltet, das andere wartet
function renderClocks() {
  ["white", "black"].forEach((color) => {
    const clockElement = document.querySelector(`#clock-${color}`);
    const isActive = color === currentColor;

    clockElement.classList.toggle("is-active", isActive);
    clockElement.querySelector(".dial-state").textContent = isActive
      ? "am Zug"
      : "wartet";
    clockElement.querySelector(".trainer-line").textContent = isActive
      ? getTrainerText()
      : getWaitingText();
  });
}

// Nach dem Neuzeichnen ist das alte Feld weg, Fokus zurück aufs angeklickte Feld (Tastatur)
function focusSquare(row, column) {
  const squareElement = document.querySelector(
    `.square[data-row="${row}"][data-column="${column}"]`,
  );
  squareElement.focus();
}

function isView3dActive() {
  return viewMode === "3d" && view3d !== null;
}

// Das 2D-Brett wird immer gebaut (Tastatur, Screenreader), die 3D-Szene nur wenn aktiv
function render() {
  renderBoard();
  renderClocks();
  if (isView3dActive()) view3d.render();
}

// Die 3D-Ansicht (script/three/view.js) meldet sich hier an, sobald sie geladen ist
function registerView3d(view) {
  view3d = view;
  document.querySelector("#view-toggle").hidden = false;
  applyViewMode();
}

// Ansicht sichtbar machen: Klasse am Spielfeld, Schalterzustand, 3D zeigen oder verstecken
function applyViewMode() {
  const isActive = isView3dActive();
  document.querySelector("#main").classList.toggle("is-3d", isActive);
  document
    .querySelector("#view-toggle")
    .setAttribute("aria-pressed", String(isActive));
  if (isActive) view3d.show();
  else view3d.hide();
  render();
}

function setViewMode(mode) {
  viewMode = mode;
  saveViewMode(mode);
  applyViewMode();
}

function initViewToggle() {
  document.querySelector("#view-toggle").addEventListener("click", () => {
    setViewMode(viewMode === "3d" ? "2d" : "3d");
  });
}

function switchTurn() {
  currentColor = getOpponentColor(currentColor);
}

// Eigene Figur angeklickt: auswählen, oder abwählen wenn sie schon gewählt war
function toggleSelection(row, column) {
  selectedSquare = isSameSquare(selectedSquare, row, column)
    ? null
    : { row: row, column: column };
  legalSquares = selectedSquare ? getLegalMoves(board, row, column) : [];
}

// Gewählte Figur auf das Zielfeld ziehen, Zug merken, Spieler wechseln
function moveSelectedPiece(row, column) {
  movePiece(board, selectedSquare.row, selectedSquare.column, row, column);
  lastMove = {
    fromRow: selectedSquare.row,
    fromColumn: selectedSquare.column,
    toRow: row,
    toColumn: column,
  };
  selectedSquare = null;
  legalSquares = [];
  switchTurn();
  gameStatus = getGameStatus(board, currentColor);
}

// Klicks auf alle anderen Felder werden ignoriert
function handleSquareClick(row, column) {
  if (isGameOver()) return;
  const piece = board[row][column];

  if (isOwnPiece(piece, currentColor)) {
    toggleSelection(row, column);
  } else if (isLegalSquare(row, column)) {
    moveSelectedPiece(row, column);
  }
  render();
  focusSquare(row, column);
}

// Ein Listener für das ganze Brett: die Felder werden bei jedem render() neu gebaut
function initBoardClicks() {
  const boardElement = document.querySelector("#board");

  boardElement.addEventListener("click", (event) => {
    const squareElement = event.target.closest(".square");
    if (!squareElement) return;

    const row = Number(squareElement.dataset.row);
    const column = Number(squareElement.dataset.column);
    handleSquareClick(row, column);
  });
}

function init() {
  board = createStartBoard();
  initBoardClicks();
  initViewToggle();
  render();
}

init();
