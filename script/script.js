// Startpunkt: Spiel aufbauen, Klicks verarbeiten, Spielmodus wählen

let board = [];

function renderBoard() {
  const boardElement = document.querySelector("#board");
  let squaresHtml = "";

  board.forEach((boardRow, row) => {
    boardRow.forEach((piece, column) => {
      squaresHtml += buildSquare(row, column, piece);
    });
  });

  boardElement.innerHTML = squaresHtml;
}

function init() {
  board = createStartBoard();
  renderBoard();
}

init();
