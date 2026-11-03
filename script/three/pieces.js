// Die Figuren als 3D-Modelle, selbst gebaut.
// Die meisten Figuren sind Drehkörper: ein halbes Profil [Radius, Höhe] wird rundherum
// gedreht (LatheGeometry). Der Springer ist ein dick gemachter Pferdekopf (ExtrudeGeometry).
// Maße in Feldbreiten: 1 = ein Feld.
import * as THREE from "three";
import { palette, brassMaterial } from "./materials.js";

const latheSegments = 48;

const pieceMaterials = {
  white: new THREE.MeshPhysicalMaterial({
    color: palette.pieceWhite,
    roughness: 0.3,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  }),
  black: new THREE.MeshPhysicalMaterial({
    color: palette.pieceBlack,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  }),
};

// Gemeinsamer Sockel aller Figuren
const basePoints = [
  [0, 0],
  [0.36, 0],
  [0.37, 0.03],
  [0.36, 0.07],
  [0.31, 0.1],
  [0.29, 0.13],
];

const pawnPoints = [
  [0.22, 0.17],
  [0.15, 0.28],
  [0.115, 0.42],
  [0.19, 0.46],
  [0.19, 0.49],
  [0.1, 0.52],
];

const rookPoints = [
  [0.25, 0.17],
  [0.2, 0.26],
  [0.19, 0.6],
  [0.25, 0.64],
  [0.26, 0.78],
  [0.19, 0.78],
  [0.19, 0.74],
  [0, 0.74],
];

const bishopPoints = [
  [0.23, 0.17],
  [0.14, 0.3],
  [0.1, 0.6],
  [0.18, 0.64],
  [0.18, 0.67],
  [0.1, 0.7],
  [0.14, 0.76],
  [0.17, 0.85],
  [0.15, 0.93],
  [0.1, 1.0],
  [0.04, 1.04],
  [0, 1.05],
];

const queenPoints = [
  [0.25, 0.17],
  [0.15, 0.32],
  [0.11, 0.72],
  [0.2, 0.77],
  [0.2, 0.8],
  [0.12, 0.83],
  [0.15, 0.9],
  [0.22, 1.0],
  [0.18, 1.01],
  [0.1, 0.97],
  [0, 0.97],
];

const kingPoints = [
  [0.26, 0.17],
  [0.16, 0.33],
  [0.12, 0.84],
  [0.21, 0.89],
  [0.21, 0.92],
  [0.13, 0.95],
  [0.17, 1.05],
  [0.2, 1.12],
  [0.12, 1.14],
  [0, 1.14],
];

const knightBasePoints = [
  [0.25, 0.17],
  [0.23, 0.2],
  [0, 0.2],
];

// Pferdekopf von der Seite, Blick nach +x: [vorn/hinten, Höhe]
const knightOutline = [
  [-0.2, 0.16],
  [0.2, 0.16],
  [0.16, 0.3],
  [0.07, 0.42],
  [0.24, 0.54],
  [0.3, 0.62],
  [0.29, 0.69],
  [0.2, 0.76],
  [0.06, 0.86],
  [0.05, 0.98],
  [-0.04, 0.9],
  [-0.16, 0.84],
  [-0.24, 0.62],
  [-0.24, 0.36],
];

const knightExtrude = {
  depth: 0.2,
  bevelEnabled: true,
  bevelThickness: 0.035,
  bevelSize: 0.03,
  bevelSegments: 3,
};

function lathe(points) {
  const vectors = points.map(([radius, height]) => new THREE.Vector2(radius, height));
  return new THREE.LatheGeometry(vectors, latheSegments);
}

// Viertelkreis-Punkte für runde Köpfe: vom Startwinkel bis ganz oben (90 Grad)
function getArcPoints(centerHeight, radius, startAngle) {
  const points = [];
  for (let step = 0; step <= 10; step++) {
    const angle = startAngle + (Math.PI / 2 - startAngle) * (step / 10);
    points.push([radius * Math.cos(angle), centerHeight + radius * Math.sin(angle)]);
  }
  return points;
}

