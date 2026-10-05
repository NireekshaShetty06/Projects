const express = require('express');
const cors    = require('cors');
const { execFile, exec } = require('child_process');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Paths ─────────────────────────────────────────────────────────────────────
const AI_SRC = path.join(__dirname, '../backend/ai.cpp');
const AI_BIN = path.join(__dirname, '../backend/ai');

// ── Compile C++ on startup ────────────────────────────────────────────────────
function compileAI() {
  return new Promise((resolve, reject) => {
    const cmd = `g++ -O2 -o "${AI_BIN}" "${AI_SRC}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('❌ C++ compilation failed:\n', stderr);
        reject(new Error('Compilation failed: ' + stderr));
      } else {
        console.log('✅ C++ AI compiled successfully →', AI_BIN);
        resolve();
      }
    });
  });
}

// ── POST /move ────────────────────────────────────────────────────────────────
// Body: { board: ["X","O","","X","","","","O",""] }
app.post('/move', (req, res) => {
  const { board } = req.body;

  if (!Array.isArray(board) || board.length !== 9) {
    return res.status(400).json({ error: 'board must be an array of 9 elements' });
  }

  // Convert to underscore-delimited string for stdin
  const input = board.map(v => (v === '' || v === null || v === undefined) ? '_' : v).join('\n');

  const child = execFile(AI_BIN, { timeout: 5000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('AI process error:', err.message);
      return res.status(500).json({ error: 'AI process failed', detail: err.message });
    }

    const move = parseInt(stdout.trim(), 10);
    if (isNaN(move) || move < -1 || move > 8) {
      return res.status(500).json({ error: 'Invalid move from AI', raw: stdout });
    }

    res.json({ move });
  });

  child.stdin.write(input);
  child.stdin.end();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ai_compiled: fs.existsSync(AI_BIN) }));

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await compileAI();
  } catch (e) {
    console.warn('⚠️  Running without C++ AI (frontend will use local JS minimax fallback)');
  }

  app.listen(PORT, () => {
    console.log(`\n🎮 Smart Tic-Tac-Toe Server`);
    console.log(`   Local:  http://localhost:${PORT}`);
    console.log(`   API:    POST http://localhost:${PORT}/move`);
    console.log(`   Health: http://localhost:${PORT}/health\n`);
  });
}

start();
