// Startpunkt: Spiel aufbauen, Klicks verarbeiten, Spielmodus wählen

let board = [];
let currentColor = "white";
let selectedSquare = null; // { row, column } der gewählten Figur oder null
let lastMove = null; // { fromRow, fromColumn, toRow, toColumn } oder null
let legalSquares = []; // erlaubte Zielfelder der gewählten Figur
let viewMode = loadViewMode(); // "2d" oder "3d"
let view3d = null; // die 3D-Ansicht, sobald sie sich angemeldet hat
let gameStatus = "playing"; // "playing", "check", "checkmate" oder "stalemate"
let pendingPromotion = null; // Zielfeld { row, column }, solange das Umwandlungs-Fenster offen ist
let trainerSettings = loadTrainerSettings(); // Tipps pro Spieler: { white: true, black: false }
let moveList = []; // alle Züge der Partie in Notation: ["e4", "e5", "Sf3", ...]
let halfMoveClock = 0; // Halbzüge seit dem letzten Bauernzug oder Schlagen (50-Züge-Regel)
let positionCounts = {}; // wie oft jede Stellung schon auf dem Brett stand (Wiederholung)
let gameMode = loadGameMode(); // "twoPlayers" oder "computer"
let computerTimer = null; // läuft, während der Computer "nachdenkt"
const computerColor = "black"; // gegen den Computer spielst du immer Weiß

function isSameSquare(square, row, column) {
  return square !== null && square.row === row && square.column === column;
}

function isLegalSquare(row, column) {
  return legalSquares.some((legalSquare) =>
    isSameSquare(legalSquare, row, column),
  );
}

// Spielt bei dieser Farbe der Computer?
function isComputerColor(color) {
  return gameMode === "computer" && color === computerColor;
}

function isComputerTurn() {
  return isComputerColor(currentColor);
}

// Name auf dem Zifferblatt und in den Texten: "Weiß", "Schwarz" oder "Computer"
function getPlayerName(color) {
  return isComputerColor(color) ? "Computer" : playerNames[color];
}

// Von welcher Seite aus schaut man aufs Brett? Gegen den Computer immer von Weiß aus
function getViewColor() {
  return gameMode === "computer"
    ? getOpponentColor(computerColor)
    : currentColor;
}

// Hat der Spieler am Zug die Tipps eingeschaltet?
function isTrainerOn() {
  return trainerSettings[currentColor];
}

// Erlaubte Felder werden nur gezeigt (und vorgelesen), wenn die Tipps an sind
function isVisibleLegalSquare(row, column) {
  return isTrainerOn() && isLegalSquare(row, column);
}

function getVisibleLegalSquares() {
  return isTrainerOn() ? legalSquares : [];
}

function isDraw() {
  return drawStatuses.includes(gameStatus);
}

function isGameOver() {
  return gameStatus === "checkmate" || isDraw();
}

// Darf man diese Figur gerade anklicken? Eigene Figur, Partie läuft, und kein Computer am Zug
function isMovablePiece(piece) {
  return isOwnPiece(piece, currentColor) && !isGameOver() && !isComputerTurn();
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
  if (isMovablePiece(piece)) stateClasses.push("is-movable");
  if (isSameSquare(selectedSquare, row, column))
    stateClasses.push("is-selected");
  if (isVisibleLegalSquare(row, column))
    stateClasses.push(piece ? "is-legal is-capture" : "is-legal");
  if (isLastMoveSquare(row, column)) stateClasses.push("is-last-move");
  if (isSameSquare(getCheckedKingSquare(), row, column))
    stateClasses.push("is-check");
  return stateClasses.join(" ");
}

// Für Screenreader: Zustand ans Feld-Label hängen ("e4, leer, erlaubtes Ziel")
function getSquareStateText(row, column) {
  let stateText = "";
  if (isSameSquare(selectedSquare, row, column)) stateText += ", ausgewählt";
  if (isVisibleLegalSquare(row, column)) stateText += ", erlaubtes Ziel";
  if (isSameSquare(getCheckedKingSquare(), row, column))
    stateText += ", im Schach";
  return stateText;
}

