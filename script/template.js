// Template-Funktionen: geben nur HTML zurück, ohne eigene Logik
// (z. B. ein Feld des Bretts, eine Zeile der Zugliste)

function buildSquare(row, column, piece, stateClasses, label) {
  return `
    <button 
    class="square ${getSquareColorClass(row, column)} ${stateClasses}"
    type="button"
    data-row="${row}"
    data-column="${column}"
    aria-label="${label}"
    >
    ${getPieceHtml(piece)}
    ${getCoordinatesHtml(row, column)}
    </button>
    `;
}

// Ein Eintrag im Zugprotokoll: "1. e4 e5" (blackMove ist leer, solange Schwarz noch nicht gezogen hat)
function buildMovePair(moveNumber, whiteMove, blackMove) {
  return `<li class="move-pair"><span class="move-number">${moveNumber}.</span><span class="move">${whiteMove}</span><span class="move">${blackMove}</span></li>`;
}