// Ein Teil einer Figur: Form plus Angabe, ob es aus Messing ist
function bodyPart(geometry) {
  return { geometry, isBrass: false };
}

function brassPart(geometry) {
  return { geometry, isBrass: true };
}

function turnedBody(points) {
  return bodyPart(lathe([...basePoints, ...points]));
}

function sphereAt(radius, x, y, z) {
  return new THREE.SphereGeometry(radius, 24, 16).translate(x, y, z);
}

function baseRing() {
  const ring = new THREE.TorusGeometry(0.315, 0.022, 10, latheSegments);
  return brassPart(ring.rotateX(Math.PI / 2).translate(0, 0.1, 0));
}

// Zinnen des Turms: sechs Blöcke rundherum
function rookMerlons() {
  const merlons = [];
  for (let index = 0; index < 6; index++) {
    const merlon = new THREE.BoxGeometry(0.13, 0.1, 0.1).translate(0, 0.83, 0.2);
    merlons.push(bodyPart(merlon.rotateY((index * Math.PI) / 3)));
  }
  return merlons;
}

// Kerbe des Läufers: schräges Messingband um die Mitra
function bishopNotch() {
  const band = new THREE.TorusGeometry(0.165, 0.014, 8, latheSegments).rotateX(Math.PI / 2);
  return brassPart(band.rotateZ(0.5).translate(0, 0.88, 0));
}

// Krone der Dame: acht Messingkugeln am Rand
function queenCrown() {
  const balls = [];
  for (let index = 0; index < 8; index++) {
    const angle = (index / 8) * Math.PI * 2;
    balls.push(brassPart(sphereAt(0.035, Math.cos(angle) * 0.2, 1.02, Math.sin(angle) * 0.2)));
  }
  return balls;
}

function kingCross() {
  const upright = new THREE.BoxGeometry(0.06, 0.24, 0.06).translate(0, 1.26, 0);
  const crossbar = new THREE.BoxGeometry(0.18, 0.06, 0.06).translate(0, 1.29, 0);
  return [brassPart(upright), brassPart(crossbar)];
}

function knightHead() {
  const outline = knightOutline.map(([forward, height]) => new THREE.Vector2(forward, height));
  const head = new THREE.ExtrudeGeometry(new THREE.Shape(outline), knightExtrude);
  return bodyPart(head.translate(0, 0, -knightExtrude.depth / 2));
}

const pieceBuilders = {
  pawn: () => [turnedBody([...pawnPoints, ...getArcPoints(0.64, 0.14, -1.07)])],
  rook: () => [turnedBody(rookPoints), ...rookMerlons()],
  knight: () => [turnedBody(knightBasePoints), knightHead()],
  bishop: () => [turnedBody(bishopPoints), bodyPart(sphereAt(0.05, 0, 1.09, 0)), bishopNotch()],
  queen: () => [turnedBody(queenPoints), bodyPart(sphereAt(0.06, 0, 1.03, 0)), ...queenCrown()],
  king: () => [turnedBody(kingPoints), ...kingCross()],
};

// Jede Form wird nur einmal gebaut und dann von allen Figuren dieser Art geteilt
const partsCache = {};

function getParts(type) {
  if (!partsCache[type]) partsCache[type] = [...pieceBuilders[type](), baseRing()];
  return partsCache[type];
}

function createPartMesh(part, color) {
  const material = part.isBrass ? brassMaterial : pieceMaterials[color];
  const mesh = new THREE.Mesh(part.geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Eine Figur als Gruppe. Der Springer schaut zur Seite, aus Sicht seines Spielers nach links
export function createPieceMesh(piece) {
  const group = new THREE.Group();
  getParts(piece.type).forEach((part) => group.add(createPartMesh(part, piece.color)));
  if (piece.type === "knight") group.rotation.y = piece.color === "white" ? Math.PI : 0;
  group.userData = { type: piece.type, color: piece.color };
  return group;
}
