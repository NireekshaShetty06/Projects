// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  board: Array(9).fill(''),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0 },
  difficulty: 'hard',   // 'hard' | 'easy'
  useBackend: true      // set false if backend not running
};

const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],   // rows
  [0,3,6],[1,4,7],[2,5,8],   // cols
  [0,4,8],[2,4,6]            // diags
];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const cells        = document.querySelectorAll('.cell');
const statusEl     = document.getElementById('status');
const resultOverlay= document.getElementById('result-overlay');
const resultText   = document.getElementById('result-text');
const resultIcon   = document.getElementById('result-icon');
const scoreX       = document.getElementById('score-x');
const scoreO       = document.getElementById('score-o');

// ── Board interaction ─────────────────────────────────────────────────────────
cells.forEach(cell => cell.addEventListener('click', () => {
  const idx = +cell.dataset.index;
  if (state.board[idx] || state.gameOver || state.currentPlayer !== 'X') return;
  placeMove(idx, 'X');
  if (!state.gameOver) scheduleAI();
}));

function placeMove(idx, player) {
  state.board[idx] = player;
  const cell = cells[idx];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase(), 'taken');

  const result = evaluate(state.board);
  if (result) { endGame(result); return; }

  state.currentPlayer = player === 'X' ? 'O' : 'X';
  setStatus(state.currentPlayer === 'X' ? 'YOUR TURN' : 'AI THINKING', state.currentPlayer === 'O' ? 'ai' : '');
}

// ── AI dispatch ───────────────────────────────────────────────────────────────
function scheduleAI() {
  setStatus('AI THINKING', 'ai');
  setTimeout(async () => {
    if (state.gameOver) return;
    let move;
    if (state.useBackend) {
      move = await fetchAIMove(state.board);
    }
    if (move === undefined || move === null) {
      move = state.difficulty === 'hard' ? bestMoveLocal(state.board) : randomMove(state.board);
    }
    if (move !== null && move !== undefined) placeMove(move, 'O');
  }, 450);
}

// ── Backend call ──────────────────────────────────────────────────────────────
async function fetchAIMove(board) {
  try {
    const res = await fetch('http://localhost:3000/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board })
    });
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    return data.move;
  } catch {
    // Silently fall back to local AI
    return undefined;
  }
}

// ── Local Minimax AI ──────────────────────────────────────────────────────────
function bestMoveLocal(board) {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = 'O';
    const score = minimax(board, 0, false, -Infinity, Infinity);
    board[i] = '';
    if (score > best) { best = score; move = i; }
  }
  return move;
}

function minimax(board, depth, isMax, alpha, beta) {
  const result = evaluate(board);
  if (result === 'O') return 10 - depth;
  if (result === 'X') return depth - 10;
  if (result === 'draw') return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = 'O';
      best = Math.max(best, minimax(board, depth+1, false, alpha, beta));
      board[i] = '';
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = 'X';
      best = Math.min(best, minimax(board, depth+1, true, alpha, beta));
      board[i] = '';
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function randomMove(board) {
  // Easy mode: 50% random, 50% smart
  if (Math.random() < 0.5) {
    const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)] ?? null;
  }
  return bestMoveLocal(board);
}

// ── Game evaluation ───────────────────────────────────────────────────────────
function evaluate(board) {
  for (const [a,b,c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  if (board.every(v => v)) return 'draw';
  return null;
}

function endGame(result) {
  state.gameOver = true;

  if (result !== 'draw') {
    // Highlight winning cells
    for (const [a,b,c] of WIN_PATTERNS) {
      if (state.board[a] === result && state.board[b] === result && state.board[c] === result) {
        [a,b,c].forEach(i => cells[i].classList.add('winner'));
        break;
      }
    }
    state.scores[result]++;
    scoreX.textContent = state.scores.X;
    scoreO.textContent = state.scores.O;
    scoreX.classList.toggle('bump', result === 'X');
    scoreO.classList.toggle('bump', result === 'O');
    setTimeout(() => { scoreX.classList.remove('bump'); scoreO.classList.remove('bump'); }, 400);
  }

  setTimeout(() => showResult(result), 600);
}

function showResult(result) {
  resultOverlay.classList.add('show');
  if (result === 'X') {
    resultIcon.textContent = '🏆';
    resultText.textContent = 'YOU WIN!';
    resultText.style.color = 'var(--x-color)';
  } else if (result === 'O') {
    resultIcon.textContent = '🤖';
    resultText.textContent = 'AI WINS!';
    resultText.style.color = 'var(--o-color)';
  } else {
    resultIcon.textContent = '🤝';
    resultText.textContent = 'DRAW!';
    resultText.style.color = 'var(--text-dim)';
  }
  setStatus(result === 'draw' ? 'DRAW' : result === 'X' ? 'YOU WIN' : 'AI WINS',
            result === 'draw' ? 'draw' : result === 'X' ? 'win' : 'ai');
}

// ── Restart ───────────────────────────────────────────────────────────────────
function restartGame() {
  state.board = Array(9).fill('');
  state.currentPlayer = 'X';
  state.gameOver = false;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  resultOverlay.classList.remove('show');
  setStatus('YOUR TURN', '');
}

document.getElementById('restart').addEventListener('click', restartGame);
document.getElementById('play-again').addEventListener('click', restartGame);

// ── Mode toggle ───────────────────────────────────────────────────────────────
document.getElementById('mode-hard').addEventListener('click', () => {
  state.difficulty = 'hard';
  document.getElementById('mode-hard').classList.add('active');
  document.getElementById('mode-easy').classList.remove('active');
  restartGame();
});
document.getElementById('mode-easy').addEventListener('click', () => {
  state.difficulty = 'easy';
  document.getElementById('mode-easy').classList.add('active');
  document.getElementById('mode-hard').classList.remove('active');
  restartGame();
});

// ── Helper ────────────────────────────────────────────────────────────────────
function setStatus(text, cls = '') {
  statusEl.textContent = text;
  statusEl.className = 'status-text ' + cls;
}