function renderBoard() {
  const boardElement = document.querySelector("#board");
  let squaresHtml = "";

  board.forEach((boardRow, row) => {
    boardRow.forEach((piece, column) => {
      const stateClasses = getSquareStateClasses(row, column, piece);
      const label = `${getSquareLabel(row, column, piece)}${getSquareStateText(row, column)}`;
      squaresHtml += buildSquare(row, column, piece, stateClasses, label);
    });
  });

  boardElement.innerHTML = squaresHtml;
}

// ["e4", "e5", "Sf3"] -> [["e4", "e5"], ["Sf3"]]: je ein Zug von Weiß und Schwarz
function getMovePairs() {
  const movePairs = [];
  for (let index = 0; index < moveList.length; index += 2) {
    movePairs.push(moveList.slice(index, index + 2));
  }
  return movePairs;
}

// Protokoll neu bauen und ans Ende scrollen, damit der neueste Zug sichtbar ist
function renderMoveList() {
  const moveListElement = document.querySelector("#move-list");
  moveListElement.innerHTML = getMovePairs()
    .map((movePair, index) =>
      buildMovePair(index + 1, movePair[0], movePair[1] ?? ""),
    )
    .join("");
  moveListElement.scrollLeft = moveListElement.scrollWidth;
}

// Was ist gewählt, und wohin darf die Figur?
function getSelectionText() {
  const piece = board[selectedSquare.row][selectedSquare.column];
  const squareName = getSquareName(selectedSquare.row, selectedSquare.column);
  const selectionText = `Gewählt: ${colorNames[piece.color]}er ${pieceNames[piece.type]} auf ${squareName}.`;

  if (legalSquares.length === 0) {
    return `${selectionText} Gerade ist kein Zug möglich: Der Weg ist versperrt, oder der Zug würde deinen eigenen König ins Schach stellen. ${pieceRules[piece.type]}`;
  }
  return `${selectionText} ${pieceRules[piece.type]} Die Messingpunkte zeigen die erlaubten Felder.`;
}

// Ende der Partie: bei Schachmatt gewinnt der Spieler, der nicht am Zug ist
function getGameOverText() {
  if (isDraw()) return statusTexts[gameStatus];
  const winner = getPlayerName(getOpponentColor(currentColor));
  return `${statusTexts.checkmate} ${winner} gewinnt die Partie.`;
}

// Text in der Trainer-Zeile des Spielers am Zug
function getTrainerText() {
  if (isGameOver()) return getGameOverText();
  if (isComputerTurn()) return "Der Computer überlegt …";
  if (!isTrainerOn()) {
    return gameStatus === "check" ? "Schach!" : "Du bist am Zug.";
  }
  const checkText = gameStatus === "check" ? `${statusTexts.check} ` : "";
  if (!selectedSquare) return `${checkText}Klicke eine deiner Figuren an.`;
  return `${checkText}${getSelectionText()}`;
}

// Text in der Trainer-Zeile des wartenden Spielers
// Hinweis zum eigenen letzten Zug, wenn er ein Sonderzug war
function getSpecialMoveText() {
  if (lastMove?.isPromotion) {
    return `${statusTexts.promotion} ${promotionNames[lastMove.promotionType]}. `;
  }
  if (lastMove?.isCastling) return `${statusTexts.castling} `;
  if (lastMove?.isEnPassant) return `${statusTexts.enPassant} `;
  return "";
}

function getWaitingText() {
  if (isGameOver()) return getGameOverText();
  return `${getSpecialMoveText()}Wartet auf ${getPlayerName(currentColor)}.`;
}

// Kleine Zeile im Ziffernblatt: am Zug, wartet oder das Ergebnis
function getDialStateText(color) {
  if (isDraw()) return "remis";
  if (gameStatus === "checkmate") {
    return color === currentColor ? "verloren" : "gewonnen";
  }
  return color === currentColor ? "am Zug" : "wartet";
}

