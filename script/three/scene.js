// Die Bühne: Renderer, Kamera, Kamera-Steuerung und Licht.
// Gezeichnet wird nur, wenn sich etwas ändert (requestRender), nicht in einer Dauerschleife.
import * as THREE from "three";
import { OrbitControls } from "three/addons/OrbitControls.js";
import { RoomEnvironment } from "three/addons/RoomEnvironment.js";
import { palette } from "./materials.js";
import { animate, stepAnimations, hasRunningAnimations } from "./motion.js";

const fieldOfView = 32;
const cameraStart = { radius: 19, polarAngle: 0.68 };
const cameraLimits = { minPolar: 0.2, maxPolar: 1.05, minDistance: 12, maxDistance: 26 };
const turnDuration = 1000;
// Weiß sitzt bei +z (Winkel 0), Schwarz gegenüber (halbe Drehung)
const sideAngles = { white: 0, black: Math.PI };

let stage = null;
let renderPending = false;

function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(palette.background);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);
  return renderer;
}

function createCamera(color) {
  const camera = new THREE.PerspectiveCamera(fieldOfView, 1, 0.1, 100);
  const { radius, polarAngle } = cameraStart;
  camera.position.setFromSphericalCoords(radius, polarAngle, sideAngles[color]);
  camera.lookAt(0, 0, 0);
  return camera;
}

// Drehen und Zoomen mit Grenzen: nicht unter das Brett, nicht zu nah, kein Verschieben
function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minPolarAngle = cameraLimits.minPolar;
  controls.maxPolarAngle = cameraLimits.maxPolar;
  controls.minDistance = cameraLimits.minDistance;
  controls.maxDistance = cameraLimits.maxDistance;
  controls.addEventListener("change", requestRender);
  return controls;
}

// Warmes Hauptlicht von schräg oben mit weichen Schatten
function createKeyLight() {
  const light = new THREE.DirectionalLight("#fff1dc", 2.2);
  light.position.set(4, 10, 6);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  Object.assign(light.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  light.shadow.bias = -0.0004;
  return light;
}

// Umgebungsspiegelung für Glanz und Messing, dazu ein sanftes Grundlicht
function addLights(scene, renderer) {
  const environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight("#fff4e0", palette.background, 0.5));
  scene.add(createKeyLight());
}

// Im Hochformat das Sichtfeld weiten, damit das Brett auch in der Breite ganz drauf passt
function getFieldOfView(aspect) {
  if (aspect >= 1) return fieldOfView;
  const halfAngle = THREE.MathUtils.degToRad(fieldOfView / 2);
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfAngle) / aspect));
}

function resizeStage(container) {
  const { width, height } = container.getBoundingClientRect();
  if (width === 0 || height === 0) return;
  stage.renderer.setSize(width, height, false);
  stage.camera.aspect = width / height;
  stage.camera.fov = getFieldOfView(stage.camera.aspect);
  stage.camera.updateProjectionMatrix();
  requestRender();
}

export function createStage(container, color) {
  const renderer = createRenderer(container);
  const scene = new THREE.Scene();
  const camera = createCamera(color);
  const controls = createControls(camera, renderer.domElement);
  addLights(scene, renderer);
  stage = { renderer, scene, camera, controls };
  new ResizeObserver(() => resizeStage(container)).observe(container);
  return stage;
}

function renderFrame(now) {
  renderPending = false;
  stepAnimations(now);
  stage.controls.update();
  stage.renderer.render(stage.scene, stage.camera);
  if (hasRunningAnimations()) requestRender();
}

// Höchstens ein Bild pro Bildschirm-Takt anfordern
export function requestRender() {
  if (renderPending || stage === null) return;
  renderPending = true;
  requestAnimationFrame(renderFrame);
}

// Den Zielwinkel so wählen, dass die Kamera den kürzeren Weg dreht
function getNearestAngle(fromAngle, toAngle) {
  const fullTurn = Math.PI * 2;
  return toAngle + fullTurn * Math.round((fromAngle - toAngle) / fullTurn);
}

// Kamera sanft auf die Seite des Spielers am Zug drehen; Höhe und Abstand bleiben
export function turnCameraTo(color) {
  const { camera, controls } = stage;
  const offset = camera.position.clone().sub(controls.target);
  const spherical = new THREE.Spherical().setFromVector3(offset);
  const startAngle = spherical.theta;
  const endAngle = getNearestAngle(startAngle, sideAngles[color]);
  animate(turnDuration, (progress) => {
    spherical.theta = startAngle + (endAngle - startAngle) * progress;
    camera.position.setFromSpherical(spherical).add(controls.target);
  });
  requestRender();
}
