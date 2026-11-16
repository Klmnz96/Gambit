// Das 3D-Brett: Felder, Messingrahmen mit Koordinaten, Sockel, Figuren und Markierungen.
// Feld (row, column) liegt bei x = column - 3.5, z = row - 3.5. Weiß sitzt bei +z.
// Liest Spielstand und Hilfsfunktionen aus den normalen Scripts (board, isSameSquare, ...).
import * as THREE from "three";
import {
  palette,
  brassMaterial,
  caseMaterial,
  focusMaterial,
  checkMaterial,
} from "./materials.js";
import { createPieceMesh } from "./pieces.js";
import { animate } from "./motion.js";

const tileHeight = 0.1;
const frameWidth = 0.6;
const frameHeight = 0.14;
const frameTop = 0.03;
const baseHeight = 0.32;
const labelSize = 0.42;
const markerHeight = 0.012;
const liftHeight = 0.18;
const knightArcHeight = 0.6;
const moveDuration = 320;

function createSquareMaterial(color, isTinted) {
  const squareColor = new THREE.Color(color);
  if (isTinted) squareColor.lerp(new THREE.Color(palette.brass), 0.45);
  return new THREE.MeshStandardMaterial({ color: squareColor, roughness: 0.8 });
}

// Je Feldfarbe normal und für den letzten Zug messingfarben getönt
const squareMaterials = {
  light: createSquareMaterial(palette.squareLight, false),
  lightTinted: createSquareMaterial(palette.squareLight, true),
  dark: createSquareMaterial(palette.squareDark, false),
  darkTinted: createSquareMaterial(palette.squareDark, true),
};

const discGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.025, 40);
const ringGeometry = new THREE.TorusGeometry(0.42, 0.035, 12, 64).rotateX(Math.PI / 2);
const labelGeometry = new THREE.PlaneGeometry(labelSize, labelSize);
const labelTextures = new Map();

const squareMeshes = [];
const pieceMeshes = Array.from({ length: 8 }, () => Array(8).fill(null));
const squaresGroup = new THREE.Group();
const piecesGroup = new THREE.Group();
const markersGroup = new THREE.Group();
let focusFrame = null;
let lastSeenMove = null;

function placeOnSquare(object, row, column, height) {
  object.position.set(column - 3.5, height, row - 3.5);
}

function setSquareData(object, row, column) {
  object.userData.row = row;
  object.userData.column = column;
}

// Gleiche Regel wie in 2D: gerade Summe = helles Feld
function getSquareMaterial(row, column, isTinted) {
  const name = (row + column) % 2 === 0 ? "light" : "dark";
  return squareMaterials[isTinted ? `${name}Tinted` : name];
}

function createSquares() {
  const geometry = new THREE.BoxGeometry(1, tileHeight, 1);
  for (let row = 0; row < 8; row++) {
    squareMeshes.push([]);
    for (let column = 0; column < 8; column++) {
      const mesh = new THREE.Mesh(geometry, getSquareMaterial(row, column, false));
      placeOnSquare(mesh, row, column, -tileHeight / 2);
      setSquareData(mesh, row, column);
      mesh.receiveShadow = true;
      squareMeshes[row].push(mesh);
      squaresGroup.add(mesh);
    }
  }
}

function createFrameSide(side) {
  const geometry = new THREE.BoxGeometry(side.width, frameHeight, side.depth);
  const mesh = new THREE.Mesh(geometry, brassMaterial);
  mesh.position.set(side.x, frameTop - frameHeight / 2, side.z);
  mesh.receiveShadow = true;
  return mesh;
}

