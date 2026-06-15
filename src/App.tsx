import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  RotateCcw, 
  Copy, 
  Check, 
  Info, 
  Sparkles, 
  Code, 
  Lightbulb, 
  BookOpen, 
  Clock, 
  Layers, 
  Laptop, 
  TerminalSquare, 
  ChevronRight, 
  Cpu,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { pythonSourceCode } from "./tic_tac_toe_python_source";

interface TerminalLine {
  text: string;
  type: "stdout" | "input" | "error" | "status" | "success";
}

interface SystemLog {
  timestamp: string;
  message: string;
  color: string;
}

export default function App() {
  // Game states and core boards
  const [board, setBoard] = useState<string[]>(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [gameState, setGameState] = useState<"PLAYING" | "REMATCH" | "TERMINATED">("PLAYING");
  
  // Scoring Metrics state
  const [scores, setScores] = useState({ X: 0, O: 0 });
  
  // Interactive logs lists
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  
  // Right container layout tab selector ("logs" vs "code")
  const [activeRightTab, setActiveRightTab] = useState<"logs" | "code">("logs");
  const [copied, setCopied] = useState(false);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0);
  
  // Precise real-time kernel clock
  const [runtimeStr, setRuntimeStr] = useState("00:00:00.00");
  
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // Live ticking Kernel Clock simulator
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, "0");
      const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, "0");
      const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, "0");
      const ms = Math.floor((elapsed % 1000) / 10).toString().padStart(2, "0");
      setRuntimeStr(`${hours}:${mins}:${secs}.${ms}`);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Safe terminal scrolls
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Append new lines to Python Emulator screen
  const addTerminalLines = (lines: { text: string; type: TerminalLine["type"] }[]) => {
    setTerminalLines((prev) => [...prev, ...lines]);
  };

  const getBoardStringArray = (b: string[]) => {
    return [
      ` ${b[0]} | ${b[1]} | ${b[2]} `,
      `-----------`,
      ` ${b[3]} | ${b[4]} | ${b[5]} `,
      `-----------`,
      ` ${b[6]} | ${b[7]} | ${b[8]} `
    ];
  };

  const printBoardInTerminal = (b: string[]) => {
    const lines = getBoardStringArray(b);
    addTerminalLines([
      { text: "", type: "stdout" },
      { text: lines[0], type: "stdout" },
      { text: lines[1], type: "stdout" },
      { text: lines[2], type: "stdout" },
      { text: lines[3], type: "stdout" },
      { text: lines[4], type: "stdout" },
      { text: "", type: "stdout" }
    ]);
  };

  // Logic win conditions matching python code
  const checkWin = (b: string[], player: "X" | "O") => {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const condition of winConditions) {
      const [a, bIndex, c] = condition;
      if (b[a] === player && b[bIndex] === player && b[c] === player) {
        return true;
      }
    }
    return false;
  };

  const checkTie = (b: string[]) => {
    return b.every((spot) => spot === "X" || spot === "O");
  };

  // Setup/Restart simulator matching standard python terminal logic
  const handleRestartKernel = () => {
    const initialBoard = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    setBoard(initialBoard);
    setCurrentPlayer("X");
    setGameState("PLAYING");
    setCurrentInputValue("");

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    // Reset simulator log lines
    setTerminalLines([
      { text: `visitor@python-sandbox:~$ python3 tictactoe.py`, type: "status" },
      { text: "===============================", type: "stdout" },
      { text: "    WELCOME TO TIC-TAC-TOE!    ", type: "stdout" },
      { text: "===============================", type: "stdout" },
      { text: "Two players will take turns.", type: "stdout" },
      { text: "Player 1 is 'X', Player 2 is 'O'.", type: "stdout" },
      { text: "Enter a position from 1 to 9 corresponding to the board layout:\n", type: "stdout" },
      { text: " 1 | 2 | 3 ", type: "stdout" },
      { text: "-----------", type: "stdout" },
      { text: " 4 | 5 | 6 ", type: "stdout" },
      { text: "-----------", type: "stdout" },
      { text: " 7 | 8 | 9 ", type: "stdout" },
      { text: "===============================\n", type: "stdout" },
    ]);

    setSystemLogs([
      { timestamp: timeStr, message: "INIT_BOARD_SUCCESS", color: "text-[#6c7281]" },
      { timestamp: timeStr, message: "P1 TURN (ACTIVE: 'X')", color: "text-[#00f2ff]" }
    ]);

    setTimeout(() => {
      printBoardInTerminal(initialBoard);
      addTerminalLines([
        { text: "Player 'X' turn.", type: "stdout" }
      ]);
    }, 60);
  };

  // Trigger boot on mount
  useEffect(() => {
    handleRestartKernel();
  }, []);

  // Central Game Move Resolver
  const executeMove = (positionIndex: number) => {
    if (gameState !== "PLAYING") return;
    
    // Check occupancy
    const visualPositionLabel = (positionIndex + 1).toString();
    if (board[positionIndex] === "X" || board[positionIndex] === "O") {
      addTerminalLines([
        { text: visualPositionLabel, type: "input" },
        { text: `Error: Spot '${visualPositionLabel}' is already occupied. Select another one.`, type: "error" }
      ]);
      return;
    }

    // Execute move
    addTerminalLines([
      { text: visualPositionLabel, type: "input" }
    ]);

    const nextBoard = [...board];
    nextBoard[positionIndex] = currentPlayer;
    setBoard(nextBoard);

    // Register active System Event Log with nice styled color
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const playerStyle = currentPlayer === "X" ? "text-[#00f2ff]" : "text-[#ff00d4]";
    
    const newSystemLogs = [
      { timestamp: timeStr, message: `P${currentPlayer === "X" ? "1" : "2"} SELECT POSITION ${visualPositionLabel}`, color: playerStyle }
    ];

    if (checkWin(nextBoard, currentPlayer)) {
      // Dynamic metric increment
      setScores((prev) => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + 1
      }));

      newSystemLogs.push({
        timestamp: timeStr,
        message: `MATCH_RESOLVED // WINNER: PLAYER_${currentPlayer === "X" ? "1" : "2"} (${currentPlayer})`,
        color: "text-[#00ff9d] border-b border-[#00ff9d]/30"
      });
      setSystemLogs((prev) => [...prev, ...newSystemLogs]);

      printBoardInTerminal(nextBoard);
      addTerminalLines([
        { text: "🎉 CONGRATULATIONS! 🎉", type: "success" },
        { text: `Player '${currentPlayer}' has won the game!\n`, type: "success" },
        { text: "Care for a rematch? (y/n): ", type: "stdout" }
      ]);
      setGameState("REMATCH");
    } else if (checkTie(nextBoard)) {
      newSystemLogs.push({
        timestamp: timeStr,
        message: "MATCH_RESOLVED // STATUS: DRAW TIE_GAME",
        color: "text-amber-400 border-b border-amber-400/30"
      });
      setSystemLogs((prev) => [...prev, ...newSystemLogs]);

      printBoardInTerminal(nextBoard);
      addTerminalLines([
        { text: "🤝 IT'S A TIE GAME! 🤝", type: "success" },
        { text: "All board positions are filled. Well played!\n", type: "success" },
        { text: "Care for a rematch? (y/n): ", type: "stdout" }
      ]);
      setGameState("REMATCH");
    } else {
      // Switch turns
      const nextPlayer = currentPlayer === "X" ? "O" : "X";
      setCurrentPlayer(nextPlayer);

      newSystemLogs.push({
        timestamp: timeStr,
        message: `WAITING FOR P${nextPlayer === "X" ? "1" : "2"} (${nextPlayer})...`,
        color: nextPlayer === "X" ? "text-[#00f2ff]/80" : "text-[#ff00d4]/80"
      });
      setSystemLogs((prev) => [...prev, ...newSystemLogs]);

      printBoardInTerminal(nextBoard);
      addTerminalLines([
        { text: `Player '${nextPlayer}' turn.`, type: "stdout" }
      ]);
    }
  };

  // Keyboard Console prompt submit handler
  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = currentInputValue.trim();
    setCurrentInputValue("");
    if (!input) return;

    if (gameState === "PLAYING") {
      // Validate bounds 1-9
      const isValid = /^[1-9]$/.test(input);
      if (!isValid) {
        addTerminalLines([
          { text: input, type: "input" },
          { text: "Error: Invalid entry. Please enter a single number from 1 to 9.", type: "error" }
        ]);
        return;
      }
      const spotIndex = parseInt(input, 10) - 1;
      executeMove(spotIndex);
    } else if (gameState === "REMATCH") {
      addTerminalLines([{ text: input, type: "input" }]);
      const lower = input.toLowerCase();
      if (lower === "y" || lower === "yes" || lower === "play" || lower === "rematch") {
        addTerminalLines([{ text: "\nResetting the board...", type: "status" }]);
        setTimeout(() => {
          handleRestartKernel();
        }, 300);
      } else {
        addTerminalLines([
          { text: "\nThank you for playing Tic-Tac-Toe! Goodbye.", type: "status" }
        ]);
        setGameState("TERMINATED");
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(pythonSourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const educationalInsights = [
    {
      title: "1. 3x3 Grid List mapping",
      desc: "To keep the implementation simple, we map a flat Python List of 9 string items to represent rows and columns on a 2D plane.",
      pythonSnippet: "# Fresh board with elements '1' to '9'\nboard = [str(i) for i in range(1, 10)]\n\n# Positions index maps: 1 -> 0, 2 -> 1, ..., 9 -> 8\nposition = int(move_input) - 1"
    },
    {
      title: "2. Winning combinations",
      desc: "To check if a player won, we compile a list of indices representing winning row, column, and diagonal matches, check if all three values are identical and match the active player.",
      pythonSnippet: "win_conditions = [\n    (0, 1, 2), (3, 4, 5), (6, 7, 8),  # Rows\n    (0, 3, 6), (1, 4, 7), (2, 5, 8),  # Columns\n    (0, 4, 8), (2, 4, 6)              # Diagonals\n]\n\nfor a, b, c in win_conditions:\n    if board[a] == board[b] == board[c] == player:\n        return True"
    },
    {
      title: "3. Console Input Validation Loop",
      desc: "Beginners often forget input validation. Python is prone to crashes when casting with int() if users enter non-numeric texts. A nested while-loop validates standard bounds.",
      pythonSnippet: "while True:\n    move_input = input(\"Choose a spot (1-9): \").strip()\n    \n    # Guard check: Ensure it is a valid single digit\n    if not (move_input.isdigit() and len(move_input) == 1 and '1' <= move_input <= '9'):\n        print(\"Error: Invalid entry. Enter 1-9.\")\n        continue\n    \n    # Success exit point!\n    break"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-[#e0e0e0] font-mono flex flex-col justify-start">
      
      {/* Immersive Outer Framer */}
      <div className="w-full max-w-[1300px] mx-auto min-h-screen lg:min-h-[850px] bg-[#050608] flex flex-col border-0 md:border-8 border-[#1a1c23] shadow-2xl overflow-hidden">
        
        {/* Dynamic Header Section */}
        <header className="h-auto md:h-16 bg-[#0a0c14] border-b border-[#222632] flex flex-col md:flex-row items-stretch md:items-center justify-between px-6 py-4 md:py-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] select-none gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_#27c93f]" />
            </div>
            <div className="h-4 w-[1px] bg-[#222632] mx-2 hidden sm:block" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-xs font-bold tracking-widest text-[#6c7281] uppercase">
                Python_Console // TicTacToe.py
              </span>
              <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-[#1c1f2e] text-[#00f2ff] border border-[#222632] rounded">
                py v3.12
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 justify-between md:justify-end">
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-[#4a4f5d] uppercase tracking-wider leading-none">Kernel Runtime</span>
                <span className="text-xs text-[#00ff9d] glow-text font-bold">
                  {runtimeStr}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-[#222632]" />
            </div>
            
            <button 
              onClick={handleRestartKernel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1c23] hover:bg-[#222632] text-xs font-semibold tracking-wider text-slate-300 border border-[#303645] rounded-md transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>RESTART_KERNEL</span>
            </button>
          </div>
        </header>

        {/* Core Layout Panels */}
        <div className="flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden">
          
          {/* Aside left panel: Player metrics & metadata guidelines (Sidebar w-72) */}
          <aside className="w-full lg:w-72 bg-[#080a0f] border-b lg:border-b-0 lg:border-r border-[#222632] p-6 lg:p-8 flex flex-col gap-6 select-none shrink-0">
            <div>
              <h2 className="text-[10px] text-[#4a4f5d] uppercase tracking-[0.2em] mb-4 font-bold">
                Player Metrics
              </h2>
              <div className="space-y-4">
                
                {/* Player 1 Box (X) */}
                <div className={`p-4 rounded-lg bg-[#0d1017] border-l-4 transition-all duration-300 ${
                  currentPlayer === "X" && gameState === "PLAYING"
                    ? "border-[#00f2ff] shadow-[10px_0_15px_-10px_rgba(0,242,255,0.15)] ring-1 ring-[#00f2ff]/10" 
                    : "border-slate-800 opacity-60"
                }`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-[#00f2ff] tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse"></span>
                      PLAYER_1 (X)
                    </span>
                    <span className="text-lg font-bold text-white font-mono bg-[#161a24] px-2 py-0.5 rounded border border-slate-800">
                      {scores.X.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6c7281] mb-2 font-sans">
                    Python input command state marker
                  </div>
                  <div className="h-1 w-full bg-[#161a24] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00f2ff] transition-all duration-500 shadow-[0_0_10px_#00f2ff]"
                      style={{ width: `${Math.min(100, (scores.X / (scores.X + scores.O || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Player 2 Box (O) */}
                <div className={`p-4 rounded-lg bg-[#0d1017] border-l-4 transition-all duration-300 ${
                  currentPlayer === "O" && gameState === "PLAYING"
                    ? "border-[#ff00d4] shadow-[10px_0_15px_-10px_rgba(255,0,212,0.15)] ring-1 ring-[#ff00d4]/10" 
                    : "border-slate-800 opacity-60"
                }`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-[#ff00d4] tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff00d4] animate-pulse"></span>
                      PLAYER_2 (O)
                    </span>
                    <span className="text-lg font-bold text-white font-mono bg-[#161a24] px-2 py-0.5 rounded border border-slate-800">
                      {scores.O.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6c7281] mb-2 font-sans">
                    Python input command state marker
                  </div>
                  <div className="h-1 w-full bg-[#161a24] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff00d4] transition-all duration-500 shadow-[0_0_10px_#ff00d4]"
                      style={{ width: `${Math.min(100, (scores.O / (scores.X + scores.O || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Quick specifications / instructions */}
            <div className="mt-auto hidden lg:flex flex-col gap-4">
              <div className="p-4 bg-[#0d1017] border border-[#222632] rounded-lg">
                <span className="block text-[9px] text-[#4a4f5d] font-bold tracking-wider mb-2">
                  ACTIVE_SESSION
                </span>
                <p className="text-[11px] leading-relaxed text-[#8c92a1] font-sans">
                  {gameState === "PLAYING" ? (
                    <>
                      Waiting for Player <strong className="text-white">{currentPlayer === "X" ? "1 (X)" : "2 (O)"}</strong> to choose...<br/>
                      Selection input: <code className="text-[#00f2ff] font-mono">[1-9]</code>
                    </>
                  ) : gameState === "REMATCH" ? (
                    <>
                      Match resolved!<br/>
                      Enter <code className="text-[#00ff9d] font-mono">y</code> for a fresh rematch!
                    </>
                  ) : (
                    <span className="text-rose-400">Execution completed.</span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-[#0a0c14] border border-[#222632]/80 rounded-lg text-[10px] text-[#6c7281] space-y-1">
                <span className="font-bold text-slate-400 block mb-1">PROGRAM SCOPE PRESETS:</span>
                <div>• Pure Python v3 Compliant</div>
                <div>• Auto Win/Tie matrix checks</div>
                <div>• Prompt loops persistence</div>
              </div>
            </div>
          </aside>

          {/* Central Panel: The Interactive Grid & Embedded Console Log simulator */}
          <section className="flex-1 bg-[#050608] flex flex-col p-4 sm:p-6 lg:p-8 justify-between relative overflow-y-auto">
            
            {/* Grid Ambient glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[241px] sm:w-[450px] sm:h-[450px] bg-[#00f2ff]/3 opacity-[0.04] blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

            {/* Part 1: High Fidelity Interactively Playable 3x3 Grid */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 select-none z-10">
              
              <div className="grid grid-cols-3 grid-rows-3 gap-3 p-4 bg-[#0a0c14] border border-[#222632] rounded-xl shadow-2xl relative">
                {board.map((spot, index) => {
                  const isX = spot === "X";
                  const isO = spot === "O";
                  const isEmpty = !isX && !isO;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => executeMove(index)}
                      disabled={gameState !== "PLAYING"}
                      className={`w-20 h-20 sm:w-28 sm:h-28 rounded-lg flex items-center justify-center transition-all bg-[#0d1017] border border-[#1a1e26] ${
                        gameState === "PLAYING" && isEmpty 
                          ? "hover:bg-[#111624] hover:border-[#00f2ff]/30 cursor-pointer active:scale-95" 
                          : "cursor-not-allowed"
                      }`}
                    >
                      {isX ? (
                        <span className="text-5xl sm:text-6xl text-[#00f2ff] font-bold drop-shadow-[0_0_15px_rgba(0,242,255,0.6)] glow-cyan animate-fade-in">
                          X
                        </span>
                      ) : isO ? (
                        <span className="text-5xl sm:text-6xl text-[#ff00d4] font-bold drop-shadow-[0_0_15px_rgba(255,0,212,0.6)] glow-magenta animate-fade-in">
                          O
                        </span>
                      ) : (
                        <span className="text-xl sm:text-2xl text-[#1a1e26] group-hover:text-[#4a4f5d] font-bold transition-colors select-none">
                          {spot}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic instruction badge below grid */}
              <div className="mt-6 px-5 py-2 border border-[#222632] rounded-full bg-[#0a0c14] text-[11px] text-[#6c7281] flex items-center gap-2 max-w-lg text-center">
                <span className="text-[#00f2ff] font-bold shrink-0">PROMPT INDICATOR:</span>
                {gameState === "PLAYING" ? (
                  <span>
                    Player {currentPlayer === "X" ? "1 (X)" : "2 (O)"}, select cell <strong className="text-white bg-[#1a1c23] px-1 py-0.5 rounded font-mono">[1-9]</strong> or click tile.
                  </span>
                ) : gameState === "REMATCH" ? (
                  <span className="text-[#00ff9d] animate-pulse">
                    Rematch pending. Type <strong className="text-white bg-slate-900 px-1 rounded">y</strong> or click rematch options.
                  </span>
                ) : (
                  <span>Script executed successfully.</span>
                )}
              </div>
            </div>

            {/* Part 2: Interactive Terminal Simulator Drawer built into the bottom of Central Grid */}
            <div className="w-full bg-[#080a10] border border-[#222632] rounded-lg overflow-hidden flex flex-col max-h-[220px] shadow-lg z-10">
              <div className="bg-[#0c0e18] px-3.5 py-2 flex items-center justify-between border-b border-[#222632] text-[10px] text-[#6c7281] font-bold uppercase select-none">
                <div className="flex items-center gap-1.5">
                  <TerminalSquare className="w-3.5 h-3.5 text-[#00f2ff]" />
                  <span>Interactive Python Console Simulator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"></span>
                  <span className="normal-case font-mono">Stdout / Stdin channel</span>
                </div>
              </div>

              {/* Console log box container */}
              <div 
                ref={terminalScrollRef}
                className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-[11px] bg-[#040508]"
                style={{ height: "130px" }}
              >
                {terminalLines.map((line, idx) => {
                  if (line.type === "input") {
                    return (
                      <div key={idx} className="flex flex-row items-center gap-1.5 py-0.5">
                        <span className="text-[#00f2ff]">Choose a spot (1-9):</span>
                        <span className="text-white font-bold bg-[#1a1c23] px-1.5 py-0.2 rounded border border-[#303645]">
                          {line.text}
                        </span>
                      </div>
                    );
                  }
                  if (line.type === "error") {
                    return (
                      <div key={idx} className="text-rose-400 font-bold flex items-center gap-1.5 py-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{line.text}</span>
                      </div>
                    );
                  }
                  if (line.type === "success") {
                    return (
                      <div key={idx} className="text-[#00ff9d] font-bold flex items-center gap-1 py-0.5">
                        <span>{line.text}</span>
                      </div>
                    );
                  }
                  if (line.type === "status") {
                    return (
                      <div key={idx} className="text-indigo-300 py-0.5 font-semibold text-[10px] uppercase tracking-wide">
                        {line.text}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="text-[#a4a9b8] whitespace-pre-wrap leading-tight">
                      {line.text}
                    </div>
                  );
                })}

                {/* Live typing console input line */}
                {gameState !== "TERMINATED" && (
                  <form onSubmit={handleConsoleSubmit} className="flex items-center gap-1.5 pt-1">
                    <span className="text-emerald-400 font-bold select-none cursor-text">
                      {gameState === "PLAYING" ? "Choose a spot (1-9):" : "Care for a rematch? (y/n):"}
                    </span>
                    <input
                      ref={terminalInputRef}
                      type="text"
                      className="bg-transparent text-white focus:outline-none border-none p-0 flex-1 font-bold caret-emerald-400 focus:ring-0 focus:border-none selection:bg-[#00f2ff]/30 text-[11px]"
                      placeholder="Type & Press Enter..."
                      value={currentInputValue}
                      onChange={(e) => setCurrentInputValue(e.target.value)}
                      maxLength={6}
                    />
                  </form>
                )}
              </div>

              {/* Console Quick Helper Keys */}
              {gameState === "REMATCH" && (
                <div className="bg-[#0a0c14] px-3 py-2 border-t border-[#222632] flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Wanna rematch? Click fast:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addTerminalLines([{ text: "y", type: "input" }]);
                        setTimeout(() => handleRestartKernel(), 200);
                      }}
                      className="px-2.5 py-0.5 bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/30 rounded font-bold text-[10px]"
                    >
                      Rematch (Yes)
                    </button>
                    <button
                      onClick={() => {
                        addTerminalLines([{ text: "n", type: "input" }]);
                        setGameState("TERMINATED");
                      }}
                      className="px-2.5 py-0.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 rounded font-bold text-[10px]"
                    >
                      Exit (No)
                    </button>
                  </div>
                </div>
              )}
            </div>

          </section>

          {/* Right Panel: Coordinated system metrics, active execution log, & collapsible python code explorer */}
          <aside className="w-full lg:w-[420px] bg-[#080a0f] border-t lg:border-t-0 lg:border-l border-[#222632] flex flex-col">
            
            {/* Panel Tab Toggle */}
            <div className="bg-[#0a0c14] border-b border-[#222632] flex text-xs select-none">
              <button
                onClick={() => setActiveRightTab("logs")}
                className={`flex-1 py-3.5 text-center font-bold tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  activeRightTab === "logs"
                    ? "border-[#00f2ff] text-white bg-[#0e111a]"
                    : "border-transparent text-[#6c7281] hover:text-slate-300 hover:bg-slate-900/20"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>SYSTEM EVENTS LOG</span>
              </button>
              <button
                onClick={() => setActiveRightTab("code")}
                className={`flex-1 py-3.5 text-center font-bold tracking-wider transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  activeRightTab === "code"
                    ? "border-violet-500 text-white bg-[#0e111a]"
                    : "border-transparent text-[#6c7281] hover:text-slate-300 hover:bg-slate-900/20"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>CODE WORKBENCH</span>
              </button>
            </div>

            {/* Container log values */}
            <div className="flex-1 p-5 overflow-y-auto">
              
              {/* TAB 1: Real-time dynamic game session log */}
              {activeRightTab === "logs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4a4f5d] uppercase tracking-[0.15em] font-bold">
                       Execution Timeline Events
                    </span>
                    <span className="text-[10px] text-[#4a4f5d]">
                      Session standard active count
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px] max-h-[450px]">
                    {systemLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 items-start py-0.5 border-b border-[#141822]/40 pb-1">
                        <span className="text-[#6c7281] font-bold select-none shrink-0">
                          [{log.timestamp}]
                        </span>
                        <span className={`${log.color} break-all font-semibold`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#222632]/80">
                     <div className="p-3.5 bg-[#0d1017] rounded-lg border border-[#222632]/80">
                       <span className="text-[10px] font-bold text-[#00f2ff] block mb-1">LEARNING MOMENT //</span>
                       <p className="text-[11px] leading-relaxed text-[#6c7281] font-sans">
                         This UI is wired directly with real game state updates. Clicking or entering parameters registers custom event timestamps onto the cyber stream logger automatically, simulating micro-service execution triggers.
                       </p>
                     </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Python Source code companion list explorer with educational highlights */}
              {activeRightTab === "code" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4a4f5d] uppercase tracking-[0.15em] font-bold">
                      Source Explorer
                    </span>
                    <button
                      onClick={copyCode}
                      className={`px-3 py-1 text-[10px] font-bold rounded flex items-center gap-1 transition-all ${
                        copied
                          ? "bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/30"
                          : "bg-[#1a1c23] text-indigo-300 border border-[#303645] hover:bg-[#222632]"
                      }`}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "COPIED" : "COPY CODE"}</span>
                    </button>
                  </div>

                  {/* Quick Code topics switcher */}
                  <div className="grid grid-cols-1 gap-2">
                    {educationalInsights.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTopicIndex(index)}
                        className={`text-left p-2.5 rounded-lg text-[11px] transition-all border font-sans ${
                          activeTopicIndex === index
                            ? "bg-violet-950/20 text-violet-300 border-violet-800/60"
                            : "bg-[#0d1017] text-slate-400 border-[#222632] hover:bg-slate-900/30"
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-yellow-500 shrink-0" />
                          <span>{topic.title}</span>
                        </div>
                        <p className="text-[10px] text-[#8c92a1] mt-1 line-clamp-1">
                          {topic.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected topic code block */}
                  <div className="p-2.5 bg-[#040508] border border-[#222632] rounded-lg">
                    <span className="text-[9px] text-[#4a4f5d] uppercase tracking-wide block mb-1">
                      Active Guide Snippet:
                    </span>
                    <pre className="text-[10px] text-emerald-400 overflow-x-auto leading-relaxed max-w-full">
                      {educationalInsights[activeTopicIndex].pythonSnippet}
                    </pre>
                  </div>

                  {/* Code frame */}
                  <div>
                    <span className="text-[11px] text-[#4a4f5d] font-bold block mb-1">
                      Complete source list file (tic_tac_toe.py):
                    </span>
                    <div className="p-3 bg-[#040508] border border-[#222632] rounded-lg max-h-[220px] overflow-y-auto select-all scrollbar-thin">
                      <pre className="text-[10px] text-slate-400 leading-normal font-mono">
                        {pythonSourceCode}
                      </pre>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Code documentation tutorial link banner inside sidebar */}
            <div className="p-4 bg-[#0a0c14] border-t border-[#222632] flex items-center justify-between select-none shrink-0">
              <span className="text-[10px] text-[#6c7281] font-sans">
                Save code as <code className="text-[#00f2ff] font-mono">tic_tac_toe.py</code> to execute locally.
              </span>
              <a
                href="https://docs.python.org/3/tutorial/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#00ff9d] hover:underline flex items-center gap-0.5 font-bold"
              >
                <span>Python Docs</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            </div>

          </aside>

        </div>

        {/* Bottom Status bar panel */}
        <footer className="h-12 bg-[#050608] border-t border-[#1a1c23] flex items-center justify-between px-6 text-[10px] sm:text-[11px] select-none gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[#00f2ff] font-bold">λ</span>
            <span className="text-[#6c7281] font-mono hidden sm:inline">python3 tictactoe.py --mode=pvp</span>
            <span className="text-[#6c7281] font-mono sm:hidden">tictactoe.py --mode=pvp</span>
          </div>
          <div className="flex-1 h-[1px] bg-[#1a1c23] hidden md:block mx-4" />
          <div className="flex gap-4 items-center text-[#4a4f5d] font-mono shrink-0">
            <span>UTF-8</span>
            <span>Python 3.12.3</span>
            <span className="text-[#00ff9d] px-2 py-0.5 bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded font-bold">
              CONNECTED
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}
