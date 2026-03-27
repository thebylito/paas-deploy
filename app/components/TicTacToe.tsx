"use client";

import { useCallback, useEffect, useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[];

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return null;
}

function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  const result = checkWinner(board);
  if (result?.winner === "O") return 10 - depth;
  if (result?.winner === "X") return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

function getBestMove(board: Board): number {
  let bestVal = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const moveVal = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winResult, setWinResult] = useState<{
    winner: Player;
    line: number[];
  } | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [lastMoved, setLastMoved] = useState<number | null>(null);

  const gameOver = winResult !== null || isDraw;
  const aiThinking = !isPlayerTurn && !gameOver;

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinResult(null);
    setIsDraw(false);
    setLastMoved(null);
  }, []);

  // AI move effect
  useEffect(() => {
    if (isPlayerTurn || gameOver) return;

    const timeout = setTimeout(() => {
      setBoard((prev) => {
        const newBoard = [...prev];
        const move = getBestMove(newBoard);
        if (move === -1) return prev;
        newBoard[move] = "O";
        setLastMoved(move);

        const result = checkWinner(newBoard);
        if (result) {
          setWinResult(result);
          setScores((s) => ({ ...s, ai: s.ai + 1 }));
        } else if (newBoard.every((c) => c !== null)) {
          setIsDraw(true);
          setScores((s) => ({ ...s, draws: s.draws + 1 }));
        }

        return newBoard;
      });
      setIsPlayerTurn(true);
    }, 450);

    return () => clearTimeout(timeout);
  }, [isPlayerTurn, gameOver]);

  function handleClick(index: number) {
    if (!isPlayerTurn || board[index] || gameOver || aiThinking) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setLastMoved(index);

    const result = checkWinner(newBoard);
    if (result) {
      setBoard(newBoard);
      setWinResult(result);
      setScores((s) => ({ ...s, player: s.player + 1 }));
      return;
    }
    if (newBoard.every((c) => c !== null)) {
      setBoard(newBoard);
      setIsDraw(true);
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      return;
    }

    setBoard(newBoard);
    setIsPlayerTurn(false);
  }

  function getStatusMessage() {
    if (winResult) {
      return winResult.winner === "X" ? "Você venceu! 🎉" : "A IA venceu! 🤖";
    }
    if (isDraw) return "Empate! 🤝";
    if (aiThinking) return "IA pensando...";
    if (isPlayerTurn) return "Sua vez";
    return "";
  }

  const statusMsg = getStatusMessage();

  return (
    <div className="flex flex-col items-center gap-8 select-none">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
          Jogo da Velha
        </h1>
        <p className="text-zinc-400 text-sm tracking-widest uppercase">
          Você vs IA
        </p>
      </div>

      {/* Score */}
      <div className="flex gap-6">
        <ScoreCard label="Você" value={scores.player} color="text-sky-400" />
        <ScoreCard label="Empates" value={scores.draws} color="text-zinc-400" />
        <ScoreCard label="IA" value={scores.ai} color="text-rose-400" />
      </div>

      {/* Status */}
      <div className="h-8 flex items-center">
        <span
          className={`text-base font-medium transition-all duration-300 ${
            winResult?.winner === "X"
              ? "text-sky-400"
              : winResult?.winner === "O"
                ? "text-rose-400"
                : isDraw
                  ? "text-amber-400"
                  : aiThinking
                    ? "text-zinc-500 animate-pulse"
                    : "text-zinc-300"
          }`}
        >
          {statusMsg}
        </span>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-3 p-1">
        {board.map((cell, i) => {
          const isWinCell = winResult?.line.includes(i);
          const isNew = lastMoved === i;
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || gameOver || aiThinking || !isPlayerTurn}
              className={`
                w-24 h-24 rounded-2xl text-4xl font-bold
                flex items-center justify-center
                transition-all duration-200
                ${
                  isWinCell
                    ? cell === "X"
                      ? "bg-sky-500/30 border-2 border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.4)]"
                      : "bg-rose-500/30 border-2 border-rose-400 shadow-[0_0_24px_rgba(251,113,133,0.4)]"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                }
                ${!cell && !gameOver && isPlayerTurn && !aiThinking ? "cursor-pointer active:scale-95" : "cursor-default"}
                ${isNew ? "animate-pop" : ""}
              `}
            >
              {cell === "X" && (
                <span className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">
                  ✕
                </span>
              )}
              {cell === "O" && (
                <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]">
                  ○
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reset */}
      <button
        onClick={resetGame}
        className="mt-2 px-8 py-3 rounded-full bg-white/10 border border-white/15 text-white text-sm font-medium
          hover:bg-white/15 hover:border-white/25 active:scale-95 transition-all duration-200 tracking-wide"
      >
        {gameOver ? "Jogar novamente" : "Reiniciar"}
      </button>

      {/* Legend */}
      <div className="flex gap-6 text-xs text-zinc-600">
        <span className="flex items-center gap-1.5">
          <span className="text-sky-500 font-bold">✕</span> Você (X)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-rose-500 font-bold">○</span> IA (O)
        </span>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 min-w-[72px]">
      <span className={`text-2xl font-bold tabular-nums ${color}`}>
        {value}
      </span>
      <span className="text-xs text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