// Messingrahmen aus vier Leisten: vorn und hinten über die ganze Breite, links und rechts dazwischen
function createFrame(group) {
  const outer = 8 + frameWidth * 2;
  const offset = 4 + frameWidth / 2;
  const sides = [
    { x: 0, z: offset, width: outer, depth: frameWidth },
    { x: 0, z: -offset, width: outer, depth: frameWidth },
    { x: offset, z: 0, width: frameWidth, depth: 8 },
    { x: -offset, z: 0, width: frameWidth, depth: 8 },
  ];
  sides.forEach((side) => group.add(createFrameSide(side)));
}

function createBase() {
  const size = 8 + frameWidth * 2 + 0.3;
  const base = new THREE.Mesh(new THREE.BoxGeometry(size, baseHeight, size), caseMaterial);
  base.position.y = frameTop - frameHeight - baseHeight / 2;
  base.receiveShadow = true;
  return base;
}

// Ein Buchstabe oder eine Zahl als Bild, wie in das Messing graviert
function createLabelTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.fillStyle = palette.engraving;
  context.font = '700 88px "Archivo", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 64, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function getLabelTexture(text) {
  if (!labelTextures.has(text)) labelTextures.set(text, createLabelTexture(text));
  return labelTextures.get(text);
}

// Flach auf dem Rahmen liegend; rotation = Math.PI dreht die Schrift für die Seite von Schwarz
function createLabel(text, x, z, rotation) {
  const material = new THREE.MeshBasicMaterial({
    map: getLabelTexture(text),
    transparent: true,
    depthWrite: false,
  });
  const label = new THREE.Mesh(labelGeometry, material);
  label.rotation.set(-Math.PI / 2, 0, rotation);
  label.position.set(x, frameTop + 0.002, z);
  return label;
}

// a-h vorn und hinten, 1-8 links und rechts; jede Seite lesbar für den Spieler, der dort sitzt
function createLabels(group) {
  const offset = 4 + frameWidth / 2;
  fileLetters.forEach((letter, column) => {
    group.add(createLabel(letter, column - 3.5, offset, 0));
    group.add(createLabel(letter, column - 3.5, -offset, Math.PI));
  });
  for (let row = 0; row < 8; row++) {
    group.add(createLabel(String(8 - row), -offset, row - 3.5, 0));
    group.add(createLabel(String(8 - row), offset, row - 3.5, Math.PI));
  }
}

function createSquareOutline(halfSize) {
  return new THREE.Shape([
    new THREE.Vector2(-halfSize, -halfSize),
    new THREE.Vector2(halfSize, -halfSize),
    new THREE.Vector2(halfSize, halfSize),
    new THREE.Vector2(-halfSize, halfSize),
  ]);
}

// Dunkler Rahmen um das Feld, das per Tastatur fokussiert ist
function createFocusFrame() {
  const outline = createSquareOutline(0.5);
  outline.holes.push(createSquareOutline(0.43));
  const frame = new THREE.Mesh(new THREE.ShapeGeometry(outline), focusMaterial);
  frame.rotation.x = -Math.PI / 2;
  frame.visible = false;
  return frame;
}

export function createBoard(scene) {
  const frameGroup = new THREE.Group();
  createSquares();
  createFrame(frameGroup);
  createLabels(frameGroup);
  frameGroup.add(createBase());
  focusFrame = createFocusFrame();
  scene.add(squaresGroup, frameGroup, piecesGroup, markersGroup, focusFrame);
}

// Worauf man klicken kann: Felder und Figuren
export function getPickTargets() {
  return [squaresGroup, piecesGroup];
}

function addPiece(piece, row, column) {
  const mesh = createPieceMesh(piece);
  placeOnSquare(mesh, row, column, 0);
  setSquareData(mesh, row, column);
  piecesGroup.add(mesh);
  return mesh;
}

function isSamePiece(mesh, piece) {
  return mesh.userData.type === piece.type && mesh.userData.color === piece.color;
}

// Steht auf dem Feld schon die richtige Figur? Sonst alte entfernen und passende aufstellen
function matchPiece(piece, row, column) {
  const mesh = pieceMeshes[row][column];
  if (mesh && piece && isSamePiece(mesh, piece)) return;
  if (mesh) piecesGroup.remove(mesh);
  pieceMeshes[row][column] = piece ? addPiece(piece, row, column) : null;
}

