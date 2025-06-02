const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const nameXInput = document.getElementById('nameX');
const nameOInput = document.getElementById('nameO');
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');

let currentPlayer = 'X';
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let mode = 'pvp';

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    mode = document.querySelector('input[name="mode"]:checked').value;
    nameOInput.style.display = mode === 'pvai' ? 'none' : 'inline';
    resetGame();
  });
});

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', resetGame);

function getPlayerName(symbol) {
  if (symbol === 'X') {
    return nameXInput.value.trim() || "Player X";
  } else {
    if (mode === "pvai") return "AI";
    return nameOInput.value.trim() || "Player O";
  }
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index] !== "") return;

  const player = currentPlayer;
  makeMove(index, player);
  if (checkWinner(player)) return;

  if (mode === "pvai" && currentPlayer === "O") {
    setTimeout(() => {
      const aiMove = getBestMove();
      makeMove(aiMove, "O");
      checkWinner("O");
    }, 300);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  clickSound.currentTime = 0;
  clickSound.play();
  currentPlayer = (player === "X") ? "O" : "X";
  statusText.textContent = `${getPlayerName(currentPlayer)}'s turn`;
}

function checkWinner(player) {
  for (const condition of winConditions) {
    if (condition.every(i => board[i] === player)) {
      condition.forEach(i => cells[i].classList.add('win'));
      const winnerName = getPlayerName(player);
      statusText.textContent = `🎉 ${winnerName} Wins!`;
      gameActive = false;
      launchFireworks(winnerName); // Pass winner name here
      return true;
    }
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    return false;
  }

  return false;
}



function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWinState("O", newBoard)) return 1;
  if (checkWinState("X", newBoard)) return -1;
  if (!newBoard.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        best = Math.max(score, best);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        best = Math.min(score, best);
      }
    }
    return best;
  }
}

function checkWinState(player, b) {
  return winConditions.some(cond => cond.every(i => b[i] === player));
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('win');
  });
  statusText.textContent = `${getPlayerName(currentPlayer)}'s turn`;
}


