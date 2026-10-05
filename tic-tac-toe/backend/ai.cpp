#include <iostream>
#include <vector>
#include <string>
#include <climits>
#include <sstream>

using namespace std;

// Board: 9 values — "X", "O", or "" (empty)
vector<string> board(9);

const int WIN_PATTERNS[8][3] = {
    {0,1,2},{3,4,5},{6,7,8},
    {0,3,6},{1,4,7},{2,5,8},
    {0,4,8},{2,4,6}
};

// Returns "X", "O", "draw", or "" (ongoing)
string evaluate() {
    for (auto& p : WIN_PATTERNS) {
        if (!board[p[0]].empty() && board[p[0]] == board[p[1]] && board[p[1]] == board[p[2]])
            return board[p[0]];
    }
    bool hasFree = false;
    for (auto& cell : board) if (cell.empty()) { hasFree = true; break; }
    return hasFree ? "" : "draw";
}

// Alpha-beta minimax
int minimax(bool isMax, int depth, int alpha, int beta) {
    string result = evaluate();
    if (result == "O") return 10 - depth;
    if (result == "X") return depth - 10;
    if (result == "draw") return 0;

    if (isMax) {
        int best = INT_MIN;
        for (int i = 0; i < 9; i++) {
            if (!board[i].empty()) continue;
            board[i] = "O";
            best = max(best, minimax(false, depth + 1, alpha, beta));
            board[i] = "";
            alpha = max(alpha, best);
            if (beta <= alpha) break;
        }
        return best;
    } else {
        int best = INT_MAX;
        for (int i = 0; i < 9; i++) {
            if (!board[i].empty()) continue;
            board[i] = "X";
            best = min(best, minimax(true, depth + 1, alpha, beta));
            board[i] = "";
            beta = min(beta, best);
            if (beta <= alpha) break;
        }
        return best;
    }
}

int bestMove() {
    int bestVal = INT_MIN, move = -1;
    for (int i = 0; i < 9; i++) {
        if (!board[i].empty()) continue;
        board[i] = "O";
        int val = minimax(false, 0, INT_MIN, INT_MAX);
        board[i] = "";
        if (val > bestVal) { bestVal = val; move = i; }
    }
    return move;
}

int main() {
    // Read 9 values from stdin: e.g.  X O X  O    X   O X
    // Each value is "X", "O", or "_" (underscore = empty)
    for (int i = 0; i < 9; i++) {
        string val;
        cin >> val;
        board[i] = (val == "_") ? "" : val;
    }

    string status = evaluate();
    if (!status.empty()) {
        // Game already over — no move
        cout << -1 << endl;
        return 0;
    }

    cout << bestMove() << endl;
    return 0;
}
