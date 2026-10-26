// Template-Funktionen: geben nur HTML zurück, ohne eigene Logik
// (z. B. ein Feld des Bretts, eine Zeile der Zugliste)

function buildSquare(row, column, piece) {
  return `
    <button 
    class="square ${getSquareColorClass(row, column)}"
    type="button"
    data-row="${row}"
    data-column="${column}"
    aria-label="${getSquareLabel(row, column, piece)}"
    >
    ${getPieceHtml(piece)}
    ${getCoordinatesHtml(row, column)}
    </button>
    `;
}
