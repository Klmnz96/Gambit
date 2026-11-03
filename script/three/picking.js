// Klicks in der 3D-Szene: welches Feld wurde getroffen?
// Ein unsichtbarer Strahl von der Maus in die Szene (Raycasting) findet Feld oder Figur.
import * as THREE from "three";

// Bewegt sich der Zeiger mehr als 5px, war es Drehen und kein Klick
const clickTolerance = 5;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Zeigerposition in Werte von -1 bis 1 umrechnen, wie Three.js sie braucht
function setPointer(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// Vom getroffenen Teil nach oben laufen, bis ein Objekt mit Feld-Angabe kommt
function findSquareData(object) {
  for (let current = object; current; current = current.parent) {
    if (current.userData.row >= 0) return current.userData;
  }
  return null;
}

function pickSquare(event, canvas, camera, targets) {
  setPointer(event, canvas);
  raycaster.setFromCamera(pointer, camera);
  for (const hit of raycaster.intersectObjects(targets, true)) {
    const square = findSquareData(hit.object);
    if (square) return square;
  }
  return null;
}

function hasMovedTooFar(start, event) {
  const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
  return distance > clickTolerance;
}

function updateCursor(canvas, square, isClickable) {
  const canClick = square !== null && isClickable(square.row, square.column);
  canvas.style.cursor = canClick ? "pointer" : "grab";
}

// handlers: onSquare(row, column) beim Klick, isClickable(row, column) für den Hand-Cursor
export function initPicking(canvas, camera, targets, handlers) {
  let downPosition = null;
  canvas.addEventListener("pointerdown", (event) => {
    downPosition = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!downPosition || hasMovedTooFar(downPosition, event)) return;
    const square = pickSquare(event, canvas, camera, targets);
    if (square) handlers.onSquare(square.row, square.column);
  });
  canvas.addEventListener("pointermove", (event) => {
    updateCursor(canvas, pickSquare(event, canvas, camera, targets), handlers.isClickable);
  });
}
