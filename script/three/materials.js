// Farben und Materialien der 3D-Ansicht an einer Stelle (gleiche Palette wie css/standard.css)
import * as THREE from "three";

export const palette = {
  background: "#141312", // Bakelit: Seitenhintergrund
  case: "#1f1d1a", // Bakelit: Sockel des Bretts
  squareLight: "#ece6d6", // helle Felder: Elfenbein
  squareDark: "#7a766c", // dunkle Felder: helles Graphit
  brass: "#b08d57", // Messing: Rahmen, Ringe, Markierungen
  engraving: "#3a2c17", // Gravur der Koordinaten im Messing
  pieceWhite: "#f3ecdb", // weiße Figuren: glänzendes Elfenbein
  pieceBlack: "#2c2a27", // schwarze Figuren: Bakelit, nicht reines Schwarz
};

export const brassMaterial = new THREE.MeshStandardMaterial({
  color: palette.brass,
  metalness: 1,
  roughness: 0.35,
});

export const caseMaterial = new THREE.MeshStandardMaterial({
  color: palette.case,
  roughness: 0.45,
});

// Fokusrahmen für die Tastatur: dunkel, unabhängig vom Licht
export const focusMaterial = new THREE.MeshBasicMaterial({
  color: palette.background,
});
