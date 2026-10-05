# 🎮 Smart Tic-Tac-Toe — C++ AI + Node.js Backend

A full-stack Tic-Tac-Toe game with an unbeatable AI powered by a **C++ Minimax algorithm** (with alpha-beta pruning), served via a **Node.js/Express** backend, and a **dark-theme cyberpunk frontend**.

---

## 📁 Project Structure

```
tic-tac-toe/
├── frontend/
│   ├── index.html       ← Game UI
│   ├── style.css        ← Dark cyberpunk theme
│   └── script.js        ← Game logic + AI fallback (local minimax)
├── backend/
│   └── ai.cpp           ← C++ Minimax AI (compiled to ./backend/ai)
├── server/
│   └── app.js           ← Express server (port 3000)
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v16+ → https://nodejs.org
- **g++ compiler** (comes with GCC / MinGW / Xcode CLI tools)
  - Linux: `sudo apt install g++`
  - macOS: `xcode-select --install`
  - Windows: Install [MinGW-w64](https://www.mingw-w64.org/)

---

## 🚀 Setup & Run

### Step 1 — Install Node.js dependencies

```bash
cd tic-tac-toe
npm install
```

### Step 2 — Compile the C++ AI (optional — server does this automatically)

```bash
# Linux / macOS
g++ -O2 -o backend/ai backend/ai.cpp

# Windows
g++ -O2 -o backend/ai.exe backend/ai.cpp
```

### Step 3 — Start the server

```bash
node server/app.js
```

You should see:
```
✅ C++ AI compiled successfully
🎮 Smart Tic-Tac-Toe Server
   Local:  http://localhost:3000
```

### Step 4 — Open the game

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧠 How the AI Works

- The C++ program (`ai.cpp`) implements **Minimax with Alpha-Beta Pruning**
- It reads the board state from `stdin` (9 values: X, O, or _)
- It outputs the best move index (0–8) to `stdout`
- Node.js spawns it as a child process via `execFile`
- **Fallback**: If the backend is unreachable, the frontend uses its own JS Minimax implementation

---

## 🎮 Game Features

| Feature | Description |
|---|---|
| 🤖 AI Difficulty | Hard (unbeatable Minimax) or Easy (random+smart mix) |
| 🏆 Score tracking | Persistent across rounds |
| 🎨 Dark cyberpunk UI | Orbitron font, glow effects, scanlines |
| ✨ Animations | Pop-in, win pulse, result overlay |
| 🔄 Restart | Any time, or after game ends |

---

## 🌐 API Reference

### `POST /move`

Send the board state, receive the AI's best move.

**Request:**
```json
{
  "board": ["X", "O", "", "X", "", "", "", "O", ""]
}
```

**Response:**
```json
{
  "move": 4
}
```

### `GET /health`
Returns server status and whether C++ binary is compiled.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `g++ not found` | Install GCC or Xcode CLI tools |
| AI always loses | Make sure C++ compiled without errors |
| CORS error | Make sure backend is running on port 3000 |
| `Cannot GET /` | Open `http://localhost:3000`, not the HTML file directly |