// Das Gehäuse des Spielers am Zug ist angeschaltet, das andere wartet
function renderClocks() {
  ["white", "black"].forEach((color) => {
    const clockElement = document.querySelector(`#clock-${color}`);
    const isActive = color === currentColor;

    clockElement.classList.toggle("is-active", isActive);
    clockElement.querySelector(".dial-player").textContent =
      getPlayerName(color);
    clockElement.querySelector(".dial-state").textContent =
      getDialStateText(color);
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

// Tipps-Schalter in beiden Gehäusen: Zustand zeigen
function renderTrainerToggles() {
  document.querySelectorAll(".trainer-toggle").forEach((button) => {
    const isOn = trainerSettings[button.dataset.color];
    button.setAttribute("aria-pressed", String(isOn));
    button.hidden = isComputerColor(button.dataset.color);
  });
}

// Nur die Zeile des Spielers am Zug vorlesen und nur wenn sie sich ändert
function announce(text) {
  const announcer = document.querySelector("#announcer");
  if (announcer.textContent !== text) announcer.textContent = text;
}

// Das 2D-Brett wird immer gebaut (Tastatur, Screenreader), die 3D-Szene nur wenn aktiv
function render() {
  renderBoard();
  renderClocks();
  renderMoveList();
  if (isView3dActive()) view3d.render();
  renderTrainerToggles();
  announce(getTrainerText());
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

function toggleTrainer(color) {
  trainerSettings[color] = !trainerSettings[color];
  saveTrainerSettings(trainerSettings);
  render();
}

function initTrainerToggles() {
  document.querySelectorAll(".trainer-toggle").forEach((button) => {
    button.addEventListener("click", () => toggleTrainer(button.dataset.color));
  });
}

// Alles auf Anfang: neues Brett, Weiß beginnt, nichts gewählt
function resetGame() {
  clearTimeout(computerTimer);
  moveList = [];
  halfMoveClock = 0;
  positionCounts = {};
  board = createStartBoard();
  currentColor = "white";
  selectedSquare = null;
  lastMove = null;
  legalSquares = [];
  gameStatus = "playing";
  countPosition();
  render();
}

// Fenster "Neue Partie": Hinweis nur, wenn gerade eine Partie läuft
function openModeDialog() {
  const isRunning = lastMove !== null && !isGameOver();
  document.querySelector("#mode-warning").hidden = !isRunning;
  document.querySelector("#mode-dialog").showModal();
}

// Modus gewählt: merken und neue Partie starten
function startNewGame(mode) {
  document.querySelector("#mode-dialog").close();
  gameMode = mode;
  saveGameMode(mode);
  resetGame();
}

function initModeDialog() {
  const dialog = document.querySelector("#mode-dialog");
  dialog.querySelectorAll(".mode-option").forEach((button) => {
    button.addEventListener("click", () => startNewGame(button.dataset.mode));
  });
  dialog
    .querySelector(".mode-cancel")
    .addEventListener("click", () => dialog.close());
}

function initNewGameButton() {
  document.querySelector("#new-game").addEventListener("click", openModeDialog);
}

function switchTurn() {
  currentColor = getOpponentColor(currentColor);
}

// Eigene Figur angeklickt: auswählen, oder abwählen wenn sie schon gewählt war
function toggleSelection(row, column) {
  selectedSquare = isSameSquare(selectedSquare, row, column)
    ? null
    : { row: row, column: column };
  legalSquares = selectedSquare
    ? getLegalMoves(board, row, column, lastMove)
    : [];
}

// Welche Sonderzüge stecken in diesem Zug? (vor dem Ziehen prüfen)
function getSpecialMoveFlags(piece, fromColumn, row, column) {
  return {
    isPromotion: isPromotionSquare(piece, row),
    isCastling: isCastlingMove(piece, fromColumn, column),
    isEnPassant: isEnPassantCapture(board, piece, fromColumn, row, column),
  };
}

// Den Zug merken, bevor er ausgeführt wird (danach ist der Bauer schon umgewandelt)
function createMoveRecord(row, column, promotionType) {
  const piece = board[selectedSquare.row][selectedSquare.column];
  const fromColumn = selectedSquare.column;
  return {
    fromRow: selectedSquare.row,
    fromColumn: fromColumn,
    toRow: row,
    toColumn: column,
    promotionType: promotionType,
    ...getSpecialMoveFlags(piece, fromColumn, row, column),
  };
}

// 50-Züge-Regel: zählt Halbzüge, ein Bauernzug oder Schlagen setzt wieder auf 0.
// Vor dem Ziehen aufrufen, danach ist die geschlagene Figur schon weg
function updateHalfMoveClock(move) {
  const piece = board[move.fromRow][move.fromColumn];
  const isReset = piece.type === "pawn" || isCaptureMove(board, move);
  halfMoveClock = isReset ? 0 : halfMoveClock + 1;
}

// Aktuelle Stellung mitzählen und zurückgeben, wie oft sie jetzt schon da war
function countPosition() {
  const positionKey = getPositionKey(board, currentColor);
  positionCounts[positionKey] = (positionCounts[positionKey] ?? 0) + 1;
  return positionCounts[positionKey];
}

// Welches Remis greift gerade? null, wenn keins
function getDrawStatus(repetitionCount) {
  if (hasInsufficientMaterial(board)) return "insufficientMaterial";
  if (halfMoveClock >= 100) return "fiftyMoves";
  if (repetitionCount >= 3) return "repetition";
  return null;
}

// Remis-Regeln nach dem Zug prüfen. Matt und Patt gehen vor
function applyDrawRules(repetitionCount) {
  if (isGameOver()) return;
  gameStatus = getDrawStatus(repetitionCount) ?? gameStatus;
}

// Gewählte Figur auf das Zielfeld ziehen, Zug merken und ins Protokoll schreiben, Spieler wechseln
function moveSelectedPiece(row, column, promotionType) {
  const move = createMoveRecord(row, column, promotionType);
  const notation = getMoveNotation(board, move, lastMove);
  updateHalfMoveClock(move);
  movePiece(board, move.fromRow, move.fromColumn, row, column, promotionType);
  lastMove = move;
  selectedSquare = null;
  legalSquares = [];
  switchTurn();
  gameStatus = getGameStatus(board, currentColor, lastMove);
  moveList.push(`${notation}${checkSigns[gameStatus]}`);
  applyDrawRules(countPosition());
  scheduleComputerMove();
}

// Der Computer zieht wie ein Spieler: Figur wählen, dann aufs Zielfeld.
// Erreicht sein Bauer die letzte Reihe, nimmt er immer die Dame
function makeComputerMove() {
  const move = chooseComputerMove(board, currentColor, lastMove);
  selectedSquare = { row: move.fromRow, column: move.fromColumn };
  moveSelectedPiece(move.toRow, move.toColumn, "queen");
  render();
}

// Ist jetzt der Computer dran, zieht er nach einer kurzen Pause (sonst wirkt es zu abrupt)
function scheduleComputerMove() {
  if (!isComputerTurn() || isGameOver()) return;
  computerTimer = setTimeout(makeComputerMove, 700);
}

// Umwandlungs-Fenster öffnen; gezogen wird erst, wenn eine Figur gewählt ist
function openPromotionDialog(row, column) {
  pendingPromotion = { row: row, column: column };
  const dialog = document.querySelector("#promotion-dialog");
  dialog.dataset.color = currentColor;
  dialog.showModal();
}

// Bauer auf die letzte Reihe: erst die Figur wählen lassen, sonst direkt ziehen
function startMove(row, column) {
  const piece = board[selectedSquare.row][selectedSquare.column];
  if (isPromotionSquare(piece, row)) openPromotionDialog(row, column);
  else moveSelectedPiece(row, column);
}

// Figur im Fenster gewählt: Fenster zu, Zug ausführen, Fokus zurück aufs Brett
function choosePromotion(type) {
  const { row, column } = pendingPromotion;
  document.querySelector("#promotion-dialog").close();
  pendingPromotion = null;
  moveSelectedPiece(row, column, type);
  render();
  focusSquare(row, column);
}

// Escape schließt das Fenster ohne Zug: die Figur bleibt gewählt
function initPromotionDialog() {
  const dialog = document.querySelector("#promotion-dialog");
  dialog.addEventListener("cancel", () => (pendingPromotion = null));
  dialog.querySelectorAll(".promotion-option").forEach((button) => {
    button.addEventListener("click", () =>
      choosePromotion(button.dataset.type),
    );
  });
}

// Klicks auf alle anderen Felder werden ignoriert
function handleSquareClick(row, column) {
  if (isGameOver() || isComputerTurn()) return;
  const piece = board[row][column];

  if (isOwnPiece(piece, currentColor)) {
    toggleSelection(row, column);
  } else if (isLegalSquare(row, column)) {
    startMove(row, column);
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
  initBoardClicks();
  initViewToggle();
  initTrainerToggles();
  initNewGameButton();
  initModeDialog();
  initPromotionDialog();
  resetGame();
}

init();
