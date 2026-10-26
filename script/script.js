// Startpunkt: Spiel aufbauen, Klicks verarbeiten, Spielmodus wählen

let board = [];
let currentColor = "white";
let selectedSquare = null; // { row, column } der gewählten Figur oder null
let lastMove = null; // { fromRow, fromColumn, toRow, toColumn } oder null

function isSameSquare(square, row, column) {
  return square !== null && square.row === row && square.column === column;
}

function isLastMoveSquare(row, column) {
  if (!lastMove) return false;
  const isFrom = lastMove.fromRow === row && lastMove.fromColumn === column;
  const isTo = lastMove.toRow === row && lastMove.toColumn === column;
  return isFrom || isTo;
}

// Zustands-Klassen für ein Feld: anklickbar, ausgewählt, letzter Zug
function getSquareStateClasses(row, column, piece) {
  const stateClasses = [];
  if (piece && piece.color === currentColor) stateClasses.push("is-movable");
  if (isSameSquare(selectedSquare, row, column))
    stateClasses.push("is-selected");
  if (isLastMoveSquare(row, column)) stateClasses.push("is-last-move");
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

// Text in der Trainer-Zeile des Spielers am Zug
function getTrainerText() {
  if (!selectedSquare) {
    return "Klicke eine deiner Figuren an.";
  }
  const piece = board[selectedSquare.row][selectedSquare.column];
  const squareName = getSquareName(selectedSquare.row, selectedSquare.column);
  return `Gewählt: ${colorNames[piece.color]}er ${pieceNames[piece.type]} auf ${squareName}. Klicke jetzt ein Zielfeld an.`;
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
      : `Wartet auf ${playerNames[currentColor]}.`;
  });
}

// Nach dem Neuzeichnen ist das alte Feld weg, Fokus zurück aufs angeklickte Feld (Tastatur)
function focusSquare(row, column) {
  const squareElement = document.querySelector(
    `.square[data-row="${row}"][data-column="${column}"]`,
  );
  squareElement.focus();
}

function render() {
  renderBoard();
  renderClocks();
}

function switchTurn() {
  currentColor = currentColor === "white" ? "black" : "white";
}

function handleSquareClick(row, column) {
  const piece = board[row][column];

  // Eigene Figur: auswählen oder abwählen, wenn sie schon gewählt war
  if (piece && piece.color === currentColor) {
    selectedSquare = isSameSquare(selectedSquare, row, column)
      ? null
      : { row: row, column: column };
  }
  // Anderes Feld bei gewählter Figur: ziehen (Zugregeln folgen in Stufe 3)
  else if (selectedSquare) {
    movePiece(board, selectedSquare.row, selectedSquare.column, row, column);
    lastMove = {
      fromRow: selectedSquare.row,
      fromColumn: selectedSquare.column,
      toRow: row,
      toColumn: column,
    };
    selectedSquare = null;
    switchTurn();
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
  render();
}

init();
