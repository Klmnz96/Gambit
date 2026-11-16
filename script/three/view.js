// Startpunkt der 3D-Ansicht: baut die Szene auf und meldet sich bei script.js an.
// Liest den Spielstand (board, selectedSquare, ...) nur, geändert wird er über handleSquareClick.
import { createStage, requestRender, turnCameraTo } from "./scene.js";
import {
  createBoard,
  getPickTargets,
  syncPieces,
  skipMoveAnimation,
  updateMarkers,
  updateLastMove,
  updateFocus,
} from "./board3d.js";
import { initPicking } from "./picking.js";

const container = document.querySelector("#board-3d");
let shownColor = currentColor; // Seite, auf die die Kamera gerade schaut
let usesKeyboard = false; // zuletzt Tastatur (true) oder Maus/Finger (false) benutzt?

// Kamera drehen, wenn inzwischen der andere Spieler am Zug ist
function turnIfPlayerChanged() {
  if (currentColor === shownColor) return;
  shownColor = currentColor;
  turnCameraTo(currentColor);
}

function renderView() {
  syncPieces(board, lastMove, selectedSquare);
  updateMarkers(selectedSquare, getVisibleLegalSquares(), board, getCheckedKingSquare());
  updateLastMove();
  turnIfPlayerChanged();
  requestRender();
}

function showView() {
  skipMoveAnimation(lastMove);
  requestRender();
}

// Eigene Figur oder erlaubtes Zielfeld (nur mit Tipps sichtbar): dort zeigt der Cursor eine Hand
function isClickable(row, column) {
  return isOwnPiece(board[row][column], currentColor) || isVisibleLegalSquare(row, column);
}

// Fokusrahmen nur bei Tastatur-Bedienung, nicht nach einem Mausklick
function showFocus(element) {
  const { row, column } = element.dataset;
  updateFocus(usesKeyboard ? { row: Number(row), column: Number(column) } : null);
  requestRender();
}

// Merken, womit zuletzt bedient wurde (true = Phase "capture", also vor allen anderen Listenern)
function initInputTracking() {
  window.addEventListener("keydown", () => (usesKeyboard = true), true);
  window.addEventListener("pointerdown", () => (usesKeyboard = false), true);
}

function hideFocus() {
  updateFocus(null);
  requestRender();
}

function initFocusTracking() {
  const boardElement = document.querySelector("#board");
  boardElement.addEventListener("focusin", (event) => showFocus(event.target));
  boardElement.addEventListener("focusout", hideFocus);
}

// Archivo muss geladen sein, bevor die Koordinaten ins Messing "graviert" werden
async function loadLabelFont() {
  try {
    await document.fonts.load('700 88px "Archivo"');
  } catch {
    // Ohne Schrift nimmt die Gravur die Ersatzschrift
  }
}

async function start() {
  await loadLabelFont();
  const stage = createStage(container, currentColor);
  createBoard(stage.scene);
  const handlers = { onSquare: handleSquareClick, isClickable };
  initPicking(stage.renderer.domElement, stage.camera, getPickTargets(), handlers);
  initFocusTracking();
  initInputTracking();
  registerView3d({ render: renderView, show: showView, hide: hideFocus });
}

// Ohne WebGL wirft Three.js einen Fehler: dann bleibt es bei 2D und der Schalter versteckt
start().catch((error) => {
  console.warn("3D-Ansicht nicht verfügbar, es bleibt bei 2D.", error);
});