// Geschlagene Figur sinkt ins Brett und verschwindet
function sinkPiece(mesh) {
  setSquareData(mesh, -1, -1);
  const onUpdate = (progress) => {
    mesh.position.y = -progress * 0.9;
    mesh.scale.setScalar(1 - progress * 0.4);
  };
  animate(moveDuration, onUpdate, () => piecesGroup.remove(mesh));
}

// Figur gleitet ins Ziel; der Springer springt in einem Bogen
function slidePiece(mesh, move) {
  const start = mesh.position.clone();
  const end = new THREE.Vector3(move.toColumn - 3.5, 0, move.toRow - 3.5);
  const arcHeight = mesh.userData.type === "knight" ? knightArcHeight : 0;
  animate(moveDuration, (progress) => {
    mesh.position.lerpVectors(start, end, progress);
    mesh.position.y += Math.sin(progress * Math.PI) * arcHeight;
  });
}

function playMove(move) {
  const mesh = pieceMeshes[move.fromRow][move.fromColumn];
  if (!mesh) return;
  const captured = pieceMeshes[move.toRow][move.toColumn];
  if (captured) sinkPiece(captured);
  pieceMeshes[move.toRow][move.toColumn] = mesh;
  pieceMeshes[move.fromRow][move.fromColumn] = null;
  setSquareData(mesh, move.toRow, move.toColumn);
  slidePiece(mesh, move);
}

// Gewählte Figur leicht anheben, alle anderen stehen auf dem Brett
function liftSelected(selected) {
  pieceMeshes.flat().forEach((mesh) => {
    if (!mesh) return;
    const { row, column } = mesh.userData;
    mesh.position.y = isSameSquare(selected, row, column) ? liftHeight : 0;
  });
}

// Figuren an den Spielstand anpassen; ein neuer Zug wird vorher als Bewegung abgespielt
export function syncPieces(boardState, move, selected) {
  if (move && move !== lastSeenMove) playMove(move);
  lastSeenMove = move;
  liftSelected(selected);
  boardState.forEach((boardRow, row) => {
    boardRow.forEach((piece, column) => matchPiece(piece, row, column));
  });
}

// Nach dem Umschalten aus 2D: Stand übernehmen, ohne den letzten Zug nachzuspielen
export function skipMoveAnimation(move) {
  lastSeenMove = move;
}

function createMarker(geometry, square, material = brassMaterial) {
  const marker = new THREE.Mesh(geometry, material);
  placeOnSquare(marker, square.row, square.column, markerHeight);
  return marker;
}

// Messingscheibe = erlaubtes Feld, Messingring = Schlagen oder gewählte Figur,
// roter Ring = König im Schach
export function updateMarkers(selected, legalTargets, boardState, checkedKing) {
  markersGroup.clear();
  legalTargets.forEach((square) => {
    const isCapture = Boolean(boardState[square.row][square.column]);
    markersGroup.add(createMarker(isCapture ? ringGeometry : discGeometry, square));
  });
  if (checkedKing) markersGroup.add(createMarker(ringGeometry, checkedKing, checkMaterial));
  if (selected) markersGroup.add(createMarker(ringGeometry, selected));
}

// Start- und Zielfeld des letzten Zugs messingfarben tönen (isLastMoveSquare aus script.js)
export function updateLastMove() {
  squareMeshes.forEach((rowMeshes, row) => {
    rowMeshes.forEach((mesh, column) => {
      mesh.material = getSquareMaterial(row, column, isLastMoveSquare(row, column));
    });
  });
}

export function updateFocus(square) {
  focusFrame.visible = square !== null;
  if (square) placeOnSquare(focusFrame, square.row, square.column, markerHeight / 2);
}
