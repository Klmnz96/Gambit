// Kleine Animations-Verwaltung: jede Animation bekommt einen Fortschritt t von 0 bis 1.
// Bei "Bewegung reduzieren" im System springt alles sofort ans Ziel.

const runningAnimations = [];
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// Schnell los, weich ankommen
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function animate(duration, onUpdate, onDone = () => {}) {
  if (reducedMotionQuery.matches || duration <= 0) {
    onUpdate(1);
    onDone();
    return;
  }
  runningAnimations.push({ start: performance.now(), duration, onUpdate, onDone });
}

// Wird einmal pro Bild aufgerufen; fertige Animationen fliegen aus der Liste
export function stepAnimations(now) {
  for (let index = runningAnimations.length - 1; index >= 0; index--) {
    const animation = runningAnimations[index];
    const progress = Math.min((now - animation.start) / animation.duration, 1);
    animation.onUpdate(easeOutCubic(progress));
    if (progress === 1) {
      runningAnimations.splice(index, 1);
      animation.onDone();
    }
  }
}

export function hasRunningAnimations() {
  return runningAnimations.length > 0;
}
